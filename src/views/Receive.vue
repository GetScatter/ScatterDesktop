<template>
	<section class="receive">

		<section class="greyback" v-if="account">
			<section class="limit-width">
				<label>Receiving Account</label>
				<section class="boxes">
					<section class="box account-selector" @click="selectAccount">
						<section>
							<figure class="name">{{account.sendable()}}</figure>
							<figure class="network">{{account.network().name}}</figure>
						</section>
						<figure class="chevron icon-dot-3"></figure>
					</section>
				</section>
			</section>
		</section>

		<section class="whiteback" v-if="account">
			<section class="limit-width">
				<section class="boxes">
					<section class="box nested auto-width" v-if="qr">
						<img :src="qr" />
					</section>
					<section class="box nested data-box">
						<section>
							<label>Send funds to</label>
							<figure class="receiver">{{account.sendable()}}</figure>
						</section>

						<section>
							<figure class="small-info" v-if="account.blockchain() === Blockchains.EOSIO">
								Some exchanges will ask you for an addressTag, memo, or some other form of secondary input.
								You can enter anything in that field since this is a real EOSIO account.
							</figure>

							<Button blue="1" text="Copy to clipboard" @click.native="copy" />
						</section>
					</section>
				</section>
			</section>
		</section>

	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import PopupService from "../services/utility/PopupService";
	import {Popup} from "../models/popups/Popup";
	import QRService from "../services/secure/QRService";
	import {Blockchains} from "../models/Blockchains";
	import ElectronHelpers from "../util/ElectronHelpers";
	require('../styles/transfers.scss');

	export default {
		data(){return {
			account:null,
			qr:null,
			Blockchains,
		}},
		computed:{
			...mapGetters([
				'accounts',
			])
		},
		mounted(){
			if(this.$route.query.account){
				this.selectedAccount(this.accounts.find(x => x.identifiable() === this.$route.query.account));
			}

			if(!this.account){
				this.selectedAccount(this.accounts.sort((a,b) => b.totalFiatBalance() - a.totalFiatBalance())[0]);
			}
		},
		methods:{
			selectAccount(){
				PopupService.push(Popup.selectAccount(account => {
					if(!account) return;
					this.selectedAccount(account);
				}))
			},
			async selectedAccount(account){
				this.account = account;
				const qrData = {
					account:account.sendable(),
					blockchain:account.network().blockchain,
					chainId:account.network().chainId,
				}
				this.qr = await QRService.createUnEncryptedQR(qrData);
			},
			copy(){
				ElectronHelpers.copy(this.account.sendable());
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

</style>