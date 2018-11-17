<template>
    <section>

        <section class="split-inputs">

            <sel :disabled="isNew" :options="networks" style="flex:3;"
                 :selected="network"
                 :parser="x => x.name"
                 v-on:changed="x => selectNetwork(x)"></sel>

            <section style="flex:1.5;" class="split-inputs" v-if="isNew || networkChanged">
                <btn style="flex:1; font-size: 11px;" text="Save" v-on:clicked="save" :blue="newNetworkReady || !isNew" />
                <btn style="flex:0.1;" icon="icon-cancel" v-on:clicked="cancelAdd" />
            </section>

            <section style="flex:1.5;" class="split-inputs" v-else>
                <btn style="flex:1; font-size: 11px;" text="Add" v-on:clicked="addNetwork" />
                <btn style="flex:0.1;" icon="icon-cancel" v-on:clicked="removeNetwork" />
            </section>
        </section>


        <section class="action-box top-pad" style="margin-top:10px; padding-bottom:0;">
            <section v-if="network">

                <sel label="Blockchain"
                     :disabled="!isNew"
                     :selected="blockchainName(network.blockchain)"
                     :options="blockchains"
                     :parser="blockchain => blockchainName(blockchain.value)"
                     v-on:changed="blockchain => network.blockchain = blockchain.value"></sel>
                <br>

                <section class="split-inputs">
                    <cin label="Name" placeholder="Local Network" :text="network.name" v-on:changed="changed => bind(changed, 'network.name')"></cin>
                    <cin label="Host ( domain.com or IP )" placeholder="127.0.0.1" :text="network.host" v-on:changed="changed => bind(changed, 'network.host')"></cin>
                </section>

                <section class="split-inputs">
                    <sel style="flex:1;" label="Protocol" :selected="network.protocol" :options="['http', 'https']" v-on:changed="x => network.protocol = x"></sel>
                    <cin style="flex:1; margin-bottom:0;" label="Port" placeholder="Port" type="number" :text="network.port > 0 ? network.port : ''" v-on:changed="changed => bind(changed, 'network.port')"></cin>
                </section>

                <br>

                <cin label="Chain ID"
                     :disabled="!isNew"
                     placeholder="Chain ID"
                     :text="network.chainId"
                     :dynamic-button="!isNew ? null : 'icon-globe-1'"
                     dynamic-tooltip="Fetch Chain ID"
                     v-on:dynamic="fetchChainId"
                     v-on:changed="changed => bind(changed, 'network.chainId')" />

                <cin :disabled="true" v-if="!isNew && network.fromOrigin" placeholder="From Origin" :text="network.fromOrigin" />
                <cin :disabled="true" v-if="!isNew && network.fromOrigin" placeholder="Timestamp" :text="new Date(network.createdAt).toLocaleString()" />

            </section>
        </section>

        <section class="action-box top-pad" style="margin-top:10px;" v-if="network && (isNew || network.token)">
            <label>Custom System Token</label>
            <section v-if="isNew">
                In some cases you might need to change the system token.

                <btn :red="!!network.token" style="float:right;"
                     :text="network.token
                     ? 'Use Default System Token'
                     : 'Use Custom System Token'"
                     v-on:clicked="useCustomToken" />
            </section>
            <section v-else>
                This network is using a custom token.
            </section>

            <section v-if="network.token">
                <br>
                <cin style="flex:1; margin-bottom:0;"
                     :placeholder="contractPlaceholder"
                     :text="network.token.contract"
                     :disabled="!isNew"
                     v-on:changed="x => network.token.contract = x"
                     label="Contract" />
                <br>
                <section class="split-inputs">
                    <cin :disabled="!isNew" placeholder="XXX" label="Symbol" :text="network.token.symbol" v-on:changed="x => network.token.symbol = x" />
                    <cin :disabled="!isNew" placeholder="4" type="number" label="Decimals" :text="network.token.decimals" v-on:changed="x => network.token.decimals = x" />
                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import {Blockchains, BlockchainsArray, blockchainName} from '../../../models/Blockchains';
    import PluginRepository from '../../../plugins/PluginRepository'
    import Network from '../../../models/Network';
    import PopupService from '../../../services/PopupService'
    import {Popup} from '../../../models/popups/Popup'
    import NetworkService from '../../../services/NetworkService';
    import Token from "../../../models/Token";


    export default {
        data () {return {
            blockchains:BlockchainsArray,
            network:null,
            endorsedNetworks:[],
            working:false,
            originalNetwork:null,
            networkChanged:false,
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
            },
	        contractPlaceholder(){
		        return PluginRepository.plugin(this.network.token.blockchain).contractPlaceholder();
	        },
        },
        mounted(){
            this.network = this.networks[0].clone();
            this.originalNetwork = this.networks[0].clone();
            BlockchainsArray.map(async blockchain => {
                this.endorsedNetworks.push(PluginRepository.plugin(blockchain.value).getEndorsedNetwork());
            })
        },
        methods: {
        	useCustomToken(){
        		if(this.network.token) return this.network.token = null;

        	    this.network.token = Token.placeholder();
        	    this.network.token.blockchain = this.network.blockchain;
            },
            blockchainName,
            selectNetwork(network){
            	this.network = network.clone();
	            this.originalNetwork = network;
            },
            addNetwork(){
                this.network = Network.placeholder();
            },
            cancelAdd(){
            	if(this.isNew) this.network = this.networks[0].clone();
            	else this.network = this.originalNetwork.clone();
	            this.networkChanged = false;
            },
            async fetchChainId(){
                this.network.chainId = await PluginRepository.plugin(this.network.blockchain).getChainId(this.network);
            },
            async save(){
                this.working = true;

	            if(this.isNew) await NetworkService.addNetwork(this.network);
	            else await NetworkService.updateNetwork(this.network);

	            this.originalNetwork = this.network.clone();
	            this.networkChanged = false;

                this.working = false;
            },
            async removeNetwork(){
                this.working = true;
                if(await NetworkService.removeNetwork(this.network))
                    setTimeout(() => this.network = this.networks[0], 250);

                this.working = false;
            },
            checkNetworkChanged(){
                this.networkChanged = JSON.stringify(this.network) !== JSON.stringify(this.originalNetwork);
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            ['network.host'](){
                if(this.network.host.indexOf('://') > -1) this.network.host = this.network.host.split('://')[1]
	            this.checkNetworkChanged();
            },
            ['network.port'](){
            	this.checkNetworkChanged();
            },
            ['network.protocol'](){
            	this.checkNetworkChanged();
            },
            ['network.name'](){
            	this.checkNetworkChanged();
            },
            ['network.blockchain'](){
            	if(this.network.token){
            		this.network.token.blockchain = this.network.blockchain;
		            this.network.token.decimals = PluginRepository.plugin(this.network.token.blockchain).defaultDecimals();
                }
            },
	        ['network.token.decimals'](){
		        if(this.network.token.decimals > 20) this.token.decimals = 20;
	        }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../variables";

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