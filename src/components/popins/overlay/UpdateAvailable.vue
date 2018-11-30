<template>
    <section>

        <PopinHead :popin="popin" name="Scatter Update Available" />
        <section class="panel centered">
            <figure class="description"><b>Scatter Desktop</b> - <b class="blue">{{update.name}}</b> (v{{update.stringVersion}})</figure>
            <br>
            <!--<figure class="description">{{update.body}}</figure>-->

            <section class="markdown">
                <VueMarkdown>{{update.body}}</VueMarkdown>
            </section>


            <br>
            <br>
            <label>Click the link below to go to the downloads page</label>
            <figure class="description link" @click="open">{{update.url}}</figure>

            <br>
            <br>
            <btn :text="locale(langKeys.GENERIC.Okay)"
                 v-on:clicked="returnResult(true)" />
        </section>


    </section>
</template>

<script>
    import {RouteNames} from '../../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import ElectronHelpers from '../../../util/ElectronHelpers'
    import PopinHead from "./PopinHead";
    import VueMarkdown from 'vue-markdown'

    export default {
	    components: {VueMarkdown, PopinHead},
	    props:['popin'],
        data(){ return {

        }},
        mounted(){

        },
        computed:{
            ...mapGetters([
                'explorers',
            ]),
            update(){
            	return this.popin.data.props.update;
            }
        },
        methods:{
            returnResult(truthy){
                this.popin.data.callback(truthy);
                this[Actions.RELEASE_POPUP](this.popin);
            },
            open(){
                ElectronHelpers.openLinkInBrowser(this.update.url);
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../variables";

    b {
        &.blue {
            color:$dark-blue;
        }
    }

    .description {
        font-size: 13px;

        &.link {
            text-decoration: underline;
            color:$dark-blue;
            cursor: pointer;

            &:hover {
                color:$light-blue;
            }
        }
    }

    .markdown {
        max-height:200px;
        overflow: auto;
        padding:20px;
        border-radius:4px;
        border:1px solid rgba(0,0,0,0.1);

        h1 {
            font-size: 24px;
        }
    }

</style>