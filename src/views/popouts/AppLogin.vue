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
					<figure class="name"><b>{{appData.name}}</b> <span v-if="allRequirementsMet">will see:</span></figure>
				</section>

				<!------------------------------------->
				<!----- APP LOGIN REQUIREMENTS -------->
				<!------------------------------------->
				<section class="requirements">

					<!------------------------------------->
					<!-------- SELECT ACCOUNT ------------->
					<!------------------------------------->
					<section class="requirement account" v-if="validAccounts.length">
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


					<!------------------------------------->
					<!----------- NO ACCOUNTS ------------->
					<!------------------------------------->
					<section class="requirement no-accounts" v-if="!validAccounts.length">
						<figure class="network-name" v-if="savedNetwork">{{savedNetwork.name}}</figure>
						<figure class="text">
							<b>You don't have accounts for this network</b>
							<br>
							You need to create an account before being able to use apps.
						</figure>
					</section>




					<!------------------------------------->
					<!----- IDENTITY REQUIREMENTS --------->
					<!------------------------------------->
					<section class="requirement personal" v-if="allRequirementsMet && identityRequirements.length">
						<figure class="icon icon-eye"></figure>
						<figure class="text">Your {{identityRequirements}}.</figure>

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
				<Button big="1" style="padding:0 20px;" :disabled="!allRequirementsMet" blue="1" text="Allow" @click.native="login" />
			</section>

		</section>

	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import PopOutHead from '../../components/popouts/PopOutHead';
	import {IdentityRequiredFields} from "../../models/Identity";
	import Network from "../../models/Network";
	import RequiredFields from "../../components/popouts/RequiredFields";
	import RIDLService from "../../services/apis/RIDLService";
	import PopupService from "../../services/utility/PopupService";
	import {Popup} from "../../models/popups/Popup";
	import {Blockchains} from "../../models/Blockchains";
	require('../../styles/transfers.scss');

	export default {
		props:['popup', 'expanded'],
		components:{
			RequiredFields,
			PopOutHead,
		},
		data () {return {
			account:null,

			selectedAccounts:[],
			searchTerms:'',
			selectedLocation:null,
			selectedIdentity:null,
			showingAll:false,
			reputation:null,
		}},
		created(){

			// TODO: Need to do this on the main process before even opening this popup
			// TODO: since popups can't persist state to disk.
			// if(!this.validAccounts.length && this.accountRequirements.length){
			// 	if(this.network.blockchain !== Blockchains.EOSIO){
			// 		// Creating an account automatically.
			// 	}
			// }

			if(this.validAccounts.length){
				this.account = this.validAccounts[0];
			}


			this.selectedIdentity = this.identities[0].clone();
			this.selectedLocation = this.selectedIdentity.locations[0].clone();

			// setTimeout(async() => {
			// 	this.loadingReputation = true;
			// 	this.reputation = await RIDLService.checkApp(this.popup.data.props.payload.origin);
			// 	if(!this.reputation) this.reputation = await RIDLService.checkApp(this.popup.origin());
			// 	this.loadingReputation = false;
			// })


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



			network(){
				return Network.fromJson(this.accountRequirements[0] || {})
			},
			savedNetwork(){
				return this.networks.find(x => x.unique() === this.network.unique());
			},



			payload(){ return this.popup.payload(); },

			isValidIdentity() {
				return this.selectedIdentity.hasRequiredFields(this.fields, this.selectedLocation);
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


			identityRequirements() {
				return this.fields.personal.concat(this.fields.location).join(', ');
			},
			accountRequirements() {
				return this.fields.accounts || [];
			},
			allRequirementsMet(){
				return !!this.validAccounts.length;
			}
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
					location:this.selectedLocation,
					accounts:[this.account],
					missingFields:this.missingFields
				});
			},

			selectLocation(location){
				this.selectedLocation = location.clone();
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

				&.personal {
					margin-top:10px;
					padding-top:20px;
					border-top:1px solid $lightgrey;
				}

				&.no-accounts {
					text-align:center;
					width:350px;
					display:flex;
					justify-content: center;
					align-items: center;
					flex-direction: column;
					border:1px solid $blue;
					border-radius:$radius;
					margin:20px auto 10px;
					padding:20px;

					.network-name {
						font-size: $large;
						font-weight: bold;
						margin-bottom:5px;
					}
				}
			}
		}

		.actions {
			margin-top:30px;
			position:absolute;
			bottom:30px;
			right:30px;
			left:30px;
			display:flex;
			justify-content: space-between;
		}
	}





</style>
