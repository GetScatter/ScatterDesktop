<template>
    <section class="view-base">

        <Popups />

        <section v-if="isPopout">
            <router-view></router-view>
        </section>

        <section v-else>
            <menu-bar></menu-bar>

            <transition name="slide-up">
                <user-bar v-if="route === routeNames.HOME"></user-bar>
            </transition>

            <section class="app-content">

                <transition :name="route === 'login' ? 'fade' : ''" mode="out-in">
                    <router-view></router-view>
                </transition>

            </section>
        </section>

        <transition name="fade" mode="out-in">
            <section class="working-screen" v-if="workingScreen">
                <figure class="spinner icon-spin4 animate-spin"></figure>
            </section>
        </transition>
	    <Processes />

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'

    import Processes from './Processes';
    import Popups from './Popups';

    export default {
    	components:{
		    Popups,
		    Processes
        },
        data(){ return {
            routeNames:RouteNames,
        }},
        computed:{
            ...mapState([
                'scatter',
                'workingScreen',
                'processes'
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
            ...mapActions([
                Actions.SET_SCATTER
            ])

        },
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    @import '../styles/variables';

    .working-screen {
        background:rgba(255,255,255,0.93);
        position:fixed;
        top:80px;
        left:0;
        right:0;
        bottom:0;
        z-index:1000000;
        display:flex;
        justify-content: center;
        align-items: center;
        text-align: center;

        .spinner {
            font-size: 36px;
            color:$secondary;
        }
    }

    .app-content {
        position:fixed;
        overflow-y: auto;
        overflow-x:hidden;
        left: 0;
        right: 0;
        top: 80px;
        bottom:0;
        z-index: 1;
        background: white;
    }

    .view-base {
        min-height:100vh;
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
    }


</style>
