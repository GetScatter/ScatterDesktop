<template>
    <section>

        <section class="panel display">
            <section class="head">
                <i class="fa fa-trash-o" @click="deleteNetwork"></i>
            </section>

            <section class="selected-item scrollable" v-if="network">

                <figure class="name" :class="{'bad-name':badNetworkName()}">{{network.name.length ? network.name : 'Network Name Required'}}</figure>
                <section v-if="isEndorsed" class="description">
                    <b><u>This is a Scatter endorsed network which makes it easier to use Scatter. It can not be modified.</u></b>
                    <br><br>
                </section>
                <figure class="description">
                    Networks allow you to define where your blockchiun keys and accounts exist. So websites use testing networks or non-standard networks
                    to interact with proprietary blockchains. You do not have to fear them as Scatter still protects you and they will never be able to
                    get your private keys.
                </figure>



                <section class="split-panels left">
                    <section class="info-box">
                        <figure class="header">Network Information</figure>

                        <sel :disabled="isEndorsed" :selected="network.blockchain.toUpperCase()"
                             :options="blockchains"
                             :parser="blockchain => blockchain.value.toUpperCase()"
                             v-on:changed="blockchain => network.blockchain = blockchain.value"></sel>

                        <cin :disabled="isEndorsed" placeholder="Name ( organizational )" :text="network.name" v-on:changed="changed => bind(changed, 'network.name')"></cin>

                        <cin :disabled="isEndorsed" placeholder="Host ( domain.com or IP )" :text="network.host" v-on:changed="changed => bind(changed, 'network.host')"></cin>
                        <cin :disabled="isEndorsed" placeholder="Port" type="number" :text="network.port" v-on:changed="changed => bind(changed, 'network.port')"></cin>

                        <btn text="http" :disabled="isEndorsed" :secondary="network.protocol !== 'http'" v-on:clicked="network.protocol = 'http'"></btn>
                        <btn text="https" :disabled="isEndorsed" :secondary="network.protocol !== 'https'" v-on:clicked="network.protocol = 'https'"></btn>

                        <cin :disabled="isEndorsed" placeholder="Chain ID" :text="network.chainId"
                             :dynamic-button="isEndorsed ? null : 'chain'" v-on:dynamic="fetchChainId" v-on:changed="changed => bind(changed, 'network.chainId')"></cin>




                        <!--<br>-->
                        <!--<btn :red="appLink.enabledByDefault" :secondary="!appLink.enabledByDefault" v-on:clicked="toggleEnableByDefault"-->
                             <!--:text="appLink.enabledByDefault ? 'Starts with Scatter' : 'Starts Manually Only'"></btn>-->
                        <!--<btn v-on:clicked="saveAppLink" :text="isNew() ? 'Save Application Link' : 'Update Application Link'" style="float:right;"></btn>-->
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
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
            ])
        },
        mounted(){
            console.log('this.net', this.net);
            this.network = this.net.clone();
            PluginRepository.plugin(this.network.blockchain).isEndorsedNetwork(this.network).then(x => this.isEndorsed = x);
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
                handler(){
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