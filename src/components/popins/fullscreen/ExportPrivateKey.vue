<template>
	<section class="pop-in">
		<section>

			<!-- SELECT EXPORT TYPE -->
			<section v-if="state === STATES.SELECT">
				<h1>Exporting Private Key</h1>
				<section class="disclaimer">
					<figure class="title">Keep your private keys safe!</figure>
					<figure class="description">Always export your private keys and make sure you have a backup of them. You will not be able to recover your tokens if you lose it.</figure>
				</section>

				<section class="types">

					<!-- EXPORT KEY -->
					<section class="type" @click="state = STATES.KEY">
						<figure class="badge icon-key"></figure>
						<figure class="name">{{locale(langKeys.KEYPAIR.EXPORT.SELECT.KeyTitle)}}</figure>
						<p>{{locale(langKeys.KEYPAIR.EXPORT.SELECT.KeyDescription)}}</p>
					</section>

					<!-- EXPORT QR -->
					<section class="type" @click="createQR">
						<figure class="badge icon-qrcode"></figure>
						<figure class="name">{{locale(langKeys.KEYPAIR.EXPORT.SELECT.QrTitle)}}</figure>
						<p>{{locale(langKeys.KEYPAIR.EXPORT.SELECT.QrDescription)}}</p>
					</section>

				</section>
			</section>

			<!-- EXPORT AS TEXT KEY -->
			<section class="export-text" v-if="state === STATES.KEY">
				<h1>{{locale(langKeys.KEYPAIR.EXPORT.KEY.Title)}}</h1>
				<section class="split-inputs">
					<Input style="flex:1; margin-bottom:0;" :text="privateKey" />
					<Button text="Copy" @click.native="copyPrivateKey" />
				</section>
			</section>

			<!-- EXPORT AS QR -->
			<section v-if="state === STATES.QR">
				<section v-if="!screenshotting">
					<h1>{{locale(langKeys.KEYPAIR.EXPORT.QR.Title)}}</h1>
					<section class="disclaimer" style="margin:0 auto 10px; max-width:500px;">
						<figure class="description">Leave this field blank to use your current password, or enter something else to re-encrypt this QR code with that password.</figure>
					</section>
					<section class="split-inputs" style="max-width:500px; margin:0 auto;">
						<Input placeholder="Alternative Password" style="margin-bottom:0;"
						     type="password"
						     :text="pass"
						     v-on:changed="x => pass = x" />

						<Button style="flex:0 0 auto;" text="Save QR as Image" @click.native="screenshot" />
					</section>
				</section>
				<section v-else>
					<h1>{{keypair.name}}</h1>
					<section class="keys">
						<figure class="key" v-for="key in publicKeyItems">
							{{key.description }} - <b>{{key.title}}</b>
						</figure>
					</section>
				</section>
				<br>
				<section class="qr">
					<img :src="qr" />
				</section>
			</section>

			<ActionBar v-if="!screenshotting" :buttons-left="buttonsLeft" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import Crypto from "../../../util/Crypto";
	import ElectronHelpers, {ipcAsync, remote} from "../../../util/ElectronHelpers";
	import QRService from "../../../services/secure/QRService";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";

	const STATES = {
		SELECT:'select',
		KEY:'key',
		QR:'qr',
	};

	export default {
		props:['popin'],

		data () {return {
			state:STATES.SELECT,
			STATES,

			pass:'',
			screenshotting:false,

			privateKey:false,
		}},

		computed:{
			...mapState([

			]),
			...mapGetters([
				'keypairs',
			]),

			buttonsLeft(){
				if(this.state === STATES.SELECT){
					return [{text:'Back', click:() => this.returnResult(null)}];
				} else {
					return [{text:'Back', click:() => this.state = STATES.SELECT}];
				}
			},
			publicKeyItems(){
				return this.keypair.publicKeys.map(x => {
					if(!this.keypair.blockchains.includes(x.blockchain)) return null;
					return {
						title:x.key,
						description:this.blockchainName(x.blockchain),
						actions:[]
					};
				}).filter(x => !!x);
			},
			keypair(){
				return this.popin.data.props.keypair;
			}
		},

		mounted(){
			this.init();
		},

		methods:{
			returnResult(){
				this.popin.data.callback(this.network);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			async init(){
				this.privateKey = await this.getPrivateKey();
			},
			getPublicKey(){
				return this.keypair.enabledKey().key;
			},
			async getPrivateKey(){
				this.keypair.decrypt(await ipcAsync('seed'));
				return Crypto.bufferToPrivateKey(this.keypair.privateKey, this.keypair.enabledKey().blockchain);
			},
			async copyPrivateKey(){
				const prv = await this.getPrivateKey();
				const pub = this.getPublicKey();
				const copy = `${this.blockchainName(this.keypair.enabledKey().blockchain)} - ${this.keypair.name}\r\nPublic: ${pub}\r\nPrivate: ${prv}`;
				ElectronHelpers.copy(copy);
			},
			async createQR(){
				this.qr = await QRService.createQR(this.keypair.privateKey, this.pass);
				this.state = STATES.QR;
			},
			screenshot(){
				this.screenshotting = true;
				setTimeout(() => {
					let location = remote.dialog.showOpenDialog({properties: ['openDirectory']});
					if(!location) return this.screenshotting = false;
					location = location[0];

					const filename = `${location}/${this.keypair.name}.jpg`;

					remote.getCurrentWindow().capturePage(img => {
						remote.require('fs').writeFile(filename, img.toJPEG(99), saved => {
							PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.SavedImage), 'check'));
							ElectronHelpers.openLinkInBrowser(location);
							setTimeout(() => {
								this.screenshotting = false;
							}, 500);
						})
					})
				}, 500);
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
		watch:{
			['pass'](){
				this.createQR();
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.export-text {
		width:500px;
	}

	.keys {
		margin:0 auto;
		max-width:500px;
		text-align:center;

		.key {
			font-size: 11px;
		}

		.public {
			font-size: 11px;
		}
	}

	.types {
		margin-top:100px;
		display:flex;
		flex-direction: row;
		justify-content: center;

		.type {
			width:calc(50% - 10px);
			max-width:400px;
			background:#fff;
			border:1px solid #e8e8e8;
			border-radius:10px;
			padding:36px;
			position: relative;
			padding-top:65px;
			text-align: center;
			cursor: pointer;

			transition: all 0.15s ease;
			transition-property: background;

			&:last-child {
				margin-left:20px;
			}

			.badge {
				width:100px;
				height:100px;
				border-radius:50%;
				background:#fff;
				border:1px solid #e8e8e8;
				color:$dark-grey;
				font-size: 36px;
				display:flex;
				justify-content: center;
				align-items: center;
				position: absolute;
				top:-50px;
				left:0;
				right:0;
				margin:0 auto;

				transition: all 0.15s ease;
				transition-property: background, color, border;
			}

			.name {
				font-size: 24px;
				color:$blue;
				margin-bottom:5px;
			}

			p {
				font-size: 11px;
			}

			&:hover {
				background:rgba(0,0,0,0.02);

				.badge {
					background:$blue;
					border:1px solid $blue;
					color:#fff;
				}
			}
		}
	}

</style>