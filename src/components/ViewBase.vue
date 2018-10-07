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

                <section v-else>
                    <auth></auth>
                </section>
            </section>


            <popups></popups>

            <v-tour name="scatter" :steps="steps" :callbacks="{onStop}"></v-tour>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'
    import WindowService from '../services/WindowService'
    import PopupService from '../services/PopupService'
    import {Popup} from '../models/popups/Popup'

    export default {
        data(){ return {
            routeNames:RouteNames,
            loggingIn:false,
            collapsedMenu:false,

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
                if(!this.scatter) return;
                if(!this.scatter.toured && !this.onboarding && this.unlocked && this.route === 'home'){
                    this.$tours['scatter'].start();
                }
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
