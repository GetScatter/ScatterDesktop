<template>
    <section>
        <PopOutHead v-on:closed="returnResult(null)" />
        <section class="multi-pane">
            <section class="main-panel">

                <section v-if="!account">
                    <section class="participants">
                        <section class="participant">{{network.name}}</section>
                    </section>
                    <br>
                    <section class="padded">
                        <section class="transfer-details">
                            <span class="blue">{{popup.origin()}}</span>
                            <span>{{locale(langKeys.POPOUTS.TRANSFER.SendingTo, token.symbol)}}</span>
                            <span class="bold" :class="{'small':to.length > 12}">{{to}}</span>
                        </section>
                    </section>


                    <br>

                    <section class="padded">
                        <cin :disabled="amount > 0"
                             :red="inputError"
                             big="1"
                             centered="1"
                             :text="amount > 0 ? amount : customAmount"
                             v-on:changed="x => customAmount = x"
                             :placeholder="parseFloat(1).toFixed(decimals)" />
                    </section>

                    <SearchBar style="flex:1;" short="1"
							   :placeholder="locale(langKeys.POPOUTS.TRANSFER.SearchPlaceholder)"
							   v-on:terms="x => searchTerms = x" />

                    <section class="popout-list">
                        <FullWidthRow :items="validAccounts" popout="1" />
                    </section>
                </section>

                <section class="padded" v-else>
                    <br>
                    <br>
                    <section class="transfer-details">
                        <div v-if="amount > 0">{{parseFloat(amount).toFixed(decimals)}} {{token.symbol}}</div>
                        <div v-else>{{customAmount}} {{token.symbol}}</div>
                        <span :class="{'small':to.length > 12}">{{to}}</span>

                    </section>
                    <section class="memo" v-if="memo && memo.length">
                        <section class="info-line">
                            <span>{{locale(langKeys.GENERIC.Memo)}}</span>
                        </section>
                        <span>{{memo}}</span>
                    </section>



                    <section class="info-line">
                        <span>From</span>
                    </section>

                    <FullWidthRow :items="selectedAccounts" popout="1" />

                    <section class="fixed-actions" v-if="!pinning">
                        <btn blue="1" :text="locale(langKeys.GENERIC.Accept)" v-on:clicked="returnResult(true)" />
                        <btn :text="locale(langKeys.GENERIC.Deny)" v-on:clicked="returnResult(null)" />
                    </section>
                </section>


            </section>


        </section>

    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import PopOutHead from '../../components/popouts/PopOutHead';
	import PopOutAction from '../../components/popouts/PopOutAction';
	import SearchBar from '../../components/reusable/SearchBar';
	import FullWidthRow from '../../components/reusable/FullWidthRow';
	import {IdentityRequiredFields} from "../../models/Identity";
	import Network from "../../models/Network";
	import RequiredFields from "../../components/popouts/RequiredFields";
	import KeyPairService from "../../services/KeyPairService";
	import Keypair from "../../models/Keypair";
	import IdGenerator from "../../util/IdGenerator";
	import Token from "../../models/Token";
	import {Blockchains} from "../../models/Blockchains";
	import TokenService from "../../services/TokenService";

	export default {
		props:['popup', 'expanded', 'pinning'],
		components:{
			RequiredFields,
			PopOutHead,
			PopOutAction,
			FullWidthRow,
			SearchBar,
		},
		data () {return {
			searchTerms:'',
            account:null,
			customAmount:0,
			inputError:false,
		}},
		created(){
            this.customAmount = parseFloat(0).toFixed(this.decimals);
		},
		computed: {
			...mapState([
				'scatter'
			]),
			...mapGetters([
				'identity',
				'identities',
				'accounts',
				'networks',
				'keypairs',
			]),
			payload(){ return this.popup.payload(); },
			network(){ return this.networks.find(x => x.unique() === Network.fromJson(this.payload.network).unique()); },
            blockchain(){ return this.network.blockchain; },
			to(){ return this.payload.to; },
			amount(){ return parseFloat(this.payload.amount).toFixed(this.decimals); },
			options(){ return this.payload.options || {}; },
			memo(){ return this.payload.memo; },
			decimals(){ return this.options.decimals || 4; },
            token(){
			    return Token.fromJson({
                    contract:this.payload.contract,
				    blockchain:this.blockchain,
				    symbol:this.payload.symbol,
                    decimals:this.options.decimals || PluginRepository.plugin(this.blockchain).defaultDecimals(),
                    name:this.payload.symbol
                })
            },
			validAccounts(){
				return this.accounts
					.filter(x => [this.network.unique()].includes(x.networkUnique))
					.filter(x => [this.network.blockchain].includes(x.blockchain().toLowerCase()))
					.filter(id => JSON.stringify(id).toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1)
					.reduce((acc, account) => {
						if(!acc.find(x => account.network().unique() === x.network().unique()
							&& account.sendable() === x.sendable())) acc.push(account);

						return acc;
					}, [])
                    .map(x => this.formatAccount(x, true))
			},
            selectedAccounts(){
                return [this.account]
	                .map(x => this.formatAccount(x, false))
            },
            currentAmount(){
	            return this.amount > 0 ? this.amount : this.customAmount;
            }
		},
		methods: {
			returnResult(result){
				if(!result) return this.$emit('returned', null);

				let amount = this.currentAmount;
				if(this.blockchain === Blockchains.EOSIO){
					amount = parseFloat(amount).toFixed(this.decimals);
				} else {
					amount = TokenService.formatAmount(amount, this.token);
				}
				this.$emit('returned', {
					account:this.account,
					amount
				});
			},
			selectAccount(account){
				this.inputError = false;
				if(account && this.currentAmount <= 0)
					return this.inputError = true;

                this.account = account;
			},
            formatAccount(account, select = true){
	            return {
		            title:account.sendable(),
		            description:``,
		            actions:[{
			            name:select
							? this.locale(this.langKeys.GENERIC.Select)
							: this.locale(this.langKeys.GENERIC.Unselect),
			            handler:() => this.selectAccount(select ? account : null),
			            blue:select,
                        red:!select,
			            small:1,
		            }]
	            }
            }
		},
        watch:{
			['customAmount'](){
				this.inputError = false;
            }
        }
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../styles/variables";

    .memo {
        text-align:center;

        > span {
            font-size: 13px;
            color:$primary;
            font-weight: bold;
        }
    }

    .padded {
        padding:0 30px;
    }

    .transfer-details {
        text-align:center;
        span {
            display:block;
            font-size: 22px;
        }

        div {
            font-size: 36px;
        }

        .blue {
            color:$primary;
        }

        .small {
            font-size: 13px;
        }

        .bold {
            font-weight: 800;
        }
    }

    .popout-list {
        padding-top:0;

        &.done {
            opacity:0.3;

            &:hover {
                opacity:1;
            }
        }


        .search-bar {
            margin-left:-30px;
        }
    }

</style>
