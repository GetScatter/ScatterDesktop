<template>
    <section>

        <section class="panel sub-menu">

            <sub-menu-head v-on:new="newItem" :tooltip="`New ${this.subMenuType}`"></sub-menu-head>

            <section class="items-list scrollable">
                <section class="item-type-switcher">
                    <figure class="item-type" @click="subMenuType = subMenuTypes.KEYS"
                            :class="{'active':subMenuType === subMenuTypes.KEYS}">Keys & Accounts</figure>
                    <figure class="item-type" @click="subMenuType = subMenuTypes.NETWORKS"
                            :class="{'active':subMenuType === subMenuTypes.NETWORKS}">Networks</figure>
                </section>

                <menu-search></menu-search>

                <section class="item" v-if="subMenuType === subMenuTypes.KEYS"
                         :class="{'active':selectedSubMenuItem && selectedSubMenuItem.publicKey === keypair.publicKey}"
                         v-for="keypair in filteredKeypairs" @click="selectedSubMenuItem = keypair">
                    <figure class="title">{{keypair.name}}</figure>
                    <figure class="description">
                        {{linkedAccounts(keypair)}} linked account{{linkedAccounts(keypair) === 1 ? '' : 's'}}
                    </figure>
                </section>

                <section class="item" v-if="subMenuType === subMenuTypes.NETWORKS"
                         :class="{'active':selectedSubMenuItem && selectedSubMenuItem.unique() === network.unique()}"
                         v-for="network in filteredNetworks" @click="selectedSubMenuItem = network">
                    <figure class="title">{{network.name}}</figure>
                    <figure class="description">
                        Blockchain: {{network.blockchain.toUpperCase()}}<br>
                    </figure>
                </section>

            </section>
        </section>


        <section class="panel display">
            <transition name="slide-right">
                <keypair v-on:selected="selectedNewItem" v-if="subMenuType === subMenuTypes.KEYS && selectedSubMenuItem"
                         :key="selectedSubMenuItem.id" :kp="selectedSubMenuItem"></keypair>
                <network v-on:selected="selectedNewItem" v-if="subMenuType === subMenuTypes.NETWORKS && selectedSubMenuItem"
                         :key="selectedSubMenuItem.id" :net="selectedSubMenuItem"></network>
            </transition>
        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import Keypair from '../models/Keypair'
    import Network from '../models/Network'

    const SubMenuTypes = {
        KEYS:'Keypair',
        NETWORKS:'Network'
    };

    export default {
        name: 'Blockchains',
        data () {return {
            subMenuTypes:SubMenuTypes,
            subMenuType:SubMenuTypes.KEYS,
            selectedSubMenuItem:null
        }},
        computed: {
            ...mapState([
                'scatter',
                'searchTerms'
            ]),
            ...mapGetters([
                'keypairs',
                'accounts',
                'networks'
            ]),
            filteredKeypairs(){
                return this.keypairs.filter(x => (this.selectedSubMenuItem !== null && x.id === this.selectedSubMenuItem.id) ||
                                                 x.name.toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1 ||
                                                 x.publicKey.toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1)
            },
            filteredNetworks(){
                return this.networks.filter(x => (this.selectedSubMenuItem !== null && x.id === this.selectedSubMenuItem.id) ||
                                                 x.name.toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1 ||
                                                 x.unique().toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1)
            }
        },
        mounted(){
            this.bindSelected();
        },
        methods: {
            bindSelected(){
                if(this.subMenuType === SubMenuTypes.KEYS){
                    if(this.keypairs.length) this.selectedSubMenuItem = this.keypairs[0];
                    else this.selectedSubMenuItem = Keypair.placeholder();
                }
                if(this.subMenuType === SubMenuTypes.NETWORKS){
                    if(this.networks.length) this.selectedSubMenuItem = this.networks[0];
                    else this.selectedSubMenuItem = Network.placeholder();
                }
            },
            newItem(){
                this.selectedSubMenuItem = this.subMenuType === SubMenuTypes.KEYS
                    ? Keypair.placeholder()
                    : Network.placeholder();

            },
            linkedAccounts(keypair){
                return this.accounts.filter(x => x.keypairUnique === keypair.unique()).length
            },
            selectedNewItem(item){
                this.selectedSubMenuItem = item;
            }
        },
        watch:{
            subMenuType(){
                this.bindSelected();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";
</style>
