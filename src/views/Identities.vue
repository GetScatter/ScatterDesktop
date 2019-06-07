<template>
	<section>
		<section class="blockchain-list-container" v-if="identity">



			<!-------------------------->
			<!------ BLOCKCHAINS ------->
			<!-------------------------->
			<section class="blockchains" v-if="identities.length > 1">
				<section class="head with-button">
					<figure>Identities</figure>
					<Button small="1" text="Add" @click.native="addIdentity" />
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
					<Button small="1" text="Remove" @click.native="removeIdentity" v-if="identities.length > 1" />
					<Button small="1" text="Add new Identity" @click.native="addIdentity" v-if="identities.length === 1" />
				</section>
				<section class="scroller identity">
					<section class="id-card">
						<figure class="bg">
							<img src="../assets/login_bg.png" />
						</figure>
						<section class="card">
							<section class="avatar">
								<img v-if="!avatar" src="../assets/id_card_avatar.png" />
								<figure class="image" v-else :style="`background-image:url('${avatar}')`"></figure>
								<figure class="upload icon-plus" @click="uploadAvatar"></figure>
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

						<figure class="section-title">Security Keys</figure>
						<section class="split-inputs">
							<section style="flex:1;">
								<Input style="margin:0;" :text="identity.publicKey" disabled="1" copy="1" />
							</section>
							<section>
								<Button text="Change" />
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
	const fs = window.require('fs');

	let saveTimeout;
	export default {
		data(){return {

			identity:null,
			fullname:'',
			// countries:Countries,
		}},
		computed:{
			...mapState([
				'scatter',
			]),
			...mapGetters([
				'identities',
				'locations',
				'avatars'
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
			}
		},
		mounted(){
			this.selectIdentity(this.identities[0])
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
			save(){
				const original = this.identities.find(x => x.id === this.identity.id);
				if(original && JSON.stringify(original) === JSON.stringify(this.identity)) return;
				if(!this.isValidName) return;
				if(this.nameExists) return;
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
				display:flex;
				overflow: hidden;
				max-width:600px;
				margin:0 auto;


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
						width:100px;
						height:100px;
						border-radius:50%;
						overflow: hidden;
						display:block;

						background-size: cover;
					}

					.upload {
						cursor: pointer;
						margin-top:30px;
						width:45px;
						height:45px;
						border-radius:50%;
						background:$blue;
						color:$white;
						font-size: 24px;
						display:flex;
						justify-content: center;
						align-items: center;
						transition: transform 0.2s ease;

						&:hover {
							transform:scale(1.1);
						}

						&:active {
							transform:scale(0.9);
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
		}

	}

</style>