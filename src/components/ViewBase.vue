<template>
    <section class="view-base">
        <section class="router-base">


            <section v-if="onboarding">
                <terms></terms>
            </section>

            <section v-else-if="isPopout">
                <router-view></router-view>
            </section>

            <section v-else>
                <section class="main" v-if="unlocked">

                    <overhead></overhead>

                    <transition name="slide-left" mode="out-in">
                        <router-view class="shifter" :class="{'home':route === 'home'}"></router-view>
                    </transition>

                </section>

                <section v-if="!unlocked">
                    <auth></auth>
                </section>
            </section>


            <popups></popups>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'
    import WindowService from '../services/WindowService'

    export default {
        data(){ return {
            routeNames:RouteNames,
            loggingIn:false,
            collapsedMenu:false,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'unlocked',
            ]),
            onboarding(){
                return this.scatter && this.scatter.meta && !this.scatter.meta.acceptedTerms;
            },
            isPopout(){
                return this.$route.name === 'popout';
            },
            route(){
                return this.$route.name
            }
        },
        mounted(){

        },
        methods:{

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import '../_variables.scss';

    .main {
        background:#f8f8f8;
        height:100vh;
        position: relative;
        display:flex;
        flex-direction: column;
    }

    .shifter {
        position: relative;
        flex: 1;
        display: flex;


        &.home {
            flex-direction: column;
        }
    }



    .view-base {

    }

    .sidebar {
        position:absolute;
        top:0;
        bottom:0;
        left:0;
        transition: left 0.6s ease;
        transition-delay: 0.1s;
        z-index:2;

        &.hidden {
            left:-450px;
            transition-delay: 0s;
        }
    }

    main {
        width:calc(100% - 270px);
        right:0;
        position: absolute;
        top:0;
        bottom:0;
        z-index:1;


        &.expanded {
            width:calc(100% - 450px);
        }

        &.no-sidebar {
            width:100%;
        }

        &.collapsed-menu {
            width:calc(100% - 70px);
        }
    }

    .router-base {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100vh;
    }


</style>
