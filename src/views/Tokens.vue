<template>
    <section class="transfer">

        <!-- ADDRESS BOOK -->
        <section class="address-book">
            <figure class="bg"></figure>

            <section class="head">
                <section class="switch">
                    <figure class="option" :class="{'active':displayType === value}" v-for="(value, key) in DISPLAY_TYPE" @click="displayType = value">
                        {{value}}
                    </figure>
                </section>
            </section>

            <section class="search">
                <!-- INPUT -->
                <section class="input">
                    <figure class="icon"><i class="fa fa-search"></i></figure>
                    <input placeholder="Search..." v-model="terms" />
                </section>

            </section>

            <section class="addresses">

                <transition name="slide-left" mode="out-in">
                    <section key="tokens" v-if="displayType === DISPLAY_TYPE.TOKENS">
                        <section class="address" :class="{'active':name === token.name}" v-for="token in filteredTokens" @click="select(token)">
                            <figure class="name">{{token.name}} ( {{token.symbol}} )</figure>
                            <figure class="description">{{token.blockchain.toUpperCase()}}</figure>
                        </section>
                    </section>
                    <section key="accounts" v-if="displayType === DISPLAY_TYPE.ACCOUNTS">
                        <section class="address" :class="{'active':name === account.formatted()}" v-for="account in filteredAccounts" @click="select(account)">
                            <figure class="name">{{account.formatted()}}</figure>
                            <figure class="description"><i class="fa fa-globe"></i> {{account.network().name}}</figure>
                        </section>
                    </section>
                </transition>

            </section>
        </section>



        <!-- TRANSFER DETAILS -->
        <section class="details">
            <section class="actions">
                <figure class="action" :class="{'hide':!isToken}" style="font-size:16px;" @click="setAsDisplayToken">
                    {{isDisplayToken ? 'Remove as Display Token' : 'Set as Display Token'}}
                </figure>
            </section>

            <section class="data">

                <transition name="slide-left" mode="out-in">

                    <section v-if="!selected" key="notselected">
                        <section class="token">

                            <section class="basic-info">
                                <section class="info" style="margin-left:-30px;">
                                    <section>
                                        <figure class="name">Total Token Balances</figure>
                                    </section>
                                </section>
                            </section>

                            <section class="balance-table">
                                <section class="head">
                                    <figure>Token</figure>
                                    <figure>Balance</figure>
                                </section>
                                <section class="body">
                                    <figure class="row" v-for="(balance, symbol) in allBalances">
                                        <figure>{{symbol}}</figure>
                                        <figure class="number">{{formatNumber(balance, true)}}</figure>
                                    </figure>
                                </section>
                            </section>
                        </section>
                    </section>

                    <section key="selected" v-if="selected">
                        <transition name="slide-left" mode="out-in">
                            <!-- TOKEN -->
                            <section key="token" class="token" v-if="isToken">

                                <section class="basic-info">
                                    <section class="icon" :class="{'placeholder':!selected.logo}">
                                        <img :src="selected.logo" />
                                    </section>

                                    <section class="info">
                                        <section>
                                            <figure class="name">{{selected.name}}</figure>
                                            <figure class="description">{{selected.blockchain.toUpperCase()}} - {{selected.account}}</figure>
                                            <figure class="description small" v-if="tokenInfo">Total Supply - {{formatNumber(tokenInfo.supply)}}</figure>
                                        </section>
                                    </section>
                                </section>

                                <section class="balance-table">
                                    <section class="head">
                                        <figure>Account</figure>
                                        <figure>Balance</figure>
                                    </section>
                                    <section class="body">
                                        <figure class="row" v-for="accountBalance in accountsWithToken">
                                            <figure>{{accountBalance.account.sendable()}}</figure>
                                            <figure class="number">{{formatNumber(accountBalance.balance, true)}}</figure>
                                        </figure>
                                    </section>
                                </section>



                            </section>






                            <!-- ACCOUNT -->
                            <section key="account" class="account" v-if="isAccount">

                                <section class="balance-table">
                                    <section class="head">
                                        <figure>Token</figure>
                                        <figure>Balance</figure>
                                    </section>
                                    <section class="body">
                                        <figure class="row" v-for="token in balances[selected.unique()]">
                                            <figure>{{token.symbol}}</figure>
                                            <figure class="number">{{formatNumber(token.balance, true)}}</figure>
                                        </figure>
                                    </section>
                                </section>

                            </section>
                        </transition>
                    </section>


                </transition>

            </section>

        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import {Blockchains, BlockchainsArray} from '../models/Blockchains'

    import PriceService from '../services/PriceService'
    import PopupService from '../services/PopupService'
    import {Popup} from '../models/popups/Popup';

    const DISPLAY_TYPE = {
        TOKENS:'Tokens',
        ACCOUNTS:'Accounts'
    };

    export default {
        data () {return {
            BlockchainsArray:BlockchainsArray,
            DISPLAY_TYPE:DISPLAY_TYPE,
            displayType:null,
            selected:null,
            terms:'',
            tokenInfo:null,
        }},
        computed:{
            ...mapState([
                'scatter',
                'tokens',
                'balances',
                'prices',
            ]),
            ...mapGetters([
                'accounts',
                'allBalances',
            ]),
            name(){
                if(!this.selected) return;
                if(this.displayType === DISPLAY_TYPE.ACCOUNTS) return this.selected.formatted();
                if(this.displayType === DISPLAY_TYPE.TOKENS) return this.selected.name;
            },
            isToken(){ return this.displayType === DISPLAY_TYPE.TOKENS && this.selected },
            isAccount(){ return this.displayType === DISPLAY_TYPE.ACCOUNTS && this.selected },
            filteredTokens(){
                const terms = this.terms.trim().toLowerCase();
                return this.tokens
                    .filter(x => PriceService.tokensFor(x).length)
                    .filter(x => x.name.toLowerCase().indexOf(terms) > -1 || x.symbol.toLowerCase().indexOf(terms) > -1)
            },
            filteredAccounts(){
                const terms = this.terms.toLowerCase();
                return this.accounts
                    .filter(x => this.balances.hasOwnProperty(x.unique()) && this.balances[x.unique()].length)
                    .filter(x => x.name.toLowerCase().indexOf(terms) > -1 || x.keypair().name.toLowerCase().indexOf(terms) > -1)
                    .reduce((acc,x) => {
                        if(!acc.map(y => y.unique()).includes(x.unique())) acc.push(x);
                        return acc;
                    }, [])
            },
            accountsWithToken(){
                if(!this.selected) return [];
                if(this.displayType !== DISPLAY_TYPE.TOKENS) return [];
                return PriceService.tokensFor(this.selected).reduce((acc,x) => {
                    if(!acc.map(y => y.account.unique()).includes(x.account.unique())) acc.push(x);
                    return acc;
                }, []);
            },
            tokenHasPrice(){
                if(!this.selected) return false;
                if(this.displayType !== DISPLAY_TYPE.TOKENS) return false;
                return this.prices.hasOwnProperty(this.selected.symbol);
            },
            isDisplayToken(){
                if(!this.selected) return false;
                if(!this.scatter.settings.displayToken) return false;
                if(this.displayType !== DISPLAY_TYPE.TOKENS) return false;
                return this.selected.symbol === this.scatter.settings.displayToken.symbol;
            }
        },
        created(){
            this.displayType = DISPLAY_TYPE.TOKENS;
        },
        methods:{

            select(x){
                if(JSON.stringify(x) === JSON.stringify(this.selected)) this.selected = null;
                else this.selected = x;
            },
            setAsDisplayToken(){
                PriceService.toggleDisplayToken(this.selected);
            }
        },
        watch:{
            displayType(){
                this.selected = null;
                this.selected = this.displayType === DISPLAY_TYPE.ACCOUNTS
                    ? this.filteredAccounts[0]
                    : this.filteredTokens[0];
            },
            async selected(){
                if(!this.selected) return;
                if(this.displayType === DISPLAY_TYPE.TOKENS){
                    this.tokenInfo = await PriceService.getTokenInfo(this.selected);
                }
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .transfer {
        flex:1;
        display:flex;
        flex-direction: row;
        background:rgba(255,255,255,0.5);

        .number {
            font-family: "Open Sans", sans-serif;
        }

        .address-book {
            flex:1;
            display:flex;
            flex-direction: column;
            background:$light-blue;
            position: relative;
            z-index:2;

            .bg {
                position:absolute;
                top:10px; bottom:0; left:0; right:0;
                background:#fff;
                z-index:-1;
            }

            .head {
                flex:0 0 auto;
                background:#fff;
                font-size: 16px;
                font-weight: 600;
                color:$medium-grey;
                border-top-right-radius:8px;
                box-shadow:10px -10px 20px rgba(0,0,0,0.01);
                overflow:hidden;

                .switch {
                    display:flex;
                    text-align:center;

                    .option {
                        flex:1;
                        cursor: pointer;
                        padding:20px 30px;
                        background:rgba(0,0,0,0.04);
                        transition: all 0.2s ease;
                        transition-property: background, color;

                        &:first-child {
                            border-right:1px solid rgba(0,0,0,0.1);
                        }

                        &:hover, &.active {
                            color:$black;
                            background:#fff;
                        }
                    }
                }
            }

            .search {
                flex:0 0 auto;
                padding:0 30px;
                overflow: hidden;
                height:40px;
                background:#f3f3f3;
                border-top:1px solid #e1e1e1;
                border-bottom:1px solid #e1e1e1;

                .input {

                    .icon {
                        float:left;
                        font-size: 13px;
                        line-height:40px;
                        color: #aeaeae;
                    }

                    input {
                        margin-left:10px;
                        font-size: 11px;
                        float:left;
                        outline:0;
                        border:0;
                        height:40px;
                        background:transparent;

                    }
                }

            }

            .addresses {
                display:flex;
                flex-direction: column;
                overflow-y:auto;
                overflow-x:hidden;
                background:rgba(0,0,0,0.02);

                .address {
                    padding:18px 30px;
                    border-bottom:1px solid rgba(0,0,0,0.05);
                    background:rgba(0,0,0,0);
                    transition: all 0.2s ease;
                    transition-property: background, padding;
                    cursor: pointer;
                    font-size: 13px;
                    overflow: hidden;

                    &:hover, &.active {
                        background:#fff;
                        padding-left:35px;
                    }

                    .name {
                        width:100%;
                        font-weight: bold;
                        font-size: 14px;
                        margin-bottom:3px;
                        color:$black;
                    }

                    .description {
                        font-size: 11px;
                        color:$dark-grey;
                    }
                }
            }
        }

        .details {
            float:left;
            flex:2.5;
            display:flex;
            flex-direction: column;
            box-shadow: inset 1px 0 3px rgba(0,0,0,0.1);

            .actions {
                flex:0 0 auto;
                height:80px;
                display: flex;
                justify-content: space-between;
                background:$light-blue;
                padding:0 50px 0 30px;
                float:left;
                width:100%;

                .action {
                    margin-left:10px;
                    cursor: pointer;
                    border-radius: 2px;
                    border:1px solid #fff;
                    height:50px;
                    line-height:48px;
                    padding:0 20px;
                    text-align:center;
                    font-size: 24px;
                    color:#fff;
                    opacity:1;
                    visibility: visible;

                    transition:all 0.2s ease;
                    transition-property: background, border, color, opacity, margin, visibility;

                    &:hover {
                        background:#fff;
                        border:1px solid #fff;
                        color:$light-blue;
                    }

                    &.hide {
                        visibility: hidden;
                        opacity:0;
                        margin-left:100px;
                    }
                }
            }

            .data {
                flex:1;
                padding:40px;
                overflow-y:auto;
                overflow-x:hidden;

                .balance-table {
                    display:flex;
                    flex-direction: column;

                    .head, .row {
                        flex:1;
                        display: flex;
                        flex-direction: row;

                        figure {
                            flex:1;

                            &:not(:first-child){
                                padding-left:10px;
                                border-left:1px solid rgba(0,0,0,0.1);
                            }
                        }
                    }

                    .head {
                        border-radius:4px;
                        padding:7px 10px;
                        background:rgba(0,0,0,0.05);
                        color:rgba(0,0,0,0.5);
                        margin-bottom:8px;
                        font-size: 11px;
                        font-weight: bold;
                    }

                    .row {
                        padding:7px 10px;
                        box-shadow:0 1px 1px rgba(0,0,0,0.3);
                        background:#fff;
                        margin-bottom:8px;
                        border-radius:4px;
                        font-size: 13px;
                    }

                    .head, .row {
                    }
                }

                .token {

                    .basic-info {
                        display:flex;
                        flex-direction: row;
                        padding-bottom:20px;
                        border-bottom:1px solid rgba(0,0,0,0.1);
                        margin-bottom:20px;

                        .icon {
                            height:80px;
                            overflow: hidden;
                            max-width:80px;
                            width:100%;
                            margin-left:0;

                            transition: all 0.3s ease;
                            transition-property: max-width, margin-left;


                            &.placeholder {
                                max-width:0;
                                margin-left:-30px;
                            }

                            img {
                                width:80px;
                                height:80px;
                                border:0;
                            }
                        }

                        .info {
                            padding-left:30px;
                            flex:1;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: flex-start;

                            .name {
                                flex:1;
                                font-size: 24px;
                                font-weight: 600;
                                color:$black;
                            }

                            .description {
                                flex:1;
                                font-size: 16px;
                                color:$dark-grey;

                                &.small {
                                    margin-top:5px;
                                    font-size: 11px;
                                    font-family: 'Open Sans',sans-serif;
                                    color:$mid-dark-grey;
                                    font-weight: bold;
                                }
                            }
                        }
                    }

                }

                .account {

                }
            }
        }

    }



</style>
