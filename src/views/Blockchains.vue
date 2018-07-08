<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">
                <i class="fa fa-plus-square-o" @click="newItem"></i>
            </section>

            <section class="items-list scrollable">
                <section class="item-type-switcher">
                    <figure class="item-type" @click="subMenuType = subMenuTypes.KEYS"
                            :class="{'active':subMenuType === subMenuTypes.KEYS}">Keys & Accounts</figure>
                    <figure class="item-type" @click="subMenuType = subMenuTypes.NETWORKS"
                            :class="{'active':subMenuType === subMenuTypes.NETWORKS}">Networks</figure>
                </section>

                <section class="item" v-if="subMenuType === subMenuTypes.KEYS"
                         :class="{'active':selectedSubMenuItem && selectedSubMenuItem.publicKey === keypair.publicKey}"
                         v-for="keypair in keypairs" @click="selectedSubMenuItem = keypair">
                    <figure class="title">{{keypair.name}}</figure>
                    <figure class="description">
                        {{linkedAccounts(keypair)}} linked account{{linkedAccounts(keypair) === 1 ? '' : 's'}}
                    </figure>
                </section>

                <section class="item" v-if="subMenuType === subMenuTypes.NETWORKS"
                         :class="{'active':selectedSubMenuItem && selectedSubMenuItem.unique() === network.unique()}"
                         v-for="network in networks" @click="selectedSubMenuItem = network">
                    <figure class="title">{{network.name}}</figure>
                    <figure class="description">
                        Blockchain: {{network.blockchain.toUpperCase()}}<br>
                    </figure>
                </section>

            </section>
        </section>


        <keypair v-if="subMenuType === subMenuTypes.KEYS && selectedSubMenuItem" :key="selectedSubMenuItem.publicKey" :kp="selectedSubMenuItem"></keypair>
        <network v-if="subMenuType === subMenuTypes.NETWORKS && selectedSubMenuItem" :key="selectedSubMenuItem.unique()" :net="selectedSubMenuItem"></network>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import Keypair from '../models/Keypair'
    import Network from '../models/Network'

    const SubMenuTypes = {
        KEYS:'keys',
        NETWORKS:'networks'
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
                'scatter'
            ]),
            ...mapGetters([
                'keypairs',
                'accounts',
                'networks'
            ])
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