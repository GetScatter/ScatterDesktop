<template>
	<section class="get-ridl transfer">
		<section v-if="ridlCycle && account">


			<section class="details">
				<i class="icon sidebar-sidebar_ridl"></i>
				<h2>Getting RIDL Tokens</h2>
				<span>
						While we don't actually sell the tokens, you can get them by donating to Scatter as a thank you.
			            Every 12 hours 170,000 RIDL is released to all donors. Depending on the amount you
			            donated vs. the total amount donated during that 12-hour period you get a portion of the 170,000 RIDL.
	            </span>
				<br>
				<br>
				<b>
					RIDL tokens are a utility token used solely for defining reputations within the RIDL system and are akin to an in-app scoring system.
					They are not a currency and do not provide any shares in any company, imply any investment, or hold any monetary value.
					If you are from the USA or China you are prohibited from claiming them.
				</b>

				<br>
				<br>

				<span @click="openTerms" class="terms">Please read the Terms & Conditions before donating.</span>
			</section>




			<section class="split-inputs">

				<section>
					<section class="boxes">
						<section class="box account-selector" style="width:100%;" @click="selectAccount">
							<section>
								<figure class="name">{{account.sendable()}}</figure>
								<figure class="network">{{account.network().name}}</figure>
							</section>
							<figure class="chevron icon-dot-3"></figure>
						</section>
					</section>
				</section>


				<section>
					<Input placeholder="0.0000 EOS" big="1" :text="buyRidlAmount" v-on:changed="x => buyRidlAmount = x" />
				</section>

			</section>


			<section class="split-inputs ridl-actions">
				<section class="info">
					<div>Your contributed: <b>{{eosContributions}}</b></div>
					You can claim <b>{{ridlContributions}}</b> at <b>{{(new Date(ridlCycle.ends*1000)).toTimeString().split(' ')[0]}}</b>
				</section>

				<section style="text-align:right;">
					<Button blue="1" big="1" @click.native="claim" text="Claim" v-if="claimableRidlAccounts.length" style="margin-top:5px;" />
					<Button big="1" @click.native="donate" text="Donate" />
				</section>
			</section>







		</section>

		<section class="disclaimer" v-else-if="!account">
			You don't have any EOS Mainnet accounts.
		</section>
	</section>
</template>

<script>
	import {mapState, mapGetters} from 'vuex';
	import RIDLService from "../../services/apis/RIDLService";
	import {Blockchains} from "../../models/Blockchains";
	import {Popup} from "../../models/popups/Popup";
	import PluginRepository from "../../plugins/PluginRepository";
	import PopupService from "../../services/utility/PopupService";
	import Account from "../../models/Account";
	import ElectronHelpers from "../../util/ElectronHelpers";
	require('../../styles/transfers.scss');

	// TODO: Automatic claiming
	export default {
		data(){return {
			buyRidlAmount:null,
			ridlCycle:null,
			account:null,
		}},
		computed:{
			...mapState([
				'scatter'
			]),
			...mapGetters([
				'accounts',
				'contacts',
				'identities',
				'networks',
			]),
			mainnetAccounts(){
				const network = this.networks.find(x => x.chainId === PluginRepository.plugin(Blockchains.EOSIO).getEndorsedNetwork().chainId);
				return this.accounts.filter(x => x.networkUnique === network.unique());
			},
			contributions(){
				if(!this.ridlCycle) return null;
				const total = parseFloat(this.ridlCycle.data.tokens.split(' ')[0]);
				const contri = this.ridlCycle.contributions.reduce((acc, x) => {
					x.rows.map(row => {
						if(row.cycle === this.ridlCycle.data.cycle){
							acc += parseFloat(row.tokens.split(' ')[0]);
						}
					})

					return acc;
				}, 0);
				return [parseFloat(contri || 0).toFixed(4), total];
			},
			ridlContributions(){
				if(!this.ridlCycle) return null;
				const num = parseFloat(this.contributions[0] / this.contributions[1] * 170000).toFixed(4);
				return isNaN(num) ? '0.0000' : this.formatNumber(num, true) + ' RIDL';
			},
			eosContributions(){
				if(!this.ridlCycle) return null;
				return parseFloat(this.contributions[0]).toFixed(4) + ' EOS';
			},
			claimableRidlAccounts(){
				if(!this.ridlCycle) return false;
				return this.ridlCycle.contributions.reduce((acc, x) => {
					if(x.rows.some(row => row.cycle !== this.ridlCycle.data.cycle)) acc.push(x.account);
					return acc;
				}, []);
			}
		},
		mounted(){
			this.getRidlCycleData();

			if(this.mainnetAccounts.length){
				this.account = this.mainnetAccounts[0];
			}

		},
		methods:{
			async getRidlCycleData(){
				const cycleData = await RIDLService.getCycleData();
				if(!cycleData) return;

				const started = 1531720800;
				const cycle = cycleData.cycle;
				const now = +new Date() / 1000;
				const lastCycleStarted = started + (cycle * (3600 * 12));
				const cycleEndsOn = lastCycleStarted + (12 * 3600);

				const contributions = await RIDLService.getRidlContributions();
				this.ridlCycle = {
					data:cycleData,
					contributions,
					ends:cycleEndsOn
				}
			},
			selectAccount(type){
				const network = this.networks.find(x => x.chainId === PluginRepository.plugin(Blockchains.EOSIO).getEndorsedNetwork().chainId);
				PopupService.push(Popup.selectAccount(account => {
					if(!account) return;
					this.account = account;
				}, network.accounts(true)));
			},
			async donate(){
				if(parseFloat(this.buyRidlAmount.split(' ')[0]) < 1) return PopupService.push(Popup.snackbar('1.0000 EOS Minimum'));
				this.setWorkingScreen(true);
				const donated = await RIDLService.donateToScatter(this.account, this.buyRidlAmount).catch(() => null);
				this.setWorkingScreen(false);
				if(donated) setTimeout(() => {
					this.getRidlCycleData();
				}, 1000);
			},
			async claim(){
				this.setWorkingScreen(true);
				const network = this.networks.find(x => x.chainId === PluginRepository.plugin(Blockchains.EOSIO).getEndorsedNetwork().chainId);
				const accounts = this.claimableRidlAccounts.map(name => this.accounts.find(x => x.network().unique() === network.unique() && name === x.name));
				const claimed = await RIDLService.claimRidlTokens(accounts).catch(() => null);
				this.setWorkingScreen(false);
				if(claimed) setTimeout(() => {
					this.getRidlCycleData();
				}, 1000);
			},
			openTerms(){
				ElectronHelpers.openLinkInBrowser('https://ridl.get-scatter.com/#/terms');
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.disclaimer {
		max-width:300px;
		margin:0 auto;
		font-size: 28px;
		color:$lightgrey;
		text-align:center;
	}

	.ridl-actions {
		display:flex;
		align-items: center;

		.info {
			font-size: $small;
		}
	}

	.get-ridl {
		height:calc(#{$fullheight} - 70px);
		padding:30px;
		display:flex;
		justify-content: center;
		align-items: center;

		.details {
			max-width:500px;
			text-align:center;
			margin:0 auto;
			line-height: $small;
			padding-bottom:50px;

			.icon {
				font-size: 64px;
				color:$blue;
				margin-bottom:10px;
				display:block;
			}

			span {
				font-size: $small;
			}

			b {
				font-size: $small;
				color:$red;
			}
		}

		.split-inputs {
			min-width:600px;

			> section {
				flex:1;
			}

			.account-selector {
				height:68px;
				margin-bottom:20px;
			}
		}

		.terms {
			text-decoration: underline;
			font-size: $medium;
			cursor: pointer;
		}
	}


</style>