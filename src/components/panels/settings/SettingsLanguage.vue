<template>
    <section>

        <section class="action-box top-pad">

            <sel :label="locale(langKeys.SETTINGS.LANGUAGE.Label)"
                 :options="Object.keys(languages).map(x => languages[x])"
                 :selected="selectedLanguage"
                 :parser="x => x"
                 v-on:changed="selectLanguage" />
        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import {LANG} from '../../../localization/locales';

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
                const scatter = this.scatter.clone();
                scatter.settings.language = language;
                this[Actions.SET_SCATTER](scatter);
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../variables";


</style>