<template>
    <section>

        <section class="panel-switch" v-if="addableNetworks.length">
            <figure class="button" :class="{'active':state === STATES.KNOWN}" @click="state = STATES.KNOWN">{{locale(langKeys.SETTINGS.NETWORKS.SWITCH.Known)}}</figure>
            <figure class="button" :class="{'active':state === STATES.CUSTOM}" @click="state = STATES.CUSTOM">{{locale(langKeys.SETTINGS.NETWORKS.SWITCH.Custom)}}</figure>
        </section>

        <br>
        <br>

        <section v-if="state === STATES.KNOWN">

            <section class="action-box top-pad" style="margin-top:0;">
                <label>{{locale(langKeys.SETTINGS.NETWORKS.KNOWN.AddLabel)}}</label>
                {{locale(langKeys.SETTINGS.NETWORKS.KNOWN.AddDescription)}}
                <br><br>
                <br>
                <section class="split-inputs">

                    <sel :options="addableNetworks" style="flex:3;"
                         :selected="knownNetwork"
                         :parser="x => x.name"
                         :subparser="x => blockchainName(x.blockchain)"
                         v-on:changed="x => knownNetwork = x" />

                    <btn style="flex:1; font-size: 11px; margin-top:0;" :disabled="working" :loading="working"
                         :text="locale(langKeys.GENERIC.Add)" v-on:clicked="addKnownNetwork" />
                </section>
            </section>

        </section>

        <section v-if="state === STATES.CUSTOM">
            <section class="split-inputs">

                <sel :disabled="isNew" :options="networks" style="flex:3;"
                     :selected="network"
                     :parser="x => x.name"
                     v-on:changed="x => selectNetwork(x)" />

                <section style="flex:1.5;" class="split-inputs" v-if="isNew || networkChanged">
                    <btn style="flex:1; font-size: 11px;" :loading="working" :text="locale(langKeys.GENERIC.Save)" v-on:clicked="save" :blue="newNetworkReady || !isNew" />
                    <btn style="flex:0.1;" v-if="!working" icon="icon-cancel" v-on:clicked="cancelAdd" />
                </section>

                <section style="flex:1.5;" class="split-inputs" v-else>
                    <btn style="flex:1; font-size: 11px;" :loading="working" :text="locale(langKeys.GENERIC.Add)" blue="1" v-on:clicked="addNetwork" />
                    <btn style="flex:0.1;" v-if="!working" icon="icon-cancel" v-on:clicked="removeNetwork" />
                </section>
            </section>


            <section class="action-box top-pad" style="margin-top:10px; padding-bottom:0;">
                <section v-if="network">

                    <sel :label="locale(langKeys.GENERIC.Blockchain)"
                         :disabled="!isNew"
                         :selected="{value:network.blockchain}"
                         :options="blockchains"
                         :parser="blockchain => blockchainName(blockchain.value)"
                         v-on:changed="blockchain => network.blockchain = blockchain.value" />
                    <br>

                    <section class="split-inputs">
                        <cin :label="locale(langKeys.GENERIC.Name)"
                             :placeholder="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.NamePlaceholder)"
                             :text="network.name"
                             v-on:changed="x => network.name = x"></cin>
                        <cin :label="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.HostLabel)"
                             placeholder="127.0.0.1"
                             :text="network.host"
                             v-on:changed="x => network.host = x"></cin>
                    </section>

                    <section class="split-inputs">
                        <sel style="flex:1;"
                             :label="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.ProtocolLabel)"
                             :selected="network.protocol"
                             :options="['http', 'https']"
                             v-on:changed="x => network.protocol = x" />

                        <cin style="flex:1; margin-bottom:0;"
                             :label="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.PortLabel)"
                             placeholder="443"
                             type="number"
                             :text="network.port > 0 ? network.port : ''"
                             v-on:changed="x => network.port = x" />
                    </section>

                    <br>

                    <cin :label="locale(langKeys.GENERIC.ChainID)"
                         :disabled="!isNew"
                         placeholder="x..."
                         :text="network.chainId"
                         :dynamic-button="!isNew ? null : 'icon-globe-1'"
                         :dynamic-tooltip="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.ChainIdTooltip)"
                         :copy="!isNew"
                         v-on:dynamic="fetchChainId"
                         v-on:changed="x => network.chainId = x" />

                    <cin :disabled="true" v-if="!isNew && network.fromOrigin"
                         :placeholder="locale(langKeys.SETTINGS.NETWORKS.CUSTOM.FromOriginPlaceholder)"
                         :text="network.fromOrigin" />
                    <cin :disabled="true" v-if="!isNew && network.fromOrigin"
                         :placeholder="locale(langKeys.GENERIC.Timestamp)"
                         :text="new Date(network.createdAt).toLocaleString()" />

                </section>
            </section>

            <section class="action-box top-pad" style="margin-top:10px;" v-if="network && (isNew || network.token)">
                <label>{{locale(langKeys.SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenLabel)}}</label>
                <section v-if="isNew">
                    <p>{{locale(langKeys.SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenDescription)}}</p>

                    <btn :red="!!network.token" style="float:right;"
                         :text="network.token
                     ? locale(langKeys.SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenUseDefaultButton)
                     : locale(langKeys.SETTINGS.NETWORKS.CUSTOM.CustomSystemTokenUseCustomButton)"
                         v-on:clicked="useCustomToken" />
                </section>
                <section v-else>
                    <p>{{locale(langKeys.SETTINGS.NETWORKS.CUSTOM.UsingCustomSystemToken)}}</p>
                </section>

                <section v-if="network.token">
                    <br>
                    <cin style="flex:1; margin-bottom:0;"
                         :placeholder="contractPlaceholder"
                         :text="network.token.contract"
                         :disabled="!isNew"
                         v-on:changed="x => network.token.contract = x"
                         :label="locale(langKeys.GENERIC.Contract)" />
                    <br>
                    <section class="split-inputs">
                        <cin :disabled="!isNew" placeholder="XXX"
                             :label="locale(langKeys.GENERIC.Symbol)"
                             :text="network.token.symbol"
                             v-on:changed="x => network.token.symbol = x" />
                        <cin :disabled="!isNew" placeholder="4" type="number"
                             :label="locale(langKeys.GENERIC.Decimals)"
                             :text="network.token.decimals" v-on:changed="x => network.token.decimals = x" />
                    </section>
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
    import {GET} from "../../../services/BackendApiService";


    const STATES = {
        KNOWN:'known',
        CUSTOM:'custom',
    };

    export default {
        data () {return {
        	state:STATES.CUSTOM,
	        STATES,

            blockchains:BlockchainsArray,
            network:null,
            endorsedNetworks:[],
            working:false,
            originalNetwork:null,
            networkChanged:false,

            knownNetworks:[],
	        knownNetwork:null,
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
                return this.isNew && this.network.isValid()
            },
	        contractPlaceholder(){
		        return PluginRepository.plugin(this.network.token.blockchain).contractPlaceholder();
	        },
            addableNetworks(){
	            const existingUniques = this.networks.map(x => x.unique());
            	return this.knownNetworks
		            .filter(x => !existingUniques.includes(x.unique()));
            }
        },
        mounted(){
            this.network = this.networks[0].clone();
            this.originalNetwork = this.networks[0].clone();
            BlockchainsArray.map(async blockchain => {
                this.endorsedNetworks.push(PluginRepository.plugin(blockchain.value).getEndorsedNetwork());
            })

	        GET(`networks?flat=true`)
                .then(networks => {
                	this.knownNetworks = networks
                        .map(x => Network.fromJson(x));

                	if(this.addableNetworks.length) this.knownNetwork = this.addableNetworks[0];
                }).catch(() => {});
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

	            if(this.addableNetworks.length) this.knownNetwork = this.addableNetworks[0];
	            setTimeout(() => {
		            this.working = false;
		            this.networkChanged = false;
                }, 500);
            },
            checkNetworkChanged(){
                this.networkChanged = JSON.stringify(this.network) !== JSON.stringify(this.originalNetwork);
            },
            async addKnownNetwork(){
                this.network = this.knownNetwork.clone();
                await this.save();
                this.state = STATES.CUSTOM;
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
		            this.network.token.chainId = this.network.chainId;
                }
            },
            ['network.chainId'](){
            	if(this.network.token){
		            this.network.token.chainId = this.network.chainId;
                }
            },
	        ['network.token.decimals'](){
            	if(!this.network.token) return;
		        if(this.network.token.decimals > 20) this.token.decimals = 20;
	        }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

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
                        background:$secondary;
                        border:1px solid $secondary;
                        color:#fff;
                    }
                }

                transition: all 0.2s ease;
                transition-property: color, background, border;

                &:hover {
                    background:$secondary;
                    border:1px solid $secondary;
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