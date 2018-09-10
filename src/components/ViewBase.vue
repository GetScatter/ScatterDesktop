<template>
    <section class="view-base">
        <section class="router-base">


            <section v-if="!onboarding">
                <section v-if="hasSidebar()">
                    <auth class="sidebar" :class="{'hidden':routeNames.LOGIN !== $route.name}"></auth>
                    <main-menu class="sidebar" :class="{'hidden':routeNames.LOGIN === $route.name}" :collapsed="collapsedMenu" v-on:toggled="toggleMenu"></main-menu>
                </section>

                <main :class="{'expanded':routeNames.LOGIN === $route.name, 'no-sidebar':!hasSidebar(), 'collapsed-menu':collapsedMenu}">

                    <section style="background:red;"></section>
                    <transition :name="transitionName">
                        <router-view></router-view>
                    </transition>
                </main>
            </section>

            <section v-else>
                <terms></terms>
            </section>

            <popups></popups>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, RouteDepth, Routing} from '../vue/Routing'

    export default {
        data(){ return {
            routeNames:RouteNames,
            transitionName:'',
            menuTransitionName:'',
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
                return this.unlocked && !this.scatter.meta.acceptedTerms;
            }
        },
        methods:{
            hasSidebar(){
                return Routing.hasSidebar(this.$route.name)
            },
            toggleMenu(){
                this.collapsedMenu = !this.collapsedMenu;
            }
        },
        watch: {
            '$route' (to, from) {
                this.transitionName = RouteDepth[to.name] < RouteDepth[from.name] ? 'slide-up' : 'slide-down'
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">

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