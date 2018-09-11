<template>
    <section class="dashboard">

        <section class="panel">

            <section class="search-bar">
                <figure class="icon">
                    <i class="fa fa-search"></i>
                </figure>
                <figure class="input">
                    <cin placeholder="Filter By..." :text="terms" large-font="true"
                         v-on:changed="changed => bind(changed, 'terms')"></cin>
                </figure>
            </section>

            <section class="holdings">
                <figure class="total">
                    6,0002
                    <span class="symbol">USD</span>
                </figure>
            </section>

            <section class="info">
                <section class="panel-options">
                    <figure class="option" v-for="p in PANELS" :class="{'active':p === panel}" @click="panel = p">{{p}}</figure>
                    <figure class="bottom-line"></figure>
                </section>



                <section class="lower-panel" v-if="panel === PANELS.RECENT">
                    Recent
                </section>



                <section class="lower-panel" v-if="panel === PANELS.TOKENS">
                    Tokens
                </section>


            </section>



        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Countries} from '../data/Countries'
    import Identity from '../models/Identity'

    const PANELS = {
        RECENT:'Recent Activity',
        TOKENS:'Token Breakdown'
    }


    export default {
        name: 'Identities',
        data () {return {
            panel:PANELS.RECENT,
            PANELS:PANELS,
            terms:'',
        }},
        computed: {
            ...mapState([
                'scatter',
                'searchTerms',
            ]),
            ...mapGetters([
                'accounts',
            ]),
        },
        mounted(){

        },
        methods: {

        },
        watch:{
            terms(){
                this[Actions.SET_SEARCH_TERMS](this.terms);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .dashboard {
        padding:50px;
        background:rgba(0,0,0,0.01);

        .search-bar {
            width:100%;
            height:50px;
            line-height:42px;

            .icon {
                width:50px;
                float:left;
                font-size:20px;
                color:$mid-light-grey;
            }

            .input {
                width:calc(100% - 50px);
                float:left;

                .input {
                    width:100%;
                    height:50px;
                    margin-top:0;
                }
            }
        }

        .holdings {
            margin-top:20px;
            font-family: 'Roboto', sans-serif;
            width:100%;
            font-size: 50px;
            font-weight: 200;

        }

        .symbol {
            color:$mid-light-grey;
            font-weight: 400;
        }


        .info {
            margin-top:100px;

            .panel-options {

                .option {
                    cursor: pointer;
                    display:inline-block;
                    margin-right:30px;
                    font-size: 20px;
                    font-weight: 300;
                    border-bottom:2px solid transparent;
                    padding-bottom:10px;
                    transition: color 0.4s ease, border-bottom 0.4s ease;

                    &:hover, &.active {
                        border-bottom:2px solid $dark-blue;
                        color:$dark-blue;
                    }
                }

                .bottom-line {
                    margin-top:-2px;
                    width:100%;
                    height:2px;
                    background:rgba(0,0,0,0.1);
                }
            }
        }

        .lower-panel {
            margin:30px 0;

            background:#fff;
            border-radius:8px;
            min-height:200px;

        }
    }

</style>