<template>
    <section class="view-base">
        <section class="router-base">

            <menu-bar></menu-bar>
            <transition name="slide-up">
                <user-bar v-if="route === routeNames.HOME"></user-bar>
            </transition>

            <section v-if="onboarding">
                <terms></terms>
            </section>

            <section v-else-if="isPopout">
                <router-view></router-view>
            </section>

            <section class="app-content" v-else>
                <transition :name="route === 'login' ? 'fade' : 'slide-left'" mode="out-in">
                    <router-view></router-view>
                </transition>
            </section>

            <popups></popups>
            <processes></processes>

            <transition name="fade" mode="out-in">
                <section class="working-screen" v-if="workingScreen">
                    <figure class="spinner icon-spin4 animate-spin"></figure>
                </section>
            </transition>

            <!--<v-tour name="scatter" :steps="steps" :callbacks="{onStop}"></v-tour>-->
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'

    export default {
        data(){ return {
            routeNames:RouteNames,

            steps: [
                {
                    target: '#tour1',
                    content: `This is your <b>Vault</b> where all of your Keys are kept. <br><b>Open it.</b>`,
                    params: {
                        placement: 'bottom'
                    }
                },
                {
                    target: '#tour2',
                    content: `Now click here to add a <b>Vault Entry</b>`,
                    params: {
                        placement: 'left'
                    }
                },
            ],
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
        created(){

        },
        mounted(){

        },
        methods:{
            onStop(){
                const scatter = this.scatter.clone();
                scatter.toured = true;
                this[Actions.SET_SCATTER](scatter);
            },
            checkTour(){
                // if(!this.scatter) return;
                // if(!this.scatter.toured && !this.onboarding && this.unlocked && this.route === 'home'){
                //     this.$tours['scatter'].start();
                // }
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])

        },
        watch:{
            unlocked(){
                this.checkTour()
            },
            onboarding(){
                this.checkTour();
            },
            route(){
                this.checkTour();
            }
        },
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    @import '../_variables.scss';

    .working-screen {
        background:rgba(255,255,255,0.93);
        position:fixed;
        top:80px;
        left:0;
        right:0;
        bottom:0;
        z-index:9999999;
        display:flex;
        justify-content: center;
        align-items: center;
        text-align: center;

        .spinner {
            font-size: 36px;
            color:$light-blue;
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
        transition:all 0.24s ease-in-out;
    }

    .view-base {
        min-height:100vh;
    }

    .router-base {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
    }


</style>
