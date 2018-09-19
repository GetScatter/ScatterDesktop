<template>
    <section class="dashboard">

        <section class="panel">

            <section style="max-height:160px; overflow: hidden;">
                <section class="search-bar">
                    <figure class="icon">
                        <i class="fa fa-search"></i>
                    </figure>
                    <figure class="input">
                        <cin placeholder="Filter By..." :text="terms" large-font="true"
                             v-on:changed="changed => bind(changed, 'terms')"></cin>
                    </figure>
                </section>
                <section class="top-info">
                    <figure class="holdings">
                        {{totalBalance}}
                        <span class="symbol">USD</span>
                    </figure>

                    <section class="actions">
                        <figure class="action-button" @click="transfer = TRANSFER_TYPES.SEND">
                            <figure class="icon send"><i class="fa fa-arrow-up"></i></figure>
                            <figure class="label">Send</figure>
                        </figure>
                        <figure class="action-button" @click="transfer = TRANSFER_TYPES.RECEIVE">
                            <figure class="icon receive"><i class="fa fa-arrow-down"></i></figure>
                            <figure class="label">Receive</figure>
                        </figure>
                        <figure class="action-button" @click="refresh">
                            <figure class="icon outline send"><i class="fa fa-refresh"></i></figure>
                            <figure class="label">Refresh</figure>
                        </figure>
                    </section>
                </section>
            </section>

            <section class="info">
                <section class="panel-options">
                    <figure class="option" v-for="p in PANELS" :class="{'active':p === panel}" @click="panel = p">{{p}}</figure>
                    <figure class="bottom-line"></figure>
                </section>

                <section class="lower-panel scrollable" style="height:calc(100vh - 310px);">
                    <section v-if="panel === PANELS.RECENT">
                        <section class="list-header"></section>
                        <section class="list-items">
                            <figure class="list-item" v-for="history in filterWithTerms(histories)">
                                <figure class="button blue" v-tooltip.left="'Open Transaction with '+explorerName(history.blockchain)" @click="openTransaction(history.blockchain, history.trx)">
                                    <i class="fa fa-link"></i>
                                </figure>
                                <figure class="name">
                                    {{history.data.contract}} -> {{history.data.action}}
                                </figure>
                                <figure class="date"><b><i>{{getAccount(history.account).formatted()}}</i></b></figure>
                                <figure class="date" style="margin-top:5px;">
                                    <figure v-for="(value, key) in history.data.params">
                                        <b>{{key}}: </b> <i>{{value}}</i>
                                    </figure>
                                </figure>
                            </figure>
                        </section>
                    </section>
                    <section v-if="panel === PANELS.TOKENS">
                        <section class="list-header"></section>
                        <section class="list-items">
                            <figure class="list-item" v-for="(bals, accountUnique) in balances">
                                <figure class="button blue" v-tooltip.left="'Open Account with '+explorerName(getAccount(accountUnique).blockchain())"
                                        @click="openAccount(getAccount(accountUnique))">
                                    <i class="fa fa-link"></i>
                                </figure>
                                <figure class="name">
                                    {{getAccount(accountUnique).formatted()}}
                                </figure>
                                <figure class="date">
                                    {{getAccount(accountUnique).network().name}}
                                </figure>
                                <figure class="date" style="margin-top:5px;">
                                    <figure class="token-balance" v-for="t in filterWithTerms(bals)">
                                        <b class="token-symbol">{{t.symbol}}</b> {{t.balance}} <b v-if="prices.hasOwnProperty(t.symbol)">(${{parseFloat(prices[t.symbol]*t.balance).toFixed(2)}})</b>
                                    </figure>
                                </figure>
                            </figure>
                        </section>
                    </section>
                </section>
            </section>
        </section>


        <section class="transfer-overlay" :class="{'hide':!transfer}">
            <figure class="background" @click="transfer = null"></figure>

            <section class="transfer-box">
                <transfer v-show="transfer === TRANSFER_TYPES.SEND"></transfer>
                <receive v-if="transfer === TRANSFER_TYPES.RECEIVE"></receive>
            </section>

        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Countries} from '../data/Countries'
    import Identity from '../models/Identity'
    import {Blockchains} from '../models/Blockchains';
    import PluginRepository from '../plugins/PluginRepository'
    import ElectronHelpers from '../util/ElectronHelpers'
    import PriceService from '../services/PriceService'

    const PANELS = {
        RECENT:'Recent Activity',
        TOKENS:'Token Breakdown'
    };

    const TRANSFER_TYPES = {
        SEND:'send',
        RECEIVE:'receive'
    }


    export default {
        name: 'Identities',
        data () {return {
            TRANSFER_TYPES:TRANSFER_TYPES,
            transfer:null,
            panel:PANELS.RECENT,
            PANELS:PANELS,
            terms:'',
            histories:[],
            balances:{},
            prices:{},
            totalBalance:0,
        }},
        computed: {
            ...mapState([
                'scatter',
                'searchTerms',
            ]),
            ...mapGetters([
                'accounts',
                'explorers',
            ]),
            eosAccounts(){
                return this.accounts.filter(x => x.blockchain() === 'eos');
            },
            eosPlugin(){
                return PluginRepository.plugin(Blockchains.EOSIO);
            },
        },
        mounted(){
            this.refresh();
        },
        methods: {
            refresh(){
                this.getRecentActivity();
                this.getBalances();
                this.getPrices();
            },
            filterWithTerms(arrayOfAnything){
                return arrayOfAnything.filter(x => {
                    if(typeof x === 'object') return JSON.stringify(x).toLowerCase().indexOf(this.terms.toLowerCase()) > -1
                    else return x.toString().toLowerCase().indexOf(this.terms.toLowerCase()) > -1
                })
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
            async getPrices(){
                this.prices['EOS'] = await PriceService.getPriceFor('EOS');
                this.setTotalBalance();
            },
            getRecentActivity(){
                this.eosAccounts.map(async account => {
                    const history = await this.eosPlugin.historyFor(account, account.network());
                    this.histories = this.histories.concat(history).sort((a,b) => b.timestamp - a.timestamp)
                })
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
            getAccount(unique){
                return this.accounts.find(x => x.unique() === unique);
            },
            openAccount(account){
                ElectronHelpers.openLinkInBrowser(this.explorers[account.blockchain()].account(account));
            },
            openTransaction(blockchain, trx){
                ElectronHelpers.openLinkInBrowser(this.explorers[blockchain].transaction(trx));
            },
            explorerName(blockchain){
                return this.explorers[blockchain].name;
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .dashboard {
        padding:50px;
        background:rgba(0,0,0,0.01);

        .transfer-overlay {
            position:fixed;
            top:0;
            bottom:0;
            left:0;
            right:0;
            z-index:9999999;
            visibility: visible;
            opacity:1;
            transition: all 0.2s ease;
            transition-property: opacity, visibility;

            .background {
                background: rgba(57, 173, 255, 0.9);
                position:fixed;
                left:0;
                right:0;
                top:0;
                bottom:0;
                cursor: pointer;

                transition: all 1.8s ease;
                transition-property: background;
            }

            .transfer-box {
                position:absolute;
                right:0;
                top:0;
                bottom:0;
                background:#fff;
                width:50%;
                box-shadow:-20px 0 150px rgba(0,0,0,0.1), -2px 0 17px rgba(0,0,0,0.1);
                transition: all 0.2s cubic-bezier(.46,.04,.8,.8);
                transition-property: right;

                .transfer-head {
                    font-size:24px;
                    padding-bottom:20px;
                    border-bottom:1px solid rgba(0,0,0,0.1);
                }
            }

            &.hide {
                opacity:0;
                visibility: hidden;

                .transfer-box {
                    right:-50%;
                }

                .background {
                    background: rgba(255, 255, 255, 0.9);
                }
            }
        }

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

        .top-info {
            margin-top:20px;
            width:100%;
            overflow: hidden;

            .holdings {
                font-family: 'Roboto', sans-serif;
                font-size: 50px;
                font-weight: 200;
                width:calc(50% - 20px);
                float:left;
            }

            .actions {
                float:left;
                width:50%;
                margin-left:20px;

                .action-button {
                    float:right;
                    margin-left:10px;
                    text-align:center;
                    cursor: pointer;
                    padding:10px;

                    .icon {
                        width:50px;
                        height:50px;
                        background:$dark-blue;
                        color:#fff;
                        border-radius:50%;
                        text-align:center;
                        line-height:50px;
                        transition: all 0.2s ease;
                        transition-property: transform;
                        font-size: 22px;

                        &.outline {
                            background:transparent;
                            border:3px solid $dark-blue;
                            color:$dark-blue;
                            line-height:45px;
                        }

                        &.send{
                            transform:rotate(45deg);
                        }
                        &.receive{
                            transform:rotate(45deg);
                            line-height: 52px;
                        }
                    }

                    .label {
                        padding-top:10px;
                        font-size: 11px;
                        font-weight: bold;
                        color: $dark-blue;
                    }

                    &:hover {
                        .icon {
                            &.send { transform:rotate(45deg) scale(1.1); }
                            &.receive { transform:rotate(45deg) scale(1.1); }
                        }
                    }

                    &:active {
                        .icon {
                            &.send { transform:rotate(45deg) scale(0.9); }
                            &.receive { transform:rotate(45deg) scale(0.9); }
                        }
                    }
                }
            }

        }

        .symbol {
            color:$mid-light-grey;
            font-weight: 400;
        }


        .info {
            margin-top:30px;

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

            min-height:200px;

            .list-item {
                .button {
                    float: left;
                    margin-right: 10px;
                    margin-top: 0;
                }
            }

            .token-balance {
                font-size:13px;
                font-family: 'Roboto', sans-serif;
                padding:5px 0;
                border-bottom:1px solid rgba(0,0,0,0.05);

                .token-symbol {
                    width:60px;
                    border-right:1px solid rgba(0,0,0,0.1);
                    margin-right:10px;
                    display:inline-block;
                    color:$dark-blue;
                }
            }

        }
    }

</style>