<template>
    <section>

        <section class="selector" v-if="nextPopIn">
            <pop-in-head></pop-in-head>

            <section class="list" v-if="nextPopIn.data.props.items.length">
                <section class="item" v-for="item in nextPopIn.data.props.items" @click="returnResult(item)">
                    <!--<figure class="fa" :class="`fa-${nextPopIn.data.props.icon}`"></figure>-->
                    <figure>{{parse(item)}}</figure>
                </section>
            </section>

            <section class="list" v-else>
                <section class="item" style="text-align:center;">
                    <figure>There doesn't seem to be anything here.</figure>
                </section>
            </section>

        </section>

    </section>
</template>

<script>
    import {RouteNames, RouteDepth} from '../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {PopupDisplayTypes} from '../../models/popups/Popup'

    export default {
        data(){ return {

        }},
        mounted(){

        },
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([
                'nextPopIn'
            ])
        },
        methods:{
            returnResult(item){
                this.nextPopIn.data.callback(item);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            parse(item){
                if(typeof item === 'string') return item;
                if(this.nextPopIn.data.props.parser) return this.nextPopIn.data.props.parser(item);

                let props = this.prop.split(".");
                const lastKey = props.pop();
                return props.reduce((obj,key)=> obj[key], item)[lastKey];
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .selector {

        .list {
            border-top:1px solid $light-grey;
            max-height:280px;
            overflow-y:auto;

            .item {
                cursor: pointer;
                background:#fff;
                transition: all 0.3s ease;
                transition-property: background;

                figure {
                    display:inline-block;
                    padding:20px;
                    font-size:13px;
                }

                &:not(:first-child){
                    border-top:1px solid $light-grey;
                }

                &:hover {
                    background:$light-grey;
                }

                &:active {
                    background:#fff;
                }
            }
        }

    }


</style>