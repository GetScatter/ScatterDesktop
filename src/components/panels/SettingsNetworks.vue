<template>
    <section class="panel">

        <section class="networks" :class="{'working':working}">
            <section class="selected-item">
                <figure class="name">Configure Scatter's Networks</figure>
                <figure class="description">
                    Networks inside of Scatter allow it to import accounts for various blockchains.
                    When you add or remove a network every item in your vault is affected.
                </figure>

                <figure class="line"></figure>
                <br><br>

                <section class="inline-inputs">
                    <section class="inputs">
                        <label>Networks</label>
                        <figure class="breaker" style="margin-top:10px;"></figure>
                        <section class="flexer">
                            <sel :disabled="isNew" :options="networks" style="flex:3;"
                                 :selected="network"
                                 :parser="x => x.name"
                                 v-on:changed="x => network = x"></sel>

                            <section style="display:flex;">
                                <transition name="slide-left" mode="out-in">
                                    <section style="display:flex;" v-if="isNew">
                                        <figure class="action red large relative" :class="{'ready glow':newNetworkReady}" v-tooltip="'Save New Network'" @click="save">
                                            <i class="fa fa-check"></i>
                                        </figure>
                                        <figure class="action red large relative" v-tooltip="'Cancel'" @click="cancelAdd">
                                            <i class="fa fa-ban"></i>
                                        </figure>
                                    </section>

                                    <section style="display:flex;" v-else>
                                        <figure class="action large relative" v-tooltip="'Add New Network'" @click="addNetwork">
                                            <i class="fa fa-plus"></i>
                                        </figure>
                                        <figure class="action red large relative" v-tooltip="'Remove Selected Network'" @click="removeNetwork">
                                            <i class="fa fa-ban"></i>
                                        </figure>
                                    </section>
                                </transition>
                            </section>
                        </section>

                    </section>
                </section>


                <figure class="line"></figure>

                <section v-if="network">

                    <sel :disabled="!isNew" :selected="network.blockchain.toUpperCase()"
                         :options="blockchains"
                         :parser="blockchain => blockchainName(blockchain.value)"
                         v-on:changed="blockchain => network.blockchain = blockchain.value"></sel>

                    <section class="multi-inputs">
                        <cin :disabled="!isNew" placeholder="Name ( organizational )" :text="network.name" v-on:changed="changed => bind(changed, 'network.name')"></cin>
                        <cin :disabled="!isNew" placeholder="Host ( domain.com or IP )" :text="network.host" v-on:changed="changed => bind(changed, 'network.host')"></cin>
                    </section>

                    <section class="multi-inputs" style="margin-top:20px;">
                        <sel :disabled="!isNew" :selected="network.protocol" :options="['http', 'https']" v-on:changed="x => network.protocol = x"></sel>
                        <cin :disabled="!isNew" placeholder="Port" type="number" :text="network.port > 0 ? network.port : ''" v-on:changed="changed => bind(changed, 'network.port')"></cin>
                    </section>

                    <cin :disabled="!isNew" placeholder="Chain ID" :text="network.chainId"
                         :dynamic-button="!isNew ? null : 'chain'" dynamic-tooltip="Fetch Chain ID" v-on:dynamic="fetchChainId" v-on:changed="changed => bind(changed, 'network.chainId')"></cin>

                    <cin :disabled="true" v-if="!isNew && network.fromOrigin" placeholder="From Origin" :text="network.fromOrigin"></cin>
                    <cin :disabled="true" v-if="!isNew && network.createdAt" placeholder="Timestamp" :text="new Date(network.createdAt).toLocaleString()"></cin>

                </section>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {Blockchains, BlockchainsArray, blockchainName} from '../../models/Blockchains';
    import PluginRepository from '../../plugins/PluginRepository'
    import Network from '../../models/Network';
    import PopupService from '../../services/PopupService'
    import {Popup} from '../../models/popups/Popup'
    import NetworkService from '../../services/NetworkService';


    export default {
        data () {return {
            blockchains:BlockchainsArray,
            network:null,
            endorsedNetworks:[],
            working:false,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
            ]),
            isNew(){
                if(!this.network) return false;
                return !this.networks.find(x => x.id === this.network.id);
            },
            newNetworkReady(){
                return this.isNew && this.network.filledNetwork()
            }
        },
        mounted(){
            this.network = this.networks[0].clone();
            BlockchainsArray.map(async blockchain => {
                this.endorsedNetworks.push(await PluginRepository.plugin(blockchain.value).getEndorsedNetwork());
            })
        },
        methods: {
            blockchainName,
            addNetwork(){
                this.network = Network.placeholder();
            },
            cancelAdd(){
                this.network = this.networks[0];
            },
            async fetchChainId(){
                this.network.chainId = await PluginRepository.plugin(this.network.blockchain).getChainId(this.network);
            },
            async save(){
                this.working = true;
                await NetworkService.addNetwork(this.network);
                this.working = false;
            },
            async removeNetwork(){
                this.working = true;
                if(await NetworkService.removeNetwork(this.network))
                    setTimeout(() => this.network = this.networks[0], 250);

                this.working = false;
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            ['network.host'](){
                if(this.network.host.indexOf('://') > -1) this.network.host = this.network.host.split('://')[1]
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .multi-inputs {
        display:flex;

        section {
            &:not(:first-child){
                flex:0 1 auto;
                padding-left:10px;
                border-left:1px solid rgba(0,0,0,0.1);
            }
        }
    }

    .line {
        width:100%;
        height:1px;
        background:rgba(0,0,0,0.1);
        margin:5px 0 20px;
    }

    .flexer {
        display:flex;
        input {
            &:not(:first-child){
                border-left:1px dashed rgba(0,0,0,0.2);
                padding-left:10px;
            }
        }
    }

    .networks {
        opacity:1;
        transition: opacity 0.4s ease;

        &.working {
            opacity:0.2;
            pointer-events: none;
        }


        .breaker {
            width:100%;
            clear:both;
        }

        .inline-inputs {
            display:flex;

        }

        .inputs {
            margin-bottom:20px;
            position: relative;
            width:100%;

            .flexer {
                display:flex;
                input {
                    &:not(:first-child){
                        border-left:1px dashed rgba(0,0,0,0.2);
                        padding-left:10px;
                    }
                }
            }

            label {
                font-size: 11px;

                &.red {
                    color:$red;
                    font-weight: bold;
                    font-size: 16px;
                    margin-top:10px;
                    display:block;
                }
            }

            .action {
                cursor: pointer;
                position:absolute;
                top:15px;
                right:0;
                width:35px;
                height:35px;
                line-height:33px;
                font-size: 16px;
                text-align:center;
                border:1px solid rgba(0,0,0,0.2);
                color:rgba(0,0,0,0.3);
                border-radius:2px;

                &.large {
                    width:50px;
                    height:50px;
                    line-height: 48px;
                    top:29px;
                    font-size: 18px;

                    &.relative {
                        position:relative;
                        margin-top:0;
                        margin-left:10px;
                        top:0;
                    }

                    &.ready {
                        background:$light-blue;
                        border:1px solid $light-blue;
                        color:#fff;
                    }
                }

                transition: all 0.2s ease;
                transition-property: color, background, border;

                &:hover {
                    background:$light-blue;
                    border:1px solid $light-blue;
                    color:#fff;
                }

                &.red {
                    &:hover {
                        background:$red;
                        border:1px solid $red;
                        color:#fff;
                    }
                }
            }
        }
    }
</style>