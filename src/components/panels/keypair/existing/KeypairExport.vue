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
                <h1>{{locale(langKeys.KEYPAIR.EXPORT.QR.Title)}}</h1>
                <section class="disclaimer less-pad" style="margin:0 auto 10px; max-width:500px;">
                    You can either leave this field blank to use your current Scatter password, or enter another PIN or password here to re-encrypt this QR code with something
                    that is easier to remember, or to type into a mobile device.
                </section>
                <cin style="max-width:500px; margin:0 auto;"
                     placeholder="Alternative Password"
                     type="password"
                     :text="pass"
                     v-on:changed="x => pass = x" />
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
    import ElectronHelpers from "../../../../util/ElectronHelpers";
    import QRService from "../../../../services/QRService";

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
	        	ElectronHelpers.copy(this.getPrivateKey(blockchain));
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
        },
        watch:{
    		['pass'](){
    			this.createQR();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../../variables";

    .panel-container {
        text-align: center;
        padding-top:70px;
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
                color:$dark-blue;
                margin-bottom:5px;
            }

            p {
                font-size: 11px;
            }

            &:hover {
                background:rgba(0,0,0,0.02);

                .badge {
                    background:$dark-blue;
                    border:1px solid $dark-blue;
                    color:#fff;
                }
            }
        }
    }

</style>
