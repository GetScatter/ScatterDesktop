<template>
    <section>

        <section class="popup">

            <section class="top-section">
                <!-- HEADER -->
                <section class="head">
                    <figure class="logo">S</figure>
                    <figure class="info">
                        <figure>App is requesting a Public Key</figure>
                        <figure>{{pluginOrigin}} - {{payload.origin}}</figure>
                    </figure>
                    <figure class="close" @click="returnResult(null)">
                        <i class="fa fa-times"></i>
                    </figure>
                </section>

                <section class="search-bar">
                    <figure class="icon"><i class="fa fa-search"></i></figure>
                    <input placeholder="Search" v-model="searchTerms" />
                </section>
            </section>

            <section class="lists">

                <section class="list" v-if="selectingKeypair">
                    <section class="breadcrumbs">
                        <!--<figure class="breadcrumb">Generate New Key Pair</figure>-->
                    </section>

                    <section class="item short" @click="toggleGenerateKeypair">
                        <figure class="title">Generate New Keypair</figure>
                        <figure class="sub-title">Do you need to generate a keypair?</figure>
                        <figure class="chevron">
                            <i class="fa fa-chevron-right"></i>
                        </figure>
                    </section>

                    <section class="item short" @click="toggleImportKeypair">
                        <figure class="title">Import Keypair</figure>
                        <figure class="sub-title">Do you want to import a keypair?</figure>
                        <figure class="chevron">
                            <i class="fa fa-chevron-right"></i>
                        </figure>
                    </section>

                    <section v-if="validPublicKeys.length">
                        <div style="margin:20px 0; background:rgba(0,0,0,0.1); width:100%; height:1px;"></div>

                        <section class="breadcrumbs">
                            <figure class="breadcrumb">Select Existing Public Key</figure>
                        </section>

                        <section class="item" v-for="kp in validPublicKeys" @click="returnResult({keypair:kp, isNew:false})">
                            <figure class="title">{{kp.name}}</figure>
                            <figure class="sub-title">{{kp.publicKey}}</figure>
                            <figure class="chevron">
                                <i class="fa fa-check"></i>
                            </figure>
                        </section>
                    </section>
                </section>

                <section class="list" v-if="generatingNewKeypair">
                    <section class="breadcrumbs">
                        <figure class="breadcrumb button" @click="toggleGenerateKeypair">Back</figure>
                        <figure class="breadcrumb">Generate New Key Pair</figure>
                    </section>

                    <section style="padding:20px;">
                        <!--<cin :forced="keypair.name.length" placeholder="Name ( organizational )" :text="keypair.name" v-on:changed="changed => bind(changed, 'keypair.name')"></cin>-->
                        <cin disabled="true" :text="keypair.publicKey.substr(0,32)+'...'" copy="true"></cin>
                        <btn style="float:left;" large="true" v-on:clicked="copyKeyPair" :red="true" text="Copy Private Key"></btn>
                        <btn style="float:right;" large="true" v-on:clicked="returnResult({keypair, isNew:true})" text="Continue"></btn>
                    </section>
                </section>

                <section class="list" v-if="importingKeypair">
                    <section class="breadcrumbs">
                        <figure class="breadcrumb button" @click="toggleImportKeypair">Back</figure>
                        <figure class="breadcrumb">Import Key Pair</figure>
                    </section>

                    <section style="padding:20px;">
                        <!--<cin :forced="keypair.name.length" placeholder="Name ( organizational )" :text="keypair.name" v-on:changed="changed => bind(changed, 'keypair.name')"></cin>-->
                        <cin :key="id" type="password" placeholder="Private Key" :text="keypair.privateKey" v-on:changed="changed => bind(changed, 'keypair.privateKey')"></cin>
                        <figure class="existing-key" v-if="keyExists">This key already exists in your keychain under the name "{{keyExists.name}}".</figure>
                        <btn :disabled="!keypair.publicKey.length || keyExists" full="true" large="true" v-on:clicked="importKeypair()" text="Import and Continue"></btn>
                    </section>
                </section>


            </section>
        </section>



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import Keypair from '../../models/Keypair'
    import KeyPairService from '../../services/KeyPairService'
    import ElectronHelpers from '../../util/ElectronHelpers'
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup'
    import PluginRepository from '../../plugins/PluginRepository'
    import RIDLService from '../../services/RIDLService'

    export default {
        data () {return {
            keypair:Keypair.placeholder(),
            generatingNewKeypair:false,
            importingKeypair:false,
            searchTerms:'',
            id:Math.random()*99999 + 1
        }},
        computed:{
            ...mapState([
                'state'
            ]),
            ...mapGetters([
                'identities',
                'accounts',
                'keypairs',
            ]),
            validPublicKeys(){
                return this.keypairs.filter(x => this.payload.blockchain === x.blockchain);
            },
            selectingKeypair(){
                return !this.generatingNewKeypair && !this.importingKeypair
            },
            keyExists(){
                return this.keypairs.find(x => x.publicKey === this.keypair.publicKey);
            }
        },
        mounted(){
            this.keypair.name = `Key For ${this.payload.origin}`;
            this.keypair.blockchain = this.payload.blockchain;

            this.checkWarning();
        },
        methods: {
            async checkWarning(){
                const warn = await RIDLService.shouldWarn(RIDLService.buildEntityName('application', this.payload.origin));
                if(warn.length)
                    PopupService.push(Popup.selector('Warning', 'This entity has a negative reputation. Be careful interacting with it.',
                        'exclamation-triangle', warn, x => `${x.type}: ${x.reputation*100}% REP ( ${x.total_reputes} users )`, () => {}, true))
            },
            returnResult(result){
                this.$emit('returned', result);
            },
            async toggleGenerateKeypair(){
                this.generatingNewKeypair = !this.generatingNewKeypair;

                if(this.generatingNewKeypair) {
                    await KeyPairService.generateKeyPair(this.keypair);
                }
            },
            async toggleImportKeypair(){
                this.importingKeypair = !this.importingKeypair;
            },
            importKeypair(){
                this.returnResult({keypair:this.keypair, isNew:true});
            },
            async makePublicKey(){
                setTimeout(async () => {
                    await KeyPairService.makePublicKey(this.keypair);
                }, 100)
            },
            copyKeyPair(){
                ElectronHelpers.copy(this.keypair.privateKey);
                PopupService.push(Popup.snackbar("Keypair copied to clipboard!", "key"))
            },
        },
        props:['payload', 'pluginOrigin'],
        watch:{
            ['keypair.privateKey'](){
                this.keypair.publicKey = '';
                this.makePublicKey();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";

    .pop-in {
        width:200px;
    }

    .existing-key {
        width:100%;
        padding:10px 0;
        color:$red;
        font-weight: bold;
        font-size: 13px;
    }

    .popup {
        background:$very-light-blue;
        width:440px;
        height:560px;
        display: flex;
        flex-flow: column;

        .top-section {
            flex: 0 1 auto;
        }

        .head, .requirements, .search-bar {
            background:#fff;
            margin-bottom:1px;
        }

        .head {
            -webkit-app-region: drag;
            padding:20px;
            overflow: hidden;

            .logo {
                line-height: 40px;
                height:36px;
                width:36px;
                background:$light-blue;
                color:#fff;
                font-family: 'Grand Hotel', sans-serif;
                font-size:24px;
                border-radius:50%;
                text-align:center;
                float:left;
                padding-right: 1px;
            }

            .info {
                float:left;
                width:calc(100% - 36px);
                padding-left:20px;
                overflow: hidden;

                figure {
                    float:left;

                    &:first-child {
                        font-size:16px;
                        font-weight: 600;
                        width:100%;
                        padding-top:2px;
                    }

                    &:last-child {
                        font-size:11px;
                        color:$dark-grey;
                        margin-top:2px;
                    }
                }
            }

            .close {
                -webkit-app-region: no-drag;
                position:absolute;
                top:20px;
                right:20px;
                font-size:24px;
                color:$mid-light-grey;
                transition: color 0.2s ease;
                cursor: pointer;

                &:hover {
                    color:$light-blue;
                }
            }
        }

        .requirements {
            padding:15px 20px;

            .title {
                font-size:11px;
                font-style: italic;
                font-weight: 600;
                color:$medium-grey;
            }

            .requirement {
                font-size:13px;
                font-weight: 600;
                color:$dark-grey;
                margin-top:5px;
            }
        }

        .search-bar {
            padding:10px 20px;
            overflow: hidden;

            .icon {
                width:20px;
                float:left;
                font-size:11px;
                color:$medium-grey;
                padding-top:2px;
            }

            input {
                float:left;
                width:calc(100% - 20px);
                height:15px;
                outline:0;
                border:0;
                font-size:11px;
                color:$medium-grey;
            }

        }

        .lists {
            position:relative;
            flex: 1 1 auto;
            overflow-y:auto;

            .list {
                padding-bottom:30px;
                overflow-y:auto;
                position: relative;
                height:100%;

                .breadcrumbs {
                    padding:10px 20px;

                    .breadcrumb {
                        padding:6px 10px;
                        font-size:11px;
                        font-style: italic;
                        font-weight: 600;
                        color:$dark-grey;
                        border-radius:4px;
                        border: 1px dashed $medium-grey;
                        display:inline-block;

                        &.button {
                            cursor: pointer;
                            background:#fff;
                            border: 0;
                            box-shadow:0 1px 2px rgba(0,0,0,0.1);
                            transform:translateY(0px);
                            transition: box-shadow 0.1s ease, transform 0.1s ease;

                            &:hover {
                                transform:translateY(-1px);
                                box-shadow:0 3px 7px rgba(0,0,0,0.08);
                            }

                            &:active {
                                transform:translateY(1px);
                                box-shadow:0 1px 2px rgba(0,0,0,0.2);
                            }
                        }
                    }
                }


                .item {
                    cursor: pointer;
                    margin:0 20px;
                    padding:30px;
                    background:#fff;
                    color:$dark-grey;
                    border-radius:4px;
                    box-shadow:0 1px 2px rgba(0,0,0,0.1);
                    transform:translateY(0px);
                    transition: box-shadow 0.2s ease, transform 0.2s ease;
                    margin-bottom:10px;
                    padding-right:50px;

                    &.short {
                        padding:15px 30px;
                    }

                    .title {
                        font-size:18px;
                        color:$dark-grey;
                        font-weight: 600;
                        margin-bottom:5px;
                    }

                    .sub-title {
                        font-size:11px;
                        font-style: italic;
                    }

                    .chevron {
                        position:absolute;
                        right:20px;
                        top:0;
                        bottom:0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color:$mid-light-grey;
                    }

                    &:hover {
                        transform:translateY(-1px);
                        box-shadow:0 3px 7px rgba(0,0,0,0.08);
                    }

                    &:active {
                        transform:translateY(1px);
                        box-shadow:0 1px 2px rgba(0,0,0,0.2);
                    }
                }
            }

        }

    }
</style>