<template>
    <section>

        <section class="panel display">
            <section class="head">

            </section>

            <section class="selected-item scrollable">
                <figure class="name">Configure Auto Lock</figure>
                <figure class="description">Scatter is available in multiple languages, because blockchain is all about communities from all around the world.</figure>

                <section class="info-box">


                    <sel :placeholder="'Language'"
                         :options="languages"
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

    const LanguageOptions = {
        ENGLISH:'English'
    }

    export default {
        data () {return {
            languages:LanguageOptions
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
            ]),
            selectedLanguage(){
                return LanguageOptions.ENGLISH
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