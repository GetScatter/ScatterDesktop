<template>
    <section>

        <section v-if="network">
            <section class="head">
                <i class="fa fa-trash-o" v-if="!isRIDLNetwork" @click="deleteNetwork" v-tooltip="'Delete Network'"></i>
            </section>

            <section class="selected-item scrollable" v-if="network">

                <figure class="name" :class="{'bad-name':badNetworkName()}">{{network.name.length ? network.name : 'Network Name Required'}}</figure>
                <section v-if="isEndorsed" class="description">
                    <b><u>This is a Scatter endorsed network which makes it easier to use Scatter. It can not be modified.</u></b>
                    <br><br>
                </section>
                <figure class="description">
                    Networks allow you to define where your blockchain keys and accounts exist. Some websites use testing networks or non-standard networks
                    to interact with proprietary blockchains. You do not have to fear them as Scatter still protects you and they will never be able to
                    get your private keys.
                </figure>

                <section class="split-panels left">
                    <section class="info-box" v-if="isNew && restorableNetworks.length">
                        <figure class="header">Restore Endorsed Networks</figure>

                        <section>
                            <sel :selected="selectedEndorsedNetwork || restorableNetworks[0]"
                                 :options="restorableNetworks"
                                 :parser="n => n.name"
                                 v-on:changed="n => selectedEndorsedNetwork = n"></sel>

                            <btn text="Restore Endorsed Network" :secondary="true" v-on:clicked="network = (selectedEndorsedNetwork || restorableNetworks[0])"></btn>
                        </section>
                    </section>

                    <section class="info-box">
                        <sel :disabled="isEndorsed" :selected="network.blockchain.toUpperCase()"
                             :options="blockchains"
                             :parser="blockchain => blockchain.value.toUpperCase()"
                             v-on:changed="blockchain => network.blockchain = blockchain.value"></sel>

                        <cin :disabled="isEndorsed" placeholder="Name ( organizational )" :text="network.name" v-on:changed="changed => bind(changed, 'network.name')"></cin>

                        <cin :disabled="isEndorsed" placeholder="Host ( domain.com or IP )" :text="network.host" v-on:changed="changed => bind(changed, 'network.host')"></cin>
                        <cin :disabled="isEndorsed" placeholder="Port" type="number" :text="network.port" v-on:changed="changed => bind(changed, 'network.port')"></cin>

                        <swch :disabled="isEndorsed" first="http"
                              second="https" :selected="network.protocol === 'http' ? 'https' : 'http'"
                              v-on:switched="network.protocol = network.protocol === 'http' ? 'https' : 'http'"></swch>

                        <cin :disabled="isEndorsed" placeholder="Chain ID" :text="network.chainId"
                             :dynamic-button="isEndorsed ? null : 'chain'" dynamic-tooltip="Fetch Chain ID" v-on:dynamic="fetchChainId" v-on:changed="changed => bind(changed, 'network.chainId')"></cin>
                    </section>


                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import Network from '../../models/Network'

    import {Popup} from '../../models/popups/Popup'
    import PopupService from '../../services/PopupService';

    import PluginRepository from '../../plugins/PluginRepository';
    import {BlockchainsArray} from '../../models/Blockchains';

    let saveTimeout = null;

    export default {
        data () {return {
            blockchains:BlockchainsArray,
            network:null,
            isEndorsed:true,
            endorsedNetworks:[],
            selectedEndorsedNetwork:null,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
            ]),
            restorableNetworks(){
//                return this.endorsedNetworks;
                const uniques = this.networks.map(x => x.unique());
                return this.endorsedNetworks.filter(x => !uniques.includes(x.unique()));
            },
            isNew(){
                return !this.networks.map(x => x.unique()).includes(this.network.unique());
            },
            isRIDLNetwork(){
                return this.network.name === 'RIDL'
            }
        },
        mounted(){
            this.network = this.net.clone();

            if(this.network.name === 'RIDL') this.isEndorsed = true;
            else PluginRepository.plugin(this.network.blockchain).isEndorsedNetwork(this.network).then(x => this.isEndorsed = x);

            BlockchainsArray.map(async blockchain => {
                this.endorsedNetworks.push(await PluginRepository.plugin(blockchain.value).getEndorsedNetwork());
            })
        },
        methods: {
            badNetworkName(){
                return !this.network.name.length
            },
            async fetchChainId(){
                this.network.chainId = await PluginRepository.plugin(this.network.blockchain).getChainId(this.network);
            },
            save(){
                // Can't modify endorsed networks.
                if(this.isEndorsed) return;
                if(!this.network.name.length) return false;
                if(!this.network.host.length) return false;

                this.network.setPort();

                const otherNetworks = this.networks.filter(x => x.id !== this.network.id);

                if(otherNetworks.find(x => x.name.toLowerCase() === this.network.name.toLowerCase()))
                    return PopupService.push(Popup.snackbar("A network with this name already exists", "ban"));

                if(otherNetworks.find(x => x.chainId === this.network.chainId))
                    return PopupService.push(Popup.snackbar("A network with this chain id already exists", "ban"));

                const scatter = this.scatter.clone();
                scatter.settings.updateOrPushNetwork(this.network);
                this[Actions.SET_SCATTER](scatter);
                PopupService.push(Popup.snackbar("Network Saved!", "check"));
                PluginRepository.plugin(this.network.blockchain).isEndorsedNetwork(this.network).then(x => this.isEndorsed = x);
                this.$emit('selected', this.network);
            },
            deleteNetwork(){
                PopupService.promptGuard(Popup.prompt(
                    "Deleting Network", "This will delete this network, as well as all associated accounts and their permissions.",
                    "trash-o", "Delete Network"
                ), async accepted => {
                    if(accepted) {
                        //TODO: Remove accounts, and permissions.
                        const scatter = this.scatter.clone();
                        scatter.settings.removeNetwork(this.network);
                        await this[Actions.SET_SCATTER](scatter);
                        this.network = Network.placeholder();
                        PopupService.push(Popup.snackbar("Network Deleted!", "check"));
                        this.$emit('selected', this.network);
                    }
                });
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['net'],
        watch:{
            network:{
                handler(a,b){
                    if(!b) return;
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        this.save();
                    }, 500);
                },
                deep:true
            }
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";


</style>
