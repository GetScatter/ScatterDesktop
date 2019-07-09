<template>
	<section>
		<section class="blockchain-list-container" v-if="identity">



			<!-------------------------->
			<!------ BLOCKCHAINS ------->
			<!-------------------------->
			<section class="blockchains" v-if="identities.length > 1">
				<section class="head with-button">
					<figure>Identities</figure>
					<Button text="Add" @click.native="addIdentity" />
				</section>
				<section class="scroller">
					<section class="blockchain-list">
						<section class="badge-item hoverable" :class="{'active':identity.id === id.id}" v-for="id in identities" @click="selectIdentity(id)">
							<figure class="badge iconed small icon-user"></figure>
							<section class="details">
								<figure class="title">{{id.name}}</figure>
							</section>
						</section>
					</section>
				</section>
			</section>

			<!-------------------------->
			<!------- NETWORKS --------->
			<!-------------------------->
			<section class="list-container">
				<section class="head with-button">
					<figure></figure>
					<Button text="Remove" @click.native="removeIdentity" v-if="identities.length > 1" />
					<Button text="Add new Identity" @click.native="addIdentity" v-if="identities.length === 1" />
				</section>
				<section class="scroller identity">
					<section class="id-card">
						<figure class="bg">
							<img src="../assets/login_bg.png" />
						</figure>
						<section class="card">
							<section class="avatar" :class="{'has-image':scatter.keychain.avatars[identity.id]}">
								<img v-if="!avatar" src="../assets/id_card_avatar.png" />
								<figure class="image" v-else :style="`background-image:url('${avatar}')`"></figure>
								<figure class="upload">
									<figure v-tooltip="'Remove'" v-if="scatter.keychain.avatars[identity.id]" class="icon icon-cancel" @click="removeAvatar"></figure>
									<figure v-tooltip="scatter.keychain.avatars[identity.id] ? 'Change' : 'Add an Image'" class="icon icon-plus" @click="uploadAvatar"></figure>
								</figure>
							</section>
							<section class="personal">
								<figure class="bg">
									<img src="../assets/id_card_bg.png" />
								</figure>
								<section class="inputs">
									<Input :label-styles="labelStyles" :label="locale(langKeys.IDENTITY.PERSONAL.NameLabel)"
									       :placeholder="locale(langKeys.IDENTITY.PERSONAL.NamePlaceholder)"
									       :text="fullname" v-on:changed="x => fullname = x" />

									<Input :label-styles="labelStyles" small="1" :label="locale(langKeys.IDENTITY.PERSONAL.EmailLabel)" placeholder="support@get-scatter.com"
									       style="flex:1"
									       :text="identity.personal.email"
									       v-on:changed="x => identity.personal.email = x" />

									<Input :label-styles="labelStyles" small="1" :label="locale(langKeys.IDENTITY.PERSONAL.DateOfBirthLabel)"
									       type="date" placeholder="MM/DD/YYYY" style="flex:0.4; margin-top:15px;"
									       :text="identity.personal.birthdate"
									       v-on:changed="x => identity.personal.birthdate = x" />
								</section>
							</section>
						</section>
					</section>

					<section class="id-details limit-800">
						<figure class="section-title">{{locale(langKeys.IDENTITY.NameLabel)}}</figure>
						<Input :error="nameError" big="1"
						       :placeholder="locale(langKeys.IDENTITY.NamePlaceholder)"
						       :text="identity.name" v-on:changed="x => identity.name = x" />






						<!-------------------------------------------->
						<!-------------------------------------------->
						<!----------------    RIDL      -------------->
						<!-------------------------------------------->
						<!-------------------------------------------->

						<section v-if="!isUsingIdentity">
							<section class="ridl-actions" v-if="identityIsAvailable && isValidName">
								<figure class="icon icon-check"></figure>
								<figure class="text">This RIDL Identity name is available</figure>
								<Button :loading="loadingRidlData" small="1" text="Register as RIDL Identity" @click.native="registerForRIDL"  />
							</section>

							<section class="ridl-actions" v-if="identityNotAvailable && !identityIsOnWrongKey">
								<figure class="icon icon-cancel red"></figure>
								<figure class="text">
									This RIDL Identity name is already taken
									<p>Someone else has already claimed and registered this RIDL Identity name.</p>
								</figure>
							</section>

							<section class="ridl-actions" v-if="identityNotAvailable && identityIsOnWrongKey">
								<figure class="icon icon-cancel red"></figure>
								<figure class="text">
									You own this RIDL Identity, but the authentication key doesn't match.
									<p>You can either change the authentication key you are using for this identity, or update the authentication key to the one you are using now.</p>
								</figure>
								<Button :loading="loadingRidlData" small="1" text="Update Authentication Key" @click.native="updateRidlKey"  />
							</section>

							<section class="ridl-actions" v-if="identityIsUsable">
								<figure class="icon icon-check"></figure>
								<figure class="text">You own this RIDL Identity name</figure>
								<Button :loading="loadingRidlData" small="1" text="Use RIDL Identity" @click.native="useRidlIdentity"  />
							</section>

							<section class="ridl-actions" v-if="identityIsClaimable">
								<figure class="icon icon-check"></figure>
								<figure class="text">You own this RIDL Identity name, but haven't claimed it yet.</figure>
								<Button :loading="loadingRidlData" small="1" text="Claim RIDL Identity" @click.native="registerForRIDL"  />
							</section>

							<section class="ridl-actions" v-if="identityIsOnWrongAccount">
								<figure class="icon icon-cancel red"></figure>
								<figure class="text">
									This RIDL Identity is linked to an account you don't have imported in your Scatter.
									<p>
										The blockchain account associated with this RIDL Identity is not currently imported into your Scatter.
									</p>
								</figure>
								<!--<Button :loading="loadingRidlData" small="1" text="Update RIDL Identity's Account" @click.native="updateRidlAccount"  />-->
							</section>

							<br>
							<br>
						</section>

						<section v-if="isUsingIdentity">
							<section class="ridl-actions">
								<figure class="icon icon-user"></figure>
								<figure class="text">This Identity is registered with RIDL</figure>
								<Button red="1" :loading="loadingRidlData" small="1" text="Stop using RIDL Identity" @click.native="stopUsingRidlIdentity"  />
							</section>

							<br>
							<br>
						</section>


						<br>
						<br>

						<figure class="section-title">Location</figure>
						<Select bordered="1"
						        :options="[null].concat(locations)"
						        :parser="x => x ? x.name : 'None selected'"
						        :selected="selectedLocation" v-on:selected="x => identity.location = x ? x.id : null" />

						<br>
						<br>
						<br>
						<br>

						<figure class="section-title">Authentication Key</figure>
						<p>Make sure you save a copy of this authentication key, you will need it to regain access to certain applications that require it.</p>
						<section class="split-inputs">
							<section style="flex:1;">
								<Input style="margin:0;" :text="identity.publicKey" disabled="1" copy="1" />
							</section>
							<section>
								<Button text="Change / View" @click.native="changeSecurityKey" />
							</section>
						</section>

						<br>
						<br>
						<br>
						<br>

					</section>
				</section>
			</section>




		</section>
	</section>
</template>

<script>
	import {mapGetters, mapActions, mapState} from 'vuex';
	import * as Actions from '../store/constants'
	import IdGenerator from "../util/IdGenerator";
	import Identity from "../models/Identity";
	import * as FileService from '../services/utility/FileService';
	import PopupService from "../services/utility/PopupService";
	import {Popup} from "../models/popups/Popup";
	import RIDLService from "../services/apis/RIDLService";
	const fs = window.require('fs');

	let saveTimeout;
	export default {
		data(){return {

			identity:null,
			fullname:'',
			// countries:Countries,

			availableIdentity:false,
			loadingRidlData:false,
		}},
		computed:{
			...mapState([
				'scatter',
			]),
			...mapGetters([
				'identities',
				'locations',
				'avatars',
				'accounts'
			]),
			labelStyles(){
				return {
					style:'color:#444; margin-bottom:0;'
				}
			},
			isValidName(){
				return this.identity && Identity.nameIsValid(this.identity.name);
			},
			nameExists(){
				return this.identities.find(x => x.id !== this.identity.id && x.name.toLowerCase() === this.identity.name.toLowerCase())
			},
			nameError(){
				if(!this.isValidName) return `This name is invalid.`;
				if(this.nameExists) return `This name exists.`;
				return false;
			},
			selectedLocation(){
				return this.locations.find(x => x.id === this.identity.location);
			},
			avatar(){
				if(!this.identity) return;
				return this.avatars[this.identity.id];
			},








			/**************************************/
			/**************  RIDL  ****************/
			/**************************************/
			ridlAccount(){
				return this.accounts.find(x => x.networkUnique === RIDLService.networkUnique());
			},
			identityIsAvailable(){
				return !this.availableIdentity;
			},
			identityNotAvailable(){
				return this.availableIdentity && this.availableIdentity.key !== this.identity.publicKey;
			},
			identityIsClaimable(){
				if(!this.availableIdentity) return false;
				return this.availableIdentity.key === this.identity.publicKey && this.availableIdentity.account === 'ridlridlridl';
			},
			identityIsUsable(){
				return this.availableIdentity
					&& this.ridlAccount
					&& this.availableIdentity.key === this.identity.publicKey
					&& this.availableIdentity.account === this.ridlAccount.name;
			},
			identityIsOnWrongAccount(){
				return this.availableIdentity
					&& this.ridlAccount
					&& this.availableIdentity.key === this.identity.publicKey
					&& this.availableIdentity.account !== this.ridlAccount.name;
			},
			identityIsOnWrongKey(){
				return this.availableIdentity
					&& this.ridlAccount
					&& this.availableIdentity.key !== this.identity.publicKey
					&& this.availableIdentity.account === this.ridlAccount.name;
			},
			isUsingIdentity(){
				if(!this.availableIdentity) return false;
				return this.availableIdentity.id === this.identity.ridl
			},
		},
		mounted(){
			this.selectIdentity(this.identities[0]);
			if(!this.ridlAccount) RIDLService.init();
		},
		methods:{
			selectIdentity(identity){
				this.identity = identity.clone();
				this.fullname = [this.identity.personal.firstname, this.identity.personal.lastname].filter(x => x && x.length).join(' ');
			},
			addIdentity(){
				const scatter = this.scatter.clone();
				const identity = Identity.placeholder();
				identity.name = `New_Identity-${IdGenerator.text(4)}`;
				scatter.keychain.updateOrPushIdentity(identity);
				this[Actions.SET_SCATTER](scatter);
				this.selectIdentity(identity);
			},
			removeIdentity(){
				PopupService.push(Popup.prompt(
					'Removing Identity',
					`Are you sure you want to remove ${this.identity.name}`,
					accepted => {
						if(!accepted) return;
						const identity = this.identity.clone();
						this.identity = this.identities.filter(x => x.id !== identity.id)[0];
						const scatter = this.scatter.clone();
						scatter.keychain.removeIdentity(identity);
						this[Actions.SET_SCATTER](scatter);
					}, true
				))
			},
			async removeAvatar(){
				const scatter = this.scatter.clone();
				delete scatter.keychain.avatars[this.identity.id];
				this[Actions.SET_SCATTER](scatter);
			},
			async uploadAvatar(){
				//TODO: I'm not sure this is the best way to go about this.
				/***
				 * It's possible that this could inflate the saved json and backups significantly.
				 * It might be best to have it as images, but that wouldn't persist for backups.
				 * Need to give this a think.
				 */

				let filepath = await FileService.getFileLocation(['jpg', 'png', 'jpeg']);
				if(!filepath || !filepath.length) return;
				filepath = filepath[0];
				let ext = filepath.split('.');
				ext = ext[ext.length-1];

				const base64 = fs.readFileSync(filepath, { encoding: 'base64' });
				if(!base64) return PopupService.push(Popup.snackbar("Error converting image file."));

				// Resizing to 350x350 MAX (ratio preserved)
				// -------------------------------------------
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				const image = new Image();

				image.onload = e => {
					const calculateAspectRatioFit = () => {
						const ratio = Math.min(350 / image.width, 350 / image.height);
						return { width: Math.round(image.width*ratio), height: Math.round(image.height*ratio) };
					}

					canvas.height = calculateAspectRatioFit().height;
					canvas.width = calculateAspectRatioFit().width;

					ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, calculateAspectRatioFit().width, calculateAspectRatioFit().height);
					const resized = new Image();
					resized.src = canvas.toDataURL(`image/${ext}`);

					const scatter = this.scatter.clone();
					scatter.keychain.avatars[this.identity.id] = resized.src;
					this[Actions.SET_SCATTER](scatter);
				};

				image.src = `data:image/${ext};base64, ${base64}`;
				// -------------------------------------------
			},
			changeSecurityKey(){
				PopupService.push(Popup.verifyPassword(verified => {
					if(!verified) return;
					PopupService.push(Popup.changeIdentityKey(this.identity, changed => {
						if(changed) {
							this.selectIdentity(this.identities.find(x => x.id === this.identity.id));
							this.identity.ridl = -1;
						}
					}));
				}))
			},






			/**************************************/
			/**************  RIDL  ****************/
			/**************************************/
			async updateRidlKey(){
				if(this.loadingRidlData) return;
				this.loadingRidlData = true;
				if(await RIDLService.changeKey(this.identity.name, this.identity.publicKey)){
					setTimeout(async () => {
						this.availableIdentity = await RIDLService.identityNameIsAvailable(this.identity.name);
						this.useRidlIdentity(true);
						this.loadingRidlData = false;
					}, 1000);
				} else {
					this.loadingRidlData = false;
				}
			},
			async updateRidlAccount(){
				if(this.loadingRidlData) return;
				this.loadingRidlData = true;
				const result = await RIDLService.changeAccount(this.identity.name, this.ridlAccount.name);
				this.loadingRidlData = false;
			},
			async registerForRIDL(){
				if(this.loadingRidlData) return;

				const name = this.identity.name;
				const identity = await RIDLService.identityNameIsAvailable(name);

				let account;
				account = await RIDLService.getAccount();
				if(!account){
					account = await RIDLService.createAccount();
					if(!account) return console.error("Could not create account.");
				}

				this.loadingRidlData = true;

				if(identity){
					const claimed = await RIDLService.claim(this.identity.name, this.identity.publicKey).catch(() => null);
					this.loadingRidlData = false;
					// TODO: ERROR HANDLING
					if(!claimed) {
						return console.error("Could not claim identity.");
					}

					this.identity.ridl = this.availableIdentity.id;
				}

				else {
					const identified = await RIDLService.identify(name, this.identity.publicKey).catch(() => null);
					this.loadingRidlData = false;
					// TODO: ERROR HANDLING
					if(!identified) {
						return console.error("Could not identify identity.");
					}

					this.identity.ridl = identified.id;
					this.availableIdentity = identified;
				}
			},
			async useRidlIdentity(force = false){
				if(!force && this.loadingRidlData) return;
				this.identity.ridl = this.availableIdentity.id;
			},
			async stopUsingRidlIdentity(){
				this.identity.ridl = -1;
			},














			save(){
				const original = this.identities.find(x => x.id === this.identity.id);
				if(original && JSON.stringify(original) === JSON.stringify(this.identity)) return;
				if(!this.isValidName) return;
				if(this.nameExists) return;

				const scatter = this.scatter.clone();
				scatter.keychain.updateOrPushIdentity(this.identity);
				this[Actions.SET_SCATTER](scatter);
			},

			...mapActions([
				Actions.SET_SCATTER,
			])
		},
		watch:{
			['fullname'](){
				if(!this.fullname.trim().length){
					this.identity.personal.firstname = '';
					this.identity.personal.lastname = '';
					return false;
				}
				const names = this.fullname.trim().split(' ');
				this.identity.personal.firstname = names.slice(0, names.length > 1 ? names.length-1 : 1).join(' ').trim();
				this.identity.personal.lastname = names.length > 1 ? names[names.length-1].trim() : '';
			},
			identity:{
				handler(){
					clearTimeout(saveTimeout);
					saveTimeout = setTimeout(() => {
						this.save();
					}, 500);
				},
				deep:true,
			},
			async ['identity.name'](){
				this.availableIdentity = null;
				if(!this.isValidName) return;
				this.loadingRidlData = true;
				this.availableIdentity = await RIDLService.identityNameIsAvailable(this.identity.name);
				this.loadingRidlData = false;
			},

		}
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	.identity {
		padding:0;
		height: calc(100vh - 40px - 60px);

		.id-card {
			padding:45px;
			position: relative;
			overflow:hidden;

			.bg {
				position:absolute;
				top:0;
				bottom:0;
				left:0;
				right:0;
				z-index:0;

				img {
					width:100%;
					height:150%;
				}
			}

			.card {
				position: relative;
				z-index:1;
				background:$white;
				width:100%;
				border-radius:10px;
				box-shadow:0 2px 10px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.2);
				overflow: hidden;
				max-width:600px;
				margin:0 auto;
				display:flex;


				.avatar {
					flex:0.4;
					border-right:1px solid $lightgrey;
					padding:30px;
					display:flex;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					position: relative;

					.image {
						position:absolute;
						top:0;
						bottom:0;
						left:0;
						right:0;
						overflow: hidden;
						display:block;
						z-index:-1;

						background-size: cover;
						background-position: center;

						&:after {
							content:'';
							display:block;
							position: absolute;
							top:0;
							bottom:0;
							left:0;
							right:0;
							background:rgba(0,0,0,0);
							transition:background 0.3s ease;
						}
					}

					.upload {

						color:$white;
						display:flex;
						align-items: center;
						justify-content: center;


						.icon {
							margin:10px 5px;
							position: relative;
							z-index:1;
							cursor: pointer;
							width:45px;
							height:45px;
							line-height:45px;
							border-radius:50%;
							background:$blue;
							color:$white;
							font-size: 24px;
							text-align:center;
							opacity:1;
							transition:opacity 0.2s ease;
						}


					}

					&.has-image {
						.upload {
							.icon {
								opacity:0;
							}
						}

						&:hover {
							.image {
								&:after {
									background:rgba(0,0,0,0.6);
								}
							}

							.upload {
								.icon {
									opacity:1;
								}
							}
						}
					}
				}

				.personal {
					flex:1;
					padding:30px;
					position: relative;
					overflow: hidden;

					.bg {
						position:absolute;
						top:0;
						bottom:0;
						left:0;
						right:0;
						z-index:0;

						img {
							width:100%;
							height:100%;
						}
					}

					.inputs {
						label {
							margin:0 !important;
							color:$black !important;
						}
					}
				}
			}
		}

		.id-details {
			padding:45px;

			.ridl-actions {
				display:flex;
				justify-content: space-between;
				align-items: center;

				.icon {
					width:24px;
					height:24px;
					font-size: 14px;
					border-radius:50%;
					border:1px solid $blue;
					color:$blue;
					margin-right:10px;
					display:flex;
					justify-content: center;
					align-items: center;

					&.red {
						background:$red;
						color:$white;
						border:0;
					}
				}

				.text {
					font-size: $medium;
					font-weight: bold;
					flex:1;
					padding-right:20px;

					p {
						margin:0;
						color:$silver;
					}
				}
			}
		}

	}

</style>