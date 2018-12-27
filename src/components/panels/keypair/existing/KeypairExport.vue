<template>
    <section>
        <section class="panel-container limited" v-if="keypair">

            <!-- SELECT EXPORT TYPE -->
            <section key="select" v-if="state === STATES.SELECT">
                <h1>{{locale(langKeys.GENERIC.Export)}} "{{keypair.name}}"</h1>

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
            <section key="text" v-if="state === STATES.KEY">
                <h1>{{locale(langKeys.KEYPAIR.EXPORT.KEY.Title)}}</h1>
                <br><br>
                <FullWidthRow style="text-align:left;" :items="keys" />
            </section>

            <!-- EXPORT AS QR -->
            <section key="text" v-if="state === STATES.QR">
                <section v-if="!screenshotting">
                    <h1>{{locale(langKeys.KEYPAIR.EXPORT.QR.Title)}}</h1>
                    <section class="disclaimer less-pad" style="margin:0 auto 10px; max-width:500px;">
                        Leave this field blank to use your current password, or enter something else to re-encrypt this QR code with that password.
                    </section>
                    <section class="split-inputs" style="max-width:500px; margin:0 auto;">
                        <cin placeholder="Alternative Password" style="margin-bottom:0;"
                             type="password"
                             :text="pass"
                             v-on:changed="x => pass = x" />

                        <btn text="Save QR as Image" v-on:clicked="screenshot" />
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

        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import FullWidthRow from '../../../reusable/FullWidthRow';
    import Crypto from "../../../../util/Crypto";
    import ElectronHelpers, {remote} from "../../../../util/ElectronHelpers";
    import QRService from "../../../../services/QRService";
    import PopupService from "../../../../services/PopupService";
    import {Popup} from "../../../../models/popups/Popup";
    import Mnemonic from "../../../../util/Mnemonic";

    const STATES = {
    	SELECT:'select',
        KEY:'key',
        QR:'qr',
    };

    export default {
    	props:['keypair'],

        data () {return {
        	state:STATES.SELECT,
	        STATES,

            keys:[],
	        pass:'',
	        screenshotting:false,
        }},

        components:{
	        FullWidthRow
        },

        mounted(){
    		this.keys = this.keypair.blockchains.map(blockchain => {
                return {
                	icon:'',
                    title:this.blockchainName(blockchain),
                    description:this.getPublicKey(blockchain),
                    asInput:true,
                    isPublic:true,
                    actions:[
	                    {
		                    id:'reveal',
		                    name:this.locale(this.langKeys.KEYPAIR.EXPORT.KEY.RevealButton),
		                    handler:() => this.revealPrivateKey(blockchain)
	                    },
                        {
	                        name:this.locale(this.langKeys.GENERIC.Copy),
	                        handler:() => this.copyPrivateKey(blockchain)
                        },
                    ]
                }
            });
        },

        computed:{
            ...mapState([
                'seed',
            ]),
            ...mapGetters([
                'keypairs',
            ]),
	        publicKeyItems(){
            	return this.keypair.publicKeys.map(x => {
		            if(!this.keypair.blockchains.includes(x.blockchain)) return null;
		            return {
			            title:x.key,
			            description:this.blockchainName(x.blockchain),
                        actions:[]
		            };
                }).filter(x => !!x);
            }
        },

        methods:{
    		getPublicKey(blockchain){
    		    return this.keypair.publicKeys.find(x => x.blockchain === blockchain).key;
            },
	        getPrivateKey(blockchain){
		        this.keypair.decrypt(this.seed);
		        return Crypto.bufferToPrivateKey(this.keypair.privateKey, blockchain);
	        },
	        copyPrivateKey(blockchain){
    			const prv = this.getPrivateKey(blockchain);
    			const pub = this.getPublicKey(blockchain);
    			const copy = `${this.blockchainName(blockchain)} - ${this.keypair.name}\r\nPublic: ${pub}\r\nPrivate: ${prv}`;
	        	ElectronHelpers.copy(copy);
            },
	        revealPrivateKey(blockchain){
	        	const display = this.keys.find(x => x.title === this.blockchainName(blockchain));
	        	const action = display.actions.find(x => x.id === 'reveal');

		        display.description = display.isPublic
                    ? this.getPrivateKey(blockchain)
                    : this.getPublicKey(blockchain);

		        action.name = !display.isPublic
                    ? this.locale(this.langKeys.KEYPAIR.EXPORT.KEY.RevealButton)
	        	    : this.locale(this.langKeys.KEYPAIR.EXPORT.KEY.HideButton);

		        display.isPublic = !display.isPublic;
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

				    const filename = `${location}/${this.keypair.name}.png`;

				    remote.getCurrentWindow().capturePage(img => {
					    remote.require('fs').writeFile(filename, img.toPng(), saved => {
						    PopupService.push(Popup.snackbar(this.locale(this.langKeys.SNACKBARS.SavedImage), 'check'));
						    ElectronHelpers.openLinkInBrowser(location);
						    setTimeout(() => {
							    this.screenshotting = false;
						    }, 500);
					    })
				    })
                }, 500);
            }
        },
        watch:{
    		['pass'](){
    			this.createQR();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../../styles/variables";

    .panel-container {
        text-align: center;
        padding-top:70px;
    }

    .keys {
        margin:0 auto;
        max-width:500px;
        text-align:center;

        .key {
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
                color:$primary;
                margin-bottom:5px;
            }

            p {
                font-size: 11px;
            }

            &:hover {
                background:rgba(0,0,0,0.02);

                .badge {
                    background:$primary;
                    border:1px solid $primary;
                    color:#fff;
                }
            }
        }
    }

</style>
