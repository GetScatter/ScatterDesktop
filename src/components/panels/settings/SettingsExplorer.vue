<template>
    <section>

        <section class="action-box top-pad" v-if="explorers">
            <section v-for="blockchain in blockchainsArray">
                <label>{{blockchainName(blockchain.value)}}</label>

                <sel :options="allExplorers[blockchain.value]"
                     :selected="explorers[blockchain.value]"
                     :parser="x => x.name"
                     v-on:changed="x => changedExplorer(blockchain.value, x)" />
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import {Blockchains, BlockchainsArray, blockchainName} from '../../../models/Blockchains';
    import PluginRepository from '../../../plugins/PluginRepository'



    export default {
        data () {return {
            blockchains:Blockchains,
            blockchainsArray:BlockchainsArray,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'explorers',
            ]),
            allExplorers(){
	            return PluginRepository.allExplorers()
            }
        },
        mounted(){
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
    @import "../../../variables";

    .action-box {
        > section {
            &:not(:first-child){
                margin-top:20px;
            }
        }
    }
</style>