<template>
	<section>
		<PopOutHead v-on:closed="returnResult" id-selector="1" v-on:identity="selectIdentity" :identity="selectedIdentity" />

		<section class="app-login">

			<section>
				<PopOutApp :app="appData" :suffix="account ? 'will see:' : ''" />


				<!------------------------------------->
				<!----- APP LOGIN REQUIREMENTS -------->
				<!------------------------------------->
				<section class="requirements">

					<!------------------------------------->
					<!-------- SELECT ACCOUNT ------------->
					<!------------------------------------->
					<section class="requirement account" v-if="!loginAll && validAccounts.length">
						<section class="boxes">
							<section class="box account-selector" @click="selectTokenAndAccount">
								<section>
									<figure class="name">{{account.sendable()}}</figure>
									<figure class="network">{{account.network().name}}</figure>
								</section>
								<figure class="chevron icon-dot-3"></figure>
							</section>
						</section>
					</section>

					<!------------------------------------->
					<!-------- SELECT AUTHORITY ------------->
					<!------------------------------------->
					<section class="dangerous-authority" v-if="!loginAll && account && account.authority === 'owner'">
						You are signing in with your Owner permission. This is dangerous.
					</section>
					<section class="authorities" v-if="!loginAll && account && account.authorities(false).length > 1">
						<Select bordered="1"
						        :options="account.authorities(false)"
						        :parser="x => x.authority"
						        :iconparser="x => x.authority === 'owner' ? {class:'icon-attention red'} : ''"
						        :selected="account"
						        v-on:selected="x => account = x" />
					</section>

					<!------------------------------------->
					<!---- LOGGING IN WITH ALL ACCOUNTS --->
					<!------------------------------------->
					<section class="requirement all-accounts" v-else-if="loginAll && validAccounts.length">
						<figure class="icon icon-network"></figure>
						<section class="text">
							<label>All accounts for:</label>
							<section class="network-accounts-list">
								<section class="network-accounts" v-for="(network,i) in requestedNetworks">
									<span class="name">{{network.name}} ({{network.accounts(true).length}} accounts)</span>
									<span v-if="i+1 < requestedNetworks.length">,</span>
								</section>
							</section>
						</section>

						<figure class="icon bubble icon-help"></figure>
						<section class="bubble-explainer">
							<b>{{appData.name}}</b> is requesting to view every account for a specified network.
							This means that it will be able to request transaction signatures for any account that you have linked to any of the requested networks.
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
						<figure class="icon icon-user"></figure>
						<figure class="text">
							<label>Personal information:</label>
							{{identityRequirements}}
						</figure>

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
	import {IdentityRequiredFields} from "../../models/Identity";
	import Network from "../../models/Network";
	import RequiredFields from "../../components/popouts/RequiredFields";
	import RIDLService from "../../services/apis/RIDLService";
	import PopupService from "../../services/utility/PopupService";
	import {Popup} from "../../models/popups/Popup";
	import {Blockchains} from "../../models/Blockchains";
	import * as ApiActions from '../../models/api/ApiActions';
	import PopOutApp from "../../components/popouts/PopOutApp";
	require('../../styles/transfers.scss');

	export default {
		props:['popup', 'expanded'],
		components:{
			PopOutApp,
			RequiredFields,
		},
		data () {return {
			account:null,

			selectedAccounts:[],
			searchTerms:'',
			selectedLocation:null,
			selectedIdentity:null,
			showingAll:false,

			loginAll:false,

			loadingReputation:false,
			reputation:null,
		}},
		created(){
			this.loginAll = this.popup.data.type === ApiActions.LOGIN_ALL;

			if(this.validAccounts.length) this.account = this.validAccounts[0];

			console.log('this.scatter.keychain', this.scatter.keychain);
			this.selectIdentity(this.identities.sort((a,b) => {
				return b.id === this.scatter.keychain.lastUsedIdentity ? 1 : a.id === this.scatter.keychain.lastUsedIdentity ? -1 : 0;
			})[0]);
		},
		computed: {
			...mapState([
				'scatter',
				'balances',
			]),
			...mapGetters([
				'identity',
				'identities',
				'accounts',
				'networks',
				'locations'
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


			requestedNetworks(){
				return this.accountRequirements.map(raw => {
					const n = Network.fromJson(raw);
					return this.networks.find(x => x.unique() === n.unique());
				});
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

			selectIdentity(identity){
				this.selectedIdentity = identity.clone();
				if(identity.getLocation()){
					this.selectedLocation = identity.getLocation().clone();
				} else {
					this.selectedLocation = this.locations[0].clone();
				}
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
		border:1px solid #dadada;
		border-top:0;
		height:calc(100vh - 40px);

		.app-details {
			margin-top:-60px;
		}

		.requirements {
			min-width:400px;
			text-align:left;
			max-width:80%;
			margin:10px auto;

			.authorities {
				.select {
					margin-top:-7px;
				}
			}

			.dangerous-authority {
				background:$red;
				border:1px solid $darkred;
				color:$white;
				font-size: $small;
				margin-bottom:10px;
				margin-top:-7px;
				padding:10px;
				border-radius:$radius;
			}

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

				label {
					font-size: $small;
					padding-top:2px;
				}

				.icon {
					padding-right:5px;
					align-self: flex-start;
					color:$silver;
					margin-left:-8px;

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
					bottom:calc(100% - 10px);
					width:380px;
					font-size: $small;
					background:$white;
					color:$black;
					box-shadow:0 2px 4px $blue-shadow, 0 8px 24px $blue-shadow;
					padding:20px;
					border-radius:$radius;
					display:none;
					z-index:999999;
				}

				.text {
					flex:1;
					font-size: $small;
				}

				&.all-accounts {
					margin-top:10px;
					padding-top:20px;
					border-top:1px solid $lightgrey;

					.icon {
						&:first-child {
							color:$blue;
						}
					}

					.network-accounts-list {
						max-height:100px;
						overflow-y:auto;
					}

					.network-accounts {
						font-size: $small;
						font-weight: bold;
						display:inline-block;
						margin-right:5px;

						.name {
							color:$blue;
							text-decoration: underline;
						}
					}
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
