<template>
    <section class="transfer">
        <back-bar v-on:back="back" :buttons="[{text:locale(langKeys.GENERIC.History), clicked:() => openHistory()}]" />

        <TokenSelector v-if="selectingToken"
                       :title="locale(langKeys.GENERIC.SelectToken)"
					   :lists="selectableTokens"
					   :custom="account"
					   v-on:custom="setCustomToken" />

        <section class="full-panel inner limited" v-if="!selectingToken">

            <section class="tokens-out">

                <section class="panel">
                    <h5>{{locale(langKeys.TRANSFER.Sender)}}</h5>

                    <section>
                        <section class="box">
                            <section class="row clickable" @click="selectAccount('from')">
                                <figure class="fill">
                                    <div>{{account.network().name}}</div>
                                    {{account.sendable()}}
                                </figure>
                                <figure class="chevron icon-down-open-big"></figure>
                            </section>
                            <section class="row unpad">
                                <figure class="fill pad darker">
                                    <div>{{account.tokenBalance(token)}} {{token.symbol}}</div>
                                </figure>
                            </section>
                        </section>
                    </section>

                    <section>
                        <section class="box">
                            <section class="row clickable" @click="selectToken('from')">
                                <figure class="icon" :class="[{'small':token && token.symbol.length >= 4}, token.symbolClass()]">
                                    <span v-if="!token.symbolClass()">{{token.truncatedSymbol()}}</span>
                                </figure>
                                <figure class="fill">{{token.name}}</figure>
                                <figure class="chevron icon-down-open-big"></figure>
                            </section>
                            
                            <section class="row highlighted">
                                <figure class="icon">{{token.truncatedSymbol()}}</figure>
                                <figure class="fill">
                                    <input style="flex:1;" v-model="token.amount" v-on:input="changedAmount"
                                           :placeholder="parseFloat(1).toFixed(token.decimals)" />
                                </figure>
                            </section>

                            <section class="row unpad">
                                <section class="row pad">
                                    <figure class="icon">{{displayCurrency}}</figure>
                                    <input style="flex:1;" v-model="fiat" v-on:input="changedFiat" placeholder="0.00" />
                                </section>
                            </section>

                        </section>

                        <section class="box no-box row unpad">
                            <figure class="fill no-pad">
                                <section class="row unpad">
                                    <div class="fraction clickable" @click="setFraction('100')">100%</div>
                                    <div class="fraction clickable" @click="setFraction('50')">50%</div>
                                    <div class="fraction clickable" @click="setFraction('25')">25%</div>
                                </section>
                            </figure>
                        </section>

                    </section>

                </section>






                <!-- RIGHT PANEL -->
                <section class="panel upper-arrow">
                    <h5>{{locale(langKeys.TRANSFER.Recipient)}}</h5>

                    <section>
                        <Recipient :account="account"
                                   :recipient="recipient"
                                   v-on:change="x => recipient = x"
                                   v-on:select="selectAccount" />
                    </section>

                    <section style="max-height: 150px;" v-if="token && token.blockchain === 'eos'">
                        <label>{{locale(langKeys.GENERIC.Memo)}}</label>
                        <section class="box dark outlined">
                            <section class="row">
                                <input :placeholder="locale(langKeys.TRANSFER.MemoPlaceholder)" style="font-size: 14px; height:25px;" v-model="memo" />
                            </section>
                        </section>
                    </section>

                </section>

            </section>


            <section class="action-bar short bottom centered">
                <btn blue="1" :text="locale(langKeys.TRANSFER.SendButton)" v-on:clicked="send" :disabled="!canSend" :loading="sending" />
            </section>
        </section>


    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../store/constants';
	import TokenSelector from '../components/panels/TokenSelector';
	import Recipient from '../components/panels/transfer/Recipient';
	import PluginRepository from "../plugins/PluginRepository";
	import ExchangeService from "../services/ExchangeService";
	import Account from "../models/Account";
	import PopupService from "../services/PopupService";
	import {Popup} from "../models/popups/Popup";
	import TransferService from "../services/TransferService";
	import BalanceService from "../services/BalanceService";
	import PasswordService from "../services/PasswordService";
	import {Blockchains} from "../models/Blockchains";
	import ContactService from "../services/ContactService";

	export default {
		components:{
			TokenSelector,
			Recipient
		},
		data () {return {
			account:null,
			recipient:null,
			token:null,
			fiat:null,
			selectingToken:false,
			sending:false,
			memo:'',
		}},
		computed:{
			...mapState([
				'scatter',
                'history'
			]),
			...mapGetters([
				'accounts',
				'displayCurrency',
				'totalBalances',
                'contacts',
			]),

			accountTokens(){
				if(!this.account) return [];
				const systemToken = this.account.network().systemToken().uniqueWithChain();
				return this.account.tokens()
					.sort((a,b) => {
						const system = systemToken === b.uniqueWithChain() ? 1
							: systemToken === a.uniqueWithChain() ? -1 : 0;
						return system || (b.fiatBalance(false) || 0) - (a.fiatBalance(false) || 0) || b.amount - a.amount
					})
			},
			selectableTokens(){
				return [{
					title:'',
					active:this.token ? this.token.uniqueWithChain() : null,
					handler:id => {
						this.token = this.account.tokens().find(x => x.uniqueWithChain() === id).clone();
						this.token.amount = null;
						this.selectingToken = false;
					},
					tokens:this.accountTokens
                        .filter(x => !x.unusable)
						.map(token => {
							const amount = this.account.tokenBalance(token);
							return {
								id:token.uniqueWithChain(),
								name:token.name,
								symbol:token.symbol,
								amount:amount ? this.formatNumber(parseFloat(amount).toFixed(token.decimals), parseInt(amount) < 1000000) : '--',
								token:token.clone(),
								fiat:token.fiatBalance(false),
							}
						}),
				}];
			},
			canSend(){
				return !this.sending && this.recipient && this.recipient.length && this.token && this.token.amount > 0;
            },
		},
		created(){
			const history = this.$route.query.history ? this.history.find(x => x.id === this.$route.query.history) : null;
			if(history){
				this.account = history.from;
				this.recipient = history.to;
				this.memo = history.memo;
				this.token = history.token.clone();
				this.changedAmount();
            } else {
				this.account = this.accounts.filter(x => x.authority !== 'watch').sort((a,b) => b.totalFiatBalance() - a.totalFiatBalance())[0] || null;
				const systemTokenUnique = this.account.network().systemToken().uniqueWithChain();
				const token = this.account.network().systemToken().clone();
				token.amount = null;
				this.token = token;
            }

		},
		methods:{
			back(){
				if(this.selectingToken) return this.selectingToken = false;
				this.$router.push({name:this.RouteNames.HOME});
			},
            openHistory(){
			    PopupService.push(Popup.history('transfer', () => {}))
            },
			setCustomToken(token){
				this.token = token;
				this.token.amount = null;
				this.selectingToken = false;
			},
			selectAccount(type){
				PopupService.push(Popup.selectAccount(account => {
					if(!account) return;
					if(type === 'from'){
						this.account = account;
						BalanceService.loadBalancesFor(account);
						if(this.accountTokens.length){
							this.token = this.accountTokens[0].clone();
							this.token.amount = null;
                        }
						if(this.recipient === account.sendable()) this.recipient = '';
					} else {
						this.recipient = account;
					}
					this.changedAmount()
				}, type === 'from', type === 'to' && this.account ? this.account : null, type === 'to' && this.pair ? this.pair.blockchain : null, type === 'from'));
			},
			setFraction(fraction){
				const balance = parseFloat(this.account.tokenBalance(this.token));
				if(!balance) return 0;
				switch(fraction){
					case '100': this.token.amount = balance; break;
					case '50': this.token.amount = balance/2; break;
					case '25': this.token.amount = balance/4; break;
				}

				this.token.amount = parseFloat(this.token.amount).toFixed(this.token.decimals);
				this.changedAmount()
			},
			changedFiat(){
				this.token.amount = parseFloat(this.fiat / this.token.fiatPrice(false)).toFixed(this.token.decimals);
			},
			changedAmount(){
				this.fiat = !this.token.amount || this.token.amount === '' ? null : this.token.fiatBalance(false)
			},
			selectToken(id){
				this.selectingToken = id;
				this.changedAmount()
			},
			async send(){
				const reset = () => this.sending = false;
				if(!this.canSend) return;
				this.sending = true;
				PopupService.push(Popup.confirmTransfer(this.account.sendable(), this.recipient, this.token, this.memo, async accepted => {
					if(!accepted) return reset();
					if(!await PasswordService.verifyPIN()) return reset();
					const sent = await TransferService[this.account.blockchain()]({
						account:this.account,
						recipient:this.recipient,
						amount:this.token.amount,
						memo:this.memo,
						token:this.token,
						promptForSignature:false,
					}).catch(() => false);
					reset();
					if(sent) {
						BalanceService.loadBalancesFor(this.account);
					}
                }))
			}
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";
    @import "../styles/transfer";



</style>