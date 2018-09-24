<template>
    <section>

        <section class="panel">
            <section class="selected-item" v-if="Object.keys(allExplorers).length">
                <figure class="name">Select a Block Explorer</figure>
                <figure class="description">Block Explorers allow you to view transactions, accounts, and other details about blockchains.</figure>

                <figure class="line"></figure>

                <section class="info-box" v-for="blockchain in blockchainsArray">
                    <figure class="name">{{blockchainName(blockchain.value)}}</figure>
                    <sel :options="allExplorers[blockchain.value]"
                         :selected="explorers[blockchain.value]"
                         :parser="x => x.name"
                         v-on:changed="x => changedExplorer(blockchain.value, x)"></sel>
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



    export default {
        data () {return {
            blockchains:Blockchains,
            blockchainsArray:BlockchainsArray,
            allExplorers:{}
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'explorers',
            ])
        },
        mounted(){
            this.allExplorers = PluginRepository.allExplorers();
        },
        methods: {
            changedExplorer(blockchain, explorer){
                const scatter = this.scatter.clone();
                scatter.settings.explorers[blockchain] = explorer;
                this[Actions.SET_SCATTER](scatter);
            },
            blockchainName(x){ return blockchainName(x); },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .line {
        width:100%;
        height:1px;
        background:rgba(0,0,0,0.1);
        margin-top:30px;
    }
</style>