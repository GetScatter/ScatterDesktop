<template>
    <section>

        <section class="action-box top-pad">
            <sel :label="locale(langKeys.SETTINGS.LANGUAGE.Label)"
                 :options="names"
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
    import LanguageService from "../../../services/LanguageService";

    export default {
        data () {return {
            languages:LANG,
	        names:['English'],
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
                'language',
            ]),
            selectedLanguage(){
                return this.scatter.settings.language
            }
        },
        mounted(){
        	LanguageService.getLanguageNames().then(names => {
        		if(names) this.names = names;
            })
        },
        methods: {
            selectLanguage(language){
	            const scatter = this.scatter.clone();
	            scatter.settings.language = language;
            	LanguageService.getLanguage(language).then(res => {
		            res.raw = JSON.stringify(res);
		            this[Actions.SET_LANGUAGE](res);
		            this[Actions.SET_SCATTER](scatter);
                })
            },
            ...mapActions([
                Actions.SET_SCATTER,
                Actions.SET_LANGUAGE,
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";


</style>