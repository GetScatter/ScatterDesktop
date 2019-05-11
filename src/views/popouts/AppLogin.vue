<template>
	<section>

		<PopOutHead v-on:closed="returnResult" />
		<section class="popout-window app-login">

			<section>
				<section class="app-details">
					<figure class="logo">
						<img v-if="appData.img" :src="appData.img" />
						<span v-else>No Image</span>
					</figure>
					<figure class="name"><b>{{appData.name}}</b> will see:</figure>
				</section>

				<section class="requirements">
					<section class="requirement account">
						<section class="boxes">
							<section class="box account-selector" @click="selectTokenAndAccount"> <!--  -->
								<section>
									<figure class="name">{{account.sendable()}}</figure>
									<figure class="network">{{account.network().name}}</figure>
								</section>
								<figure class="chevron icon-dot-3"></figure>
							</section>
						</section>
					</section>
					<section class="requirement">
						<figure class="icon icon-eye"></figure>
						<figure class="text">Your first name, last name, and email.</figure>

						<figure class="icon bubble icon-help"></figure>
						<section class="bubble-explainer">
							<b>{{appData.name}}</b> is requesting personal information.
							It will only be able to see what is being requested, and nothing else you may have filled out in your Scatter identity.
						</section>
					</section>
				</section>
			</section>

			<section class="actions">
				<Button big="1" text="Cancel" @click.native="returnResult(null)" />
				<Button big="1" style="padding:0 40px;" blue="1" text="Allow" @click.native="login" />
			</section>

		</section>

	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import PopOutHead from '../../components/popouts/PopOutHead';
	import PopOutAction from '../../components/popouts/PopOutAction';
	import SearchBar from '../../components/reusable/SearchBar';
	import FullWidthRow from '../../components/reusable/FullWidthRow';
	import {IdentityRequiredFields} from "../../models/Identity";
	import Network from "../../models/Network";
	import RequiredFields from "../../components/popouts/RequiredFields";
	import RIDLService from "../../services/apis/RIDLService";
	import PopupService from "../../services/utility/PopupService";
	import {Popup} from "../../models/popups/Popup";
	require('../../styles/transfers.scss');

	export default {
		props:['popup', 'expanded'],
		components:{
			RequiredFields,
			PopOutHead,
			PopOutAction,
			FullWidthRow,
			SearchBar,
		},
		data () {return {
			account:null,

			selectedAccounts:[],
			searchTerms:'',
			selectedLocation:null,
			clonedLocation:null,
			selectedIdentity:null,
			showingAll:false,
			reputation:null,
		}},
		created(){

			if(this.validAccounts.length){
				this.account = this.validAccounts[0];
			}



			setTimeout(async() => {
				this.loadingReputation = true;
				this.reputation = await RIDLService.checkApp(this.popup.data.props.payload.origin);
				if(!this.reputation) this.reputation = await RIDLService.checkApp(this.popup.origin());
				this.loadingReputation = false;
			})

			this.selectedIdentity = this.identity.clone();
			this.selectedLocation = this.selectedIdentity.locations[0];
			this.clonedLocation = this.selectedIdentity.locations[0].clone();

			if(this.locationFields.length || this.personalFields.length){
				this.$emit('expanded');
			}
		},
		computed: {
			...mapState([
				'scatter',
				'balances'
			]),
			...mapGetters([
				'identity',
				'identities',
				'accounts',
				'networks'
			]),

			appData(){
				return this.popup.data.props.appData;
			},



			validAccounts(){
				let neededNetworks = this.accountRequirements.map(x => Network.fromJson(x).unique());

				this.selectedAccounts.map(acc => {
					neededNetworks.splice(neededNetworks.indexOf(acc.network().unique()), 1);
				});
				return this.accounts
					.filter(x => neededNetworks.includes(x.networkUnique))
					.sort((a,b) => b.authority === 'active' ? 1 : 0)
					.reduce((acc, account) => {
						if(!acc.find(x => account.network().unique() === x.network().unique()
							&& account.sendable() === x.sendable())) acc.push(account);

						return acc;
					}, [])
					.sort((a,b) => b.logins - a.logins)
			},






			payload(){ return this.popup.payload(); },

			isValidIdentity() {
				return this.selectedIdentity.hasRequiredFields(this.fields, this.clonedLocation);
			},
			fields() {
				return IdentityRequiredFields.fromJson(this.payload.fields);
			},

			accountFields(){
				return this.fields.accounts.map(rawNetwork => Network.fromJson(rawNetwork));
			},
			personalFields(){
				return this.fields.personal;
			},
			locationFields(){
				return this.fields.location;
			},
			missingFields(){
				if(!this.personalFields.length && !this.locationFields.length) return false;
				return !this.identity.hasRequiredFields(this.fields);
			},
			stillNeedsFields(){
				return this.accountRequirements.length === this.selectedAccounts.length && this.missingFields
			},


			accountNetworks(){
				return this.accountFields.reduce((acc, accountNetwork) => {
					const accNet = acc.find(x => x.network.unique() === accountNetwork.unique());
					if(!accNet){
						acc.push({
							count:1,
							network:this.networks.find(x => x.unique() === accountNetwork.unique())
						})
					} else {
						accNet.count++;
					}
					return acc;
				}, [])
			},


			identityRequirements() {
				return this.fields.personal.concat(this.fields.location).join(', ');
			},
			accountRequirements() {
				return this.fields.accounts || [];
			},
		},
		methods: {
			returnResult(result){
				this.$emit('returned', result);
			},



			selectTokenAndAccount(){
				PopupService.push(Popup.selectAccount(account => {
					if(!account) return;
					this.account = account;
				}, this.validAccounts))
			},

			login(){
				this.returnResult({
					identity:this.selectedIdentity,
					location:this.clonedLocation,
					accounts:[this.account],
					missingFields:this.missingFields
				});
			},






			selectLocation(location){
				this.selectedLocation = location;
				this.clonedLocation = location.clone();
			},
			selectAccount(account){
				if(account){
					if(this.selectedAccounts.find(x => x.unique() === account.unique())){
						return this.selectedAccounts = this.selectedAccounts
							.filter(x => x.unique() !== account.unique());
					}

					this.selectedAccounts.push(account);
				}

				if(this.accountRequirements.length > this.selectedAccounts.length) return;

				if(this.stillNeedsFields){
					if(!this.expanded){
						this.$emit('expanded', 300, true);
					}
				}

				if(this.isValidIdentity) {

					this.returnResult({
						identity:this.selectedIdentity,
						location:this.clonedLocation,
						accounts:this.selectedAccounts,
						missingFields:this.missingFields
					});
				}
			},
			selectedOfNetwork(network){
				return this.selectedAccounts.filter(x => x.network().unique() === network.unique())
			},
			networkAccountsCount(networkUnique){
				return this.accounts.filter(x => x.networkUnique === networkUnique).length;
			},

		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";




	.app-login {
		display:flex;
		justify-content: center;
		align-items: center;

		.app-details {
			text-align:center;
			display:flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-top:-60px;

			$logo:100px;
			.logo {
				display:flex;
				align-items: center;
				justify-content: center;
				height:$logo;
				width:$logo;
				border-radius:$radius;
				background: $lightergrey;
				border:1px solid $lightgrey;
				padding:5px;
				margin-bottom:20px;

				img {
					height:100%;
					width:100%;
				}

				span {
					font-size: $small;
					font-weight: bold;
					color:$silver;
				}
			}

			.name {
				font-size: $large;
			}
		}

		.requirements {
			margin-top:10px;
			min-width:400px;
			text-align:left;

			.boxes {
				width:100%;

				.box {
					width:100%;
				}

				padding-bottom:20px;
				border-bottom:1px solid $lightgrey;
			}

			.requirement {
				padding:10px 0;
				display:flex;
				align-items: center;
				position: relative;

				.icon {
					padding-right:10px;

					&.bubble {
						padding:3px 2px;
						border-radius:50%;
						background:$blue;
						border:1px solid $darkerblue;
						color:$white;
						font-size: $tiny;
						cursor: pointer;

						&:hover {
							~ .bubble-explainer {
								display:block;
							}
						}
					}
				}

				.bubble-explainer {
					position:absolute;
					right:-10px;
					bottom:40px;
					width:380px;
					font-size: $medium;
					background:$white;
					color:$black;
					box-shadow:0 2px 4px $blue-shadow, 0 8px 24px $blue-shadow;
					padding:20px;
					border-radius:$radius;
					display:none;
				}

				.text {
					flex:1;
					font-size: $small;
				}
			}
		}

		.actions {
			margin-top:30px;
			position:absolute;
			bottom:30px;
			right:30px;
		}
	}











	.required-networks {
		display:flex;
		flex:0 0 auto;
		padding:0 30px;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-bottom:10px;
		margin-top:-10px;

		.requirements {
			font-size: 11px;
			font-weight: bold;
		}

		.list {
			margin-top:10px;
			width:100%;
			max-height:45px;
			overflow: auto;
			padding-right:10px;

			.split-inputs {
				width:100%;

				&:not(:last-child){
					margin-bottom:5px;
				}

				figure {
					font-size: 13px;
					font-weight: bold;
				}

				.bubble {
					font-size: 11px;
					background:#fff;
					border:1px solid rgba(0,0,0,0.2);
					padding:3px 10px;
					border-radius:20px;
					font-weight: bold;

					&.red {
						background:$red;
						background-image: $red-gradient;
						border:1px solid #c93c3b;
						color:#fff;
					}

					&.blue {
						background:$secondary;
						background-image: $blue-grad;
						border:1px solid $blue;
						color:#fff;
					}
				}
			}
		}
	}





	.advanced-button {
		font-size: 11px;
		text-decoration: underline;
		padding-right:30px;
		cursor: pointer;

		&:hover {
			color: $blue;
		}
	}

	.popout-list {
		padding-top:0;

		&.done {
			opacity:0.3;

			&:hover {
				opacity:1;
			}
		}


		.search-bar {
			margin-left:-30px;
		}
	}

</style>
