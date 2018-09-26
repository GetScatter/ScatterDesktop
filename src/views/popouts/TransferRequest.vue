<template>
    <section>

        <section class="popup">

            <section class="top-section">
                <!-- HEADER -->
                <section class="head">
                    <figure class="logo">S</figure>
                    <figure class="info">
                        <figure>Transfer Request</figure>
                        <figure>{{pluginOrigin}} - {{payload.origin}}</figure>
                    </figure>
                    <figure class="close" @click="returnResult(null)">
                        <i class="fa fa-times"></i>
                    </figure>
                </section>

                <!--<section class="search-bar">-->
                    <!--<figure class="icon"><i class="fa fa-search"></i></figure>-->
                    <!--<input placeholder="Search" v-model="searchTerms" />-->
                <!--</section>-->
            </section>

            <section class="transfer-data">
                <figure v-if="amount <= 0" :forced="customAmount > 0" style="width:200px; margin:0 auto; padding-bottom:10px; text-align:left;">
                    <section style="position:relative;">
                        <cin type="number" placeholder="Amount" :text="customAmount" v-on:changed="changed => bind(changed, 'customAmount')"></cin>
                        <section style="position:absolute; top:8px; right:0; font-size:14px;">
                            {{symbol}}
                        </section>
                    </section>

                </figure>
                <figure class="to"><span style="font-size:11px; display:block;">to</span> {{to}}</figure><br>
                <figure v-if="amount > 0">{{parseFloat(amount).toFixed(decimals)}}</figure>

                <span v-if="memo.length" class="memo">Memo: <b>{{memo}}</b></span>
            </section>

            <section class="lists">
                <section class="list">
                    <section class="breadcrumbs" v-if="!selectedAccount">
                        <figure class="breadcrumb">Select an Account</figure>
                    </section>

                    <section class="breadcrumbs" v-else>
                        <figure class="breadcrumb button" @click="selectedAccount = null">Back to Accounts</figure>
                        <figure class="breadcrumb">Confirm Transfer</figure>
                    </section>

                    <section v-if="!selectedAccount" class="item" :class="{'disabled':balance(account) < amount}"
                             v-for="account in validAccounts" @click="selectAccount(account)">
                        <figure class="title">{{account.formatted()}}</figure>
                        <figure class="sub-title" :class="{'not-enough':balance(account) < amount}">{{balance(account)}} {{symbol}}</figure>
                        <figure class="chevron">
                            <i class="fa fa-check"></i>
                        </figure>
                    </section>

                    <section v-if="selectedAccount" class="approve-transfer">
                        <figure class="header">
                            <b>{{selectedAccount.formatted()}}</b>
                            <figure class="line"></figure>
                            You are about to transfer <b>{{amount > 0 ? parseFloat(amount).toFixed(decimals) : parseFloat(customAmount).toFixed(decimals)}} {{symbol}}</b> to <b>{{to}}</b>.
                            Are you sure?
                        </figure>
                        <section class="action-buttons">
                            <btn class="button" text="Deny" red="1" full="1" large="1" v-on:clicked="returnResult(null)"></btn>
                            <btn class="button" text="Approve" full="1" large="1" v-on:clicked="returnResult(true)"></btn>
                        </section>
                    </section>
                </section>
            </section>
        </section>



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import Account from '../../models/Account'
    import Network from '../../models/Network'
    import {IdentityRequiredFields} from '../../models/Identity'

    import RIDLService from '../../services/RIDLService';
    import WindowService from '../../services/WindowService';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup';
    import {Blockchains} from '../../models/Blockchains';
    import PluginRepository from '../../plugins/PluginRepository'

    export default {
        data () {return {
            selectedAccount:null,
            searchTerms:'',
            balances:[],
            customAmount:0,
        }},
        computed:{
            ...mapState([
                'state',
                'scatter'
            ]),
            ...mapGetters([
                'identities',
                'accounts',
            ]),
            network(){ return Network.fromJson(this.payload.network); },
            to(){ return this.payload.to; },
            amount(){ return parseFloat(this.payload.amount); },
            options(){ return this.payload.options || {}; },
            symbol(){ return this.payload.symbol; },
            contract(){ return this.payload.contract; },
            memo(){ return this.payload.memo; },
            decimals(){ return this.options.decimals || 4; },
            validAccounts(){
                return this.accounts
                    .filter(x => [this.network.unique()].includes(x.networkUnique))
                    .filter(x => [this.network.blockchain].includes(x.blockchain().toLowerCase()))
                    .filter(id => JSON.stringify(id).toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1);
            },
        },
        mounted(){
            this.checkWarning();
            this.validAccounts.map(async account => {
                this.balances.push({
                    account:account.unique(),
                    balance:await this.getBalance(account)
                });
            })
        },
        methods: {
            async checkWarning(){
//                const warn = await RIDLService.shouldWarn(RIDLService.buildEntityName('application', this.payload.origin));
//                if(warn.length)
//                    PopupService.push(Popup.selector('Warning', 'This entity has a negative reputation. Be careful interacting with it.',
//                        'exclamation-triangle', warn, x => `${x.type}: ${x.reputation*100}% REP ( ${x.total_reputes} users )`, () => {}, true))
            },
            returnResult(result){
                let returned = null;
                if(result){
                    let amount = this.amount > 0 ? parseFloat(this.amount).toFixed(this.decimals).toString() : parseFloat(this.customAmount).toFixed(this.decimals).toString();

                    returned = {
                        account:this.selectedAccount,
                        amount
                    }
                }
                this.$emit('returned', returned);
            },
            selectAccount(account){
                if(this.balance(account) < this.amount) return;
                this.selectedAccount = account;
            },
            async getBalance(account){
                return await PluginRepository.plugin(this.network.blockchain)
                    .balanceFor(account, this.contract, this.symbol);
            },
            balance(account){
                const bal = this.balances.find(x => x.account === account.unique());
                if(!bal) return 0;
                return bal.balance;
            }
        },
        props:['payload', 'pluginOrigin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";

    .pop-in {
        width:200px;
    }

    .popup {
        background:$very-light-blue;
        width:440px;
        height:560px;
        display: flex;
        flex-flow: column;

        .top-section {
            flex: 0 1 auto;
        }

        .head, .requirements, .search-bar {
            background:#fff;
            margin-bottom:1px;
        }

        .head {
            -webkit-app-region: drag;
            padding:20px;
            overflow: hidden;

            .logo {
                line-height: 40px;
                height:36px;
                width:36px;
                background:$light-blue;
                color:#fff;
                font-family: 'Grand Hotel', sans-serif;
                font-size:24px;
                border-radius:50%;
                text-align:center;
                float:left;
                padding-right: 1px;
            }

            .info {
                float:left;
                width:calc(100% - 36px);
                padding-left:20px;
                overflow: hidden;

                figure {
                    float:left;

                    &:first-child {
                        font-size:16px;
                        font-weight: 600;
                        width:100%;
                        padding-top:2px;
                    }

                    &:last-child {
                        font-size:11px;
                        color:$dark-grey;
                        margin-top:2px;
                    }
                }
            }

            .close {
                -webkit-app-region: no-drag;
                position:absolute;
                top:20px;
                right:20px;
                font-size:24px;
                color:$mid-light-grey;
                transition: color 0.2s ease;
                cursor: pointer;

                &:hover {
                    color:$light-blue;
                }
            }
        }

        .transfer-data {
            background:#fff;
            margin-bottom:1px;
            padding:20px;
            text-align:center;
            font-size:24px;
            font-family: 'Roboto', sans-serif;
            font-weight: bold;

            box-shadow:0 0 50px rgba(0,0,0,0.08), 0 2px 5px rgba(0,0,0,0.05);

            .to {
                display:inline-block;
                padding:5px 10px;
                border-radius:4px;
                background:$red;
                color:#fff;
                font-size: 18px;
                font-weight: 300;
                margin-bottom:10px;
            }

            .memo {
                font-size: 11px;
                width:100%;
                display:block;
                font-weight: 400;
            }
        }

        .lists {
            position:relative;
            flex: 1 1 auto;
            overflow-y:auto;

            .list {
                padding-bottom:30px;
                overflow-y:auto;
                position: relative;
                height:100%;

                .breadcrumbs {
                    padding:15px 20px;

                    .breadcrumb {
                        padding:6px 10px;
                        font-size:11px;
                        font-style: italic;
                        font-weight: 600;
                        color:$dark-grey;
                        border-radius:4px;
                        border: 1px dashed $medium-grey;
                        display:inline-block;

                        &.button {
                            cursor: pointer;
                            background:#fff;
                            border: 0;
                            box-shadow:0 1px 2px rgba(0,0,0,0.1);
                            transform:translateY(0px);
                            transition: box-shadow 0.1s ease, transform 0.1s ease;

                            &:hover {
                                transform:translateY(-1px);
                                box-shadow:0 3px 7px rgba(0,0,0,0.08);
                            }

                            &:active {
                                transform:translateY(1px);
                                box-shadow:0 1px 2px rgba(0,0,0,0.2);
                            }
                        }
                    }
                }


                .item {
                    cursor: pointer;
                    margin:0 20px;
                    padding:30px;
                    background:#fff;
                    color:$dark-grey;
                    border-radius:4px;
                    box-shadow:0 1px 2px rgba(0,0,0,0.1);
                    transform:translateY(0px);
                    transition: box-shadow 0.2s ease, transform 0.2s ease;
                    margin-bottom:10px;
                    padding-right:50px;

                    .title {
                        font-size:18px;
                        color:$dark-grey;
                        font-weight: 600;
                        margin-bottom:5px;
                    }

                    .sub-title {
                        font-size:14px;
                        font-weight: bold;
                        font-family: 'Roboto', sans-serif;
                        color:$light-blue;

                        &.not-enough {
                            color:$red;
                        }
                    }

                    .chevron {
                        position:absolute;
                        right:20px;
                        top:0;
                        bottom:0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color:$mid-light-grey;
                    }

                    &:hover {
                        transform:translateY(-1px);
                        box-shadow:0 3px 7px rgba(0,0,0,0.08);
                    }

                    &:active {
                        transform:translateY(1px);
                        box-shadow:0 1px 2px rgba(0,0,0,0.2);
                    }

                    &.disabled {
                        opacity:0.5;
                    }
                }
            }

        }

        .approve-transfer {
            margin:0 20px 20px;

            .header {
                padding:20px;
                border:1px solid rgba(0,0,0,0.1);
                border-radius:4px;
                font-size:18px;
                text-align:center;

                .line {
                    width:100%;
                    height:1px;
                    background:rgba(0,0,0,0.1);
                    margin:10px 0;
                }
            }

            .action-buttons {
                overflow: hidden;

                .button {
                    width:calc(50% - 10px);
                    float:left;

                    &:first-child{
                        margin-right:20px;
                    }
                }
            }
        }

    }
</style>
