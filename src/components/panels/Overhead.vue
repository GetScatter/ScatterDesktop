<template>
    <section>

        <!-- HEAD -->
        <section class="head">
            <figure class="bg"></figure>
            <router-link :to="{name:'home'}" class="logo">Scatter</router-link>
            <figure class="actions">

                <!-- EXIT / QUIT -->
                <figure class="action" v-tooltip="'Quit'">
                    <i class="fa fa-power-off"></i>
                </figure>

                <!-- SETTINGS -->
                <router-link :to="{name:'settings'}"  class="action" v-tooltip="'Settings'">
                    <i class="fa fa-cog"></i>
                </router-link>

                <!-- VAULT -->
                <figure class="action" v-tooltip="'Vault'" @click="openVault">
                    <div style="margin-top:4px;">
                        <img src="../../assets/vault.png" />
                    </div>
                </figure>
            </figure>
        </section>



        <!-- DASHBOARD -->
        <section class="dashboard">

            <!-- VALUE -->
            <transition name="slide-right" mode="out-in">
                <section key="balance" v-if="route.name === 'home'" class="value">
                    {{totalBalance}} <b>USD</b>
                </section>
                <section key="othername" v-else class="value">
                    {{route.name}}
                </section>
            </transition>


            <!-- ACTIONS -->
            <section class="actions">
                <transition name="slide-left" mode="out-in">
                    <section key="ishome" v-if="isHome">
                        <!-- RECEIVE TOKENS -->
                        <router-link :to="{name:'receive'}"  class="action" v-tooltip="'Receive'">
                            <i class="icon receive fa fa-arrow-down"></i>
                        </router-link>

                        <!-- SEND TOKENS -->
                        <router-link :to="{name:'transfer'}"  class="action" v-tooltip="'Send'">
                            <i class="icon send fa fa-arrow-up"></i>
                        </router-link>
                    </section>

                    <section key="nothome" v-else>
                        <!-- GO HOME -->
                        <router-link :to="{name:'home'}"  class="action" v-tooltip="'Go Home'">
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
    import {Popup} from '../../models/popups/Popup';

    let saveTimeout = null;

    export default {
        data () {return {
            balances:{},
            prices:{},
            totalBalance:0,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'identity',
                'accounts',
            ]),
            eosAccounts(){
                return this.accounts.filter(x => x.blockchain() === 'eos');
            },
            eosPlugin(){
                return PluginRepository.plugin(Blockchains.EOSIO);
            },
            route(){
                return this.$route
            },
            isHome(){
                return this.$route.name === 'home'
            }
        },
        created(){
            this.refresh();
        },
        methods:{


            openVault(){
                PopupService.push(Popup.vault());
            },



            refresh(){
                this.getBalances();
                this.getPrices();
            },
            async getBalances(){
                const tokens = [];
                await this.eosPlugin.fetchTokens(tokens);
                await Promise.all(this.eosAccounts.map(async account => {

                    // Only get from endorsed networks
                    if(!await PluginRepository.plugin(account.blockchain()).isEndorsedNetwork(account.network())) return false;

                    this.balances[account.unique()] = [];

                    return await Promise.all(tokens.map(async token => {
                        const balance = await this.eosPlugin.balanceFor(account, account.network(), token.account, token.symbol);
                        if(parseFloat(balance) > 0){
                            this.balances[account.unique()].push({symbol:token.symbol, balance});
                        }
                        this.setTotalBalance();
                        return true;
                    }));
                }));
            },
            async getPrices(){
                this.prices['EOS'] = await PriceService.getPriceFor('EOS');
                this.setTotalBalance();
            },
            async setTotalBalance(){
                const totals = {};
                Object.keys(this.balances).map(acc => {
                    this.balances[acc].map(t => {
                        totals[t.symbol] = (totals[t.symbol] || 0) + parseFloat(t.balance)
                    })
                });

                let total = 0;
                Object.keys(totals).map(key => {
                    if(this.prices.hasOwnProperty(key)){
                        total += this.prices[key] * totals[key];
                    }
                });

                this.totalBalance = parseFloat(total).toFixed(2);
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

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

        .value {
            line-height:150px;
            float:left;
            font-size: 48px;
            font-family: 'Open Sans', sans-serif;
            font-weight: 300;
            text-transform: capitalize;
        }

        .actions {
            float:right;
            line-height:170px;
            position: relative;

            .action {
                cursor: pointer;
                border-radius:2px;
                border:1px solid #fff;
                height:60px;
                width:60px;
                line-height:72px;
                display:inline-block;
                text-align: center;
                margin-left:6px;
                background:transparent;
                transition: all 0.2s ease;
                transition-property: background, color;

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
