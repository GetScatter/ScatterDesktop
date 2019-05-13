<template>
    <section class="pop-over">

        <section class="panel centered">
            <h1>Update Available!</h1>
            <figure class="description"><b>Scatter Desktop</b> - <b class="blue">{{update.name}}</b> (v{{update.version}})</figure>
            <br>
            <section class="markdown">
                <VueMarkdown>{{update.body}}</VueMarkdown>
            </section>

            <br>
            <br>
            <Button text="Get Update" big="1" blue="1"
                 @click.native="open" />
        </section>


    </section>
</template>

<script>
    import {RouteNames} from '../../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import ElectronHelpers from '../../../util/ElectronHelpers'
    import VueMarkdown from 'vue-markdown'

    export default {
	    components: {VueMarkdown},
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
                this.returnResult(true);
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .pop-over {
        padding:30px;
    }

    b {
        &.blue {
            color: $blue;
        }
    }

    .description {
        font-size: 13px;

        &.link {
            text-decoration: underline;
            color: $blue;
            cursor: pointer;

            &:hover {
                color:$secondary;
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