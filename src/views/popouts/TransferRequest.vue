<template>
    <section class="popout-window transfer">
        <PopOutApp :app="popup.data.props.appData" suffix="is requesting a transfer" />

        <section v-if="!account">


            <section class="padded">
                <Input :disabled="amount > 0"
                     :red="inputError"
                     big="1"
                     centered="1"
                     :text="amount > 0 ? amount : customAmount"
                     v-on:changed="x => customAmount = x"
                     :placeholder="parseFloat(1).toFixed(decimals)" />

                <section class="boxes">
                    <section class="box nested account-selector" @click="selectTokenAndAccount">
                        <section>
                            <figure class="name">Select Account</figure>
                            <figure class="network">{{network.name}}</figure>
                        </section>
                        <figure class="chevron icon-dot-3"></figure>
                    </section>
                </section>
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

            <section class="boxes">
                <section class="box nested account-selector" @click="selectTokenAndAccount">
                    <section>
                        <figure class="name">{{account.sendable()}}</figure>
                        <figure class="network">{{network.name}}</figure>
                    </section>
                    <figure class="chevron icon-dot-3"></figure>
                </section>
            </section>

            <section class="fixed-actions" v-if="!pinning">
                <Button blue="1" :text="locale(langKeys.GENERIC.Confirm)" @click.native="returnResult(true)" />
                <Button :text="locale(langKeys.GENERIC.Deny)" @click.native="returnResult(null)" />
            </section>
        </section>

    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import PopOutApp from '../../components/popouts/PopOutApp';
	// import SearchBar from '../../components/reusable/SearchBar';
	import {IdentityRequiredFields} from "@walletpack/core/models/Identity";
	import Network from "@walletpack/core/models/Network";
	import RequiredFields from "../../components/popouts/RequiredFields";
	import KeyPairService from "@walletpack/core/services/secure/KeyPairService";
	import Keypair from "@walletpack/core/models/Keypair";
	import IdGenerator from "@walletpack/core/util/IdGenerator";
	import Token from "@walletpack/core/models/Token";
	import {Blockchains} from "@walletpack/core/models/Blockchains";
	import TokenService from "@walletpack/core/services/utility/TokenService";
	import PopupService from "../../services/utility/PopupService";
	import {Popup} from "../../models/popups/Popup";

	export default {
		props:['popup', 'expanded', 'pinning'],
		components:{
			RequiredFields,
			PopOutApp,
			// SearchBar,
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
			selectTokenAndAccount(){
				PopupService.push(Popup.selectAccount(account => {
					if(!account) return;
					this.account = account;
				}, this.validAccounts))
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

    .app-details {
        padding:50px 50px 20px 50px;
    }

    .boxes {
        width:100%;

        .box {
            width:100%;
        }

    }





    .memo {
        text-align:center;

        > span {
            font-size: 13px;
            color: $blue;
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
            color: $blue;
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
