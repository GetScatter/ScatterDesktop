<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item scrollable">
                <figure class="name">Select a Block Explorer</figure>
                <figure class="description">Block Explorers allow you to view transactions, accounts, and other details about blockchains.</figure>

                <figure class="line"></figure>

                <section class="info-box">
                    <figure class="name">EOS</figure>
                    <sel :options="['bloks', 'eosflare']"
                         :selected="'bloks'"
                         :parser="x => x"
                         v-on:changed="selectLanguage"></sel>
                </section>

                <section class="info-box">
                    <figure class="name">Ethereum</figure>
                    <sel :options="['etherscan']"
                         :selected="'etherscan'"
                         :parser="x => x"
                         v-on:changed="selectLanguage"></sel>
                </section>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {LANG} from '../../localization/locales';



    export default {
        data () {return {
            languages:LANG
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
            ]),
            selectedLanguage(){
                return LANG.ENGLISH
            }
        },
        mounted(){
        },
        methods: {
            selectLanguage(language){

            },
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