<template>
    <section class="overhead" :class="{'hide-all':this.route === 'login' || this.route === 'onboarding'}">

        <!-- HEAD -->
        <section class="head" v-if="notOnboarding">
            <figure class="bg"></figure>
            <router-link :to="{name:'home'}" class="logo">Scatter</router-link>
            <figure class="actions">

                <!-- EXIT / QUIT -->
                <figure class="action" v-tooltip="'Quit'" @click="quit">
                    <i class="fa fa-power-off"></i>
                </figure>

                <!-- SETTINGS -->
                <router-link :to="{name:'settings'}"  class="action" v-tooltip="'Settings'">
                    <i class="fa fa-cog"></i>
                </router-link>

                <!-- VAULT -->
                <figure class="action" v-tooltip="'Minimize to Tray'" @click="tray">
                    <i class="fa fa-window-minimize"></i>
                </figure>

                <figure class="breaker"></figure>

                <!-- VAULT -->
                <figure id="tour1" class="action vault" @click="openVault">
                    Vault
                </figure>

            </figure>
        </section>



        <!-- DASHBOARD -->
        <section class="dashboard" v-if="notOnboarding">

            <!-- VALUE -->
            <transition name="slide-right" mode="out-in">
                <router-link v-if="route === 'home'" key="balance" :to="{name:'tokens'}">
                    <section class="value tokens">
                        {{formatNumber(totalBalance[0], !scatter.settings.displayToken)}} <b>{{totalBalance[1]}}</b>
                        <span>View <b>Tokens</b></span>
                    </section>
                </router-link>

                <section key="othername" class="value" style="position:relative;" v-else>
                    <span v-if="route === 'transfer'">Send</span>
                    <span v-else>{{route}}</span>
                    <i v-if="route === 'tokens'"
                       class="refresh-tokens fa fa-refresh"
                       :class="{'fa-spin':refreshing}"
                       v-tooltip="'Refresh'"
                       @click="refreshTokens"></i>
                </section>
            </transition>


            <!-- ACTIONS -->
            <section class="actions">
                <transition name="slide-left" mode="out-in">
                    <section key="ishome" v-if="isHome && accounts.length">
                        <!-- RECEIVE TOKENS -->
                        <router-link :to="{name:'receive'}"  class="action">
                            Receive
                        </router-link>

                        <!-- SEND TOKENS -->
                        <router-link :to="{name:'transfer'}"  class="action">
                            Send
                        </router-link>
                    </section>

                    <section key="nothome" v-if="!isHome">
                        <!-- GO HOME -->
                        <router-link :to="{name:'home'}"  class="action square" v-tooltip="'Go Home'">
                            <i class="icon fa fa-times"></i>
                        </router-link>
                    </section>
                </transition>
            </section>

        </section>



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import PluginRepository from '../../plugins/PluginRepository';
    import {Blockchains} from '../../models/Blockchains';
    import PriceService from '../../services/PriceService'
    import PopupService from '../../services/PopupService'
    import UpdateService from '../../services/UpdateService'
    import {Popup} from '../../models/popups/Popup';
    const { remote } = window.require('electron');

    let saveTimeout = null;

    export default {
        data () {return {
            refreshing:false,
        }},
        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([
                'identity',
                'accounts',
                'totalBalance',
                'totalTokenBalance',
            ]),
            notOnboarding(){
                return this.route !== 'onboarding'
            },
            eosAccounts(){
                return this.accounts.filter(x => x.blockchain() === 'eos');
            },
            eosPlugin(){
                return PluginRepository.plugin(Blockchains.EOSIO);
            },
            route(){
                return this.$route.name
            },
            isHome(){
                return this.route === 'home'
            },
        },
        created(){
            this.init();
            UpdateService.needsUpdate()
        },
        methods:{
            async init(){
                await PriceService.watchPrices(!this.scatter.displayToken);
                this.refreshTokens();
            },
            openVault(){
                if(this.$tours['scatter']) this.$tours['scatter'].nextStep();
                PopupService.push(Popup.vault());
            },
            tray(){
                remote.BrowserWindow.getFocusedWindow().hide();
            },
            quit(){
                remote.app.quit();
            },
            async refreshTokens(){
                if(this.refreshing) return;
                this.refreshing = true;
                await PriceService.getAllTokens();
                await PriceService.getBalances();
                setTimeout(() => {
                    this.refreshing = false;
                }, 2500)
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .refresh-tokens {
        cursor: pointer;
        font-size: 24px;
        position:absolute;
        top:0;
        right:-45px;
        width:40px;
        height:40px;
        background:$dark-blue;
        border-radius:50%;
        display:flex;
        justify-content: center;
        align-items: center;
        padding-bottom:1px;

        transition: all 0.2s ease;
        transition-property: color, background;

        &:hover {
            background:#fff;
            color:$dark-blue;
        }

    }

    .overhead {
        opacity:1;
        transition: opacity 0.5s ease;

        &.hide-all {
            opacity:0;
        }
    }


    .head {
        background:#fff;
        height:80px;
        line-height:80px;
        padding:0 35px 0 50px;
        overflow: hidden;
        color:$light-blue;
        position: relative;

        .bg {
            position: absolute;
            top:0; bottom:0; left:0; right:0;
            z-index:-1;
            -webkit-app-region: drag;
        }

        .logo {
            float:left;
            font-family: 'Grand Hotel', sans-serif;
            font-size: 32px;
            cursor: pointer;
            -webkit-app-region: no-drag;
        }

        .actions {
            float:right;

            .breaker {
                float:right;
                width:1px;
                height:20px;
                background:rgba(0,0,0,0.1);
                margin:30px 15px;
            }

            .action {
                float:right;
                font-size: 24px;
                cursor: pointer;
                -webkit-app-region: no-drag;
                transition: all 0.2s ease;
                transition-property: transform;
                padding:0 15px;


                transform:scale(1);

                &:hover { transform:scale(1.3); }
                &:active { transform:scale(0.9); }

                img {
                    width:24px;
                    height:24px;
                }

                &.vault {
                    font-size:18px;
                    font-weight: bold;
                    padding:10px;
                    border:2px solid $light-blue;
                    line-height:18px;
                    margin-top:20px;
                    border-radius:4px;
                }
            }
        }
    }

    .dashboard {
        background:$light-blue;
        color:#fff;
        height:160px;
        overflow: hidden;
        padding:0 50px;
        position: relative;
        box-shadow:inset 0 10px 25px rgba(0,0,0,0.05), inset 0 1px 2px rgba(0,0,0,0.1);
        display:flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .value {
            font-size: 48px;
            font-family: 'Open Sans', sans-serif;
            font-weight: 300;
            text-transform: capitalize;
            transition: all 0.3s ease;
            transition-property: font-size, opacity, transform;

            &.tokens {
                cursor: pointer;

                span {
                    font-size: 18px;
                    display:block;
                    margin-top:-10px;
                    padding-left:0;
                    transition: all 0.3s ease;
                    transition-property: font-size, opacity;
                }

                &:hover {
                    font-size: 18px;

                    span {
                        font-size:48px;
                    }
                }
            }
        }

        .actions {
            float:right;
            /*line-height:170px;*/
            position: relative;

            .action {
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                border-radius:2px;
                border:1px solid #fff;

                padding:0 20px;
                line-height:60px;
                display:inline-block;
                text-align: center;
                margin-left:6px;
                background:transparent;
                transition: all 0.2s ease;
                transition-property: background, color;

                &.square {
                    padding:0;
                    height:60px;
                    width:60px;
                    padding-bottom:2px;
                    display:flex;
                    justify-content: center;
                    align-items: center;
                }

                &:hover {
                    background:#fff;
                    color:$light-blue;
                }

                .icon {
                    font-size: 36px;
                    padding:12px;

                    &.send { transform:rotate(45deg); }
                    &.receive { transform:rotate(45deg); }
                }
            }
        }
    }


</style>
