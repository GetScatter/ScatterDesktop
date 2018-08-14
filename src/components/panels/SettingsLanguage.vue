<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item scrollable">
                <figure class="name">Select your Language</figure>
                <figure class="description">Scatter is available in multiple languages, because blockchain is all about communities from all around the world.</figure>

                <section class="info-box">


                    <sel :placeholder="'Language'"
                         :options="Object.keys(languages).map(x => languages[x])"
                         :selected="selectedLanguage"
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


</style>