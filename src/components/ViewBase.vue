<template>
    <section class="view-base">
        <section class="router-base">



            <section class="main" v-if="unlocked">

                <overhead></overhead>



                <section class="shifter">
                    <transition name="slide-left" mode="out-in">
                        <router-view></router-view>
                    </transition>
                </section>

            </section>

            <section v-if="!unlocked">
                <auth></auth>
            </section>

            <section v-if="unlocked">
                <!--<section v-if="!onboarding">-->
                    <!--<section v-if="hasSidebar()">-->
                        <!--<auth class="sidebar" :class="{'hidden':routeNames.LOGIN !== $route.name}"></auth>-->
                        <!--&lt;!&ndash;<main-menu class="sidebar" :class="{'hidden':routeNames.LOGIN === $route.name}" :collapsed="collapsedMenu" v-on:toggled="toggleMenu"></main-menu>&ndash;&gt;-->
                    <!--</section>-->

                    <!--<main class="expanded">-->

                        <!--<section style="background:red;"></section>-->
                        <!--<transition :name="transitionName">-->
                            <!--<router-view></router-view>-->
                        <!--</transition>-->
                    <!--</main>-->
                <!--</section>-->

                <!--<section v-else>-->
                    <!--<terms></terms>-->
                <!--</section>-->
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
                return !this.scatter.meta.acceptedTerms;
            }
        },
        mounted(){
            WindowService.openTools();
        },
        methods:{

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import '../_variables.scss';

    .main {
        background:#f8f8f8;
        max-height:100vh;
        position: relative;
    }

    .shifter {
        position: relative;
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
    }


</style>