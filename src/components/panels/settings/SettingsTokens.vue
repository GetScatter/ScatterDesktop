<template>
    <section>

        <section class="panel-switch">
            <figure class="button" :class="{'active':state === STATES.ADD_TOKEN}" @click="state = STATES.ADD_TOKEN">{{locale(langKeys.SETTINGS.TOKENS.SWITCH.ADD_TOKEN)}}</figure>
            <figure class="button" :class="{'active':state === STATES.WHITELIST}" @click="state = STATES.WHITELIST">{{locale(langKeys.SETTINGS.TOKENS.SWITCH.WHITELIST)}}</figure>
            <figure class="button" :class="{'active':state === STATES.BLACKLIST}" @click="state = STATES.BLACKLIST">{{locale(langKeys.SETTINGS.TOKENS.SWITCH.BLACKLIST)}}</figure>
            <figure class="button" :class="{'active':state === STATES.SETTINGS}" @click="state = STATES.SETTINGS">{{locale(langKeys.SETTINGS.TOKENS.SWITCH.SETTINGS)}}</figure>
        </section>
        <br>


        <!--------------------------->
        <!------   ADD TOKEN   ------>
        <!--------------------------->
        <section v-if="state === STATES.ADD_TOKEN">

            <section class="disclaimer less-pad">
                {{locale(langKeys.SETTINGS.TOKENS.ADD_TOKEN.Disclaimer)}}
            </section>

            <section class="split-inputs">
                <sel style="flex:1; margin-left:0;" :label="locale(langKeys.GENERIC.Network)"
                     :selected="filteredNetworks.find(x => x.chainId === newToken.chainId)"
                     :options="filteredNetworks"
                     :parser="x => x.name"
                     v-on:changed="x => newToken.chainId = x.chainId" />

                <cin style="flex:1; margin-bottom:0;" :placeholder="locale(langKeys.SETTINGS.TOKENS.ADD_TOKEN.TokenNamePlaceholder)"
                     :label="locale(langKeys.SETTINGS.TOKENS.ADD_TOKEN.TokenNameLabel)"
                     :text="newToken.name" v-on:changed="x => newToken.name = x" />
            </section>
            <br>

            <section class="split-inputs">
                <sel style="flex:1; margin-left:0;" :label="locale(langKeys.GENERIC.Blockchain)"
                     :selected="{value:newToken.blockchain}"
                     :options="blockchains"
                     :parser="x => blockchainName(x.value)"
                     v-on:changed="x => newToken.blockchain = x.value" />

                <cin style="flex:1; margin-bottom:0;"
                     v-if="newToken.needsContract()"
                     :placeholder="contractPlaceholder"
                     :label="locale(langKeys.GENERIC.Contract)"
                     :text="newToken.contract"
                     v-on:changed="x => newToken.contract = x" />
            </section>
            <br>
            <section class="split-inputs">
                <cin placeholder="XXX" :label="locale(langKeys.GENERIC.Symbol)" :text="newToken.symbol" v-on:changed="x => newToken.symbol = x" />
                <cin placeholder="4" type="number" :label="locale(langKeys.GENERIC.Decimals)" :text="newToken.decimals" v-on:changed="x => newToken.decimals = x" />
            </section>

            <section class="split-inputs">
                <btn style="max-width:100%;" :text="locale(langKeys.SETTINGS.TOKENS.ADD_TOKEN.WhitelistTokenButton)" v-on:clicked="addToken(false)" />
                <btn style="max-width:100%;" red="1" :text="locale(langKeys.SETTINGS.TOKENS.ADD_TOKEN.BlacklistTokenButton)" v-on:clicked="addToken(true)" />
            </section>
        </section>




        <!--------------------------->
        <!------   SETTINGS   ------->
        <!--------------------------->
        <section v-if="state === STATES.SETTINGS">

            <section class="action-box top-pad">
                <label>{{locale(langKeys.SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayLabel)}}</label>
                <p>{{locale(langKeys.SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayDescription)}}</p>

                <br>
                <br>
                <section class="split-inputs">
                    <section class="switch" style="flex:0 0 auto;" @click="toggleMainnetsOnly">
                        <figure class="dot" :class="{'disabled':!mainnetTokensOnly}"></figure>
                    </section>
                    <section class="details" v-if="mainnetTokensOnly">
                        <figure class="title">{{locale(langKeys.SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayAllNetworksButton)}}</figure>
                        <p>{{locale(langKeys.SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayAllNetworksDesc)}}</p>
                    </section>
                    <section class="details" v-if="!mainnetTokensOnly">
                        <figure class="title">{{locale(langKeys.SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayMainnetButton)}}</figure>
                        <p>{{locale(langKeys.SETTINGS.TOKENS.SETTINGS.MainBalanceDisplayMainnetDesc)}}</p>
                    </section>
                </section>
            </section>

            <section class="action-box top-pad">
                <label>{{locale(langKeys.SETTINGS.TOKENS.SETTINGS.FilterSmallBalancesLabel)}}</label>
                <p>{{locale(langKeys.SETTINGS.TOKENS.SETTINGS.FilterSmallBalancesDescription)}}</p>
                <br>
                <br>

                <cin v-for="blockchain in blockchains"
                     :key="blockchain.value"
                     :placeholder="defaultDecimals(blockchain.value)"
                     :label="blockchainName(blockchain.value)"
                     :text="balanceFilters[blockchain.value]"
                     v-on:changed="x => balanceFilters[blockchain.value] = x"
                     type="number" />
            </section>
        </section>



        <!---------------------------------------->
        <!------   WHITELIST / BLACKLIST   ------->
        <!---------------------------------------->
        <section v-if="state === STATES.WHITELIST || state === STATES.BLACKLIST">

            <sel style="flex:2;" :label="locale(langKeys.SETTINGS.TOKENS.WHITE_BLACK.TokenFilterLabel)"
                 :selected="blockchain ? {value:blockchain} : null"
                 :options="[null].concat(blockchains)"
                 :parser="x => x ? blockchainName(x.value) : 'No Blockchain Filter'"
                 v-on:changed="x => blockchain = x ? x.value : null" />

            <SearchBar class="search"
                       :placeholder="locale(langKeys.SETTINGS.TOKENS.WHITE_BLACK.TokenSearchPlaceholder)"
                       v-on:terms="x => searchTerms = x" />

            <br>
            <section v-if="state === STATES.WHITELIST">

                <FlatList style="padding:0;"
                          :label="locale(langKeys.SETTINGS.TOKENS.WHITE_BLACK.WHITELIST.CustomTokensLabel)"
                          :items="tokensList"
                          icon="icon-cancel"
                          v-if="tokensList.length"
                          :selected="selectedDisplayToken"
                          v-on:selected="selectDisplayToken"
                          v-on:action="removeToken" />
            </section>

            <section v-if="state === STATES.BLACKLIST">

                <section class="disclaimer less-pad" v-if="!searchTerms.length">
                    {{locale(langKeys.SETTINGS.TOKENS.WHITE_BLACK.BLACKLIST.Disclaimer)}}
                    <p>{{locale(langKeys.SETTINGS.TOKENS.WHITE_BLACK.BLACKLIST.DisclaimerSubtitle)}}</p>
                </section>

                <FlatList style="padding:0 0 20px 0;"
                          :items="blacklistTokensList"
                          icon="icon-cancel"
                          v-on:action="removeToken" />
            </section>
        </section>

    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';

	import PluginRepository from '../../../plugins/PluginRepository';
	import {BlockchainsArray, Blockchains, blockchainName} from '../../../models/Blockchains';
	import FlatList from '../../reusable/FlatList';
	import SearchBar from '../../reusable/SearchBar';
	import Token from "../../../models/Token";
	import TokenService from "../../../services/TokenService";
	import PriceService from "../../../services/PriceService";

	const formatter = list => list.map(token => {
		const fiatPrice = token.fiatPrice();
		const description = `${blockchainName(token.blockchain)} ${fiatPrice ? ' - '+fiatPrice : ''}`;
		return {
			id:token.unique(),
			title:`${token.name} (${token.network() ? token.network().name : ''})`,
			description
		};
	});

	const STATES = {
		ADD_TOKEN:'addToken',
		WHITELIST:'whitelist',
		BLACKLIST:'blacklist',
		SETTINGS:'settings',
	};

	let balanceFilterTimeout;

	export default {
		components:{
			FlatList,
			SearchBar
		},
		data () {return {
			state:STATES.WHITELIST,
			STATES,

			blockchain:null,
			blockchains:BlockchainsArray,
			newToken:Token.placeholder(),
			addingToken:false,

			searchTerms:'',
			currencies:[],

			balanceFilters:{},
		}},
		mounted(){
			this.newToken.chainId = PluginRepository.plugin(Blockchains.EOSIO).getEndorsedNetwork().chainId;
			PriceService.getCurrencies().then(x => this.currencies = x);
			this.balanceFilters = this.scatter.settings.balanceFilters;
		},
		computed:{
			...mapState([
				'scatter'
			]),
			...mapGetters([
				'tokens',
				'networks',
				'networkTokens',
				'blacklistTokens',
				'mainnetTokensOnly',
				'displayToken',
				'displayCurrency',
			]),
			selectedDisplayToken(){
				if(!this.displayToken) return 'fiat_'+this.displayCurrency;
				return this.displayToken;
			},


			contractPlaceholder(){
				return PluginRepository.plugin(this.newToken.blockchain).contractPlaceholder();
			},
			blacklistTokensList(){
				if(!this.blockchain) return formatter(this.blacklistTokens);
				return formatter(this.blacklistTokens
					.filter(x => x.blockchain === this.blockchain))
			},
			currencyList(){
				return this.currencies.map(ticker => ({
					id:`fiat_${ticker}`,
					title:ticker,
				}));
			},
			terms(){
				return this.searchTerms.trim().toLowerCase();
			},
			networkTokensList(){
				const tokens = this.filterTokensByTerms(this.networkTokens).reduce((acc, t) => {
					if(!acc.find(x => x.unique() === t.unique())) acc.push(t);
					return acc;
                }, []);
				if(!this.blockchain) return formatter(tokens);
				return formatter(tokens
					.filter(x => x.blockchain === this.blockchain))
			},
			tokensList(){
				const tokens = this.filterTokensByTerms(this.tokens);
				if(!this.blockchain) return formatter(tokens);
				return formatter(tokens
					.filter(x => x.blockchain === this.blockchain))
			},
            filteredNetworks(){
				return this.networks.filter(x => x.blockchain === this.newToken.blockchain);
            }
		},
		methods:{
			filterTokensByTerms(tokensList){
				return tokensList
					.filter(x => {
						return x.symbol.toLowerCase().indexOf(this.terms) > -1
							|| x.name.toLowerCase().indexOf(this.terms) > -1
							|| x.blockchain.toLowerCase().indexOf(this.terms) > -1
							|| this.blockchainName(x.blockchain).toLowerCase().indexOf(this.terms) > -1
					})
			},
			defaultDecimals(blockchain){
				const decimals = PluginRepository.plugin(blockchain).defaultDecimals();
				let stringDecimals = '0.';
				for(let i = 0; i < decimals; i++){ stringDecimals+=i === (decimals-1) ? '1' : '0'; }
				return stringDecimals
			},
			selectDisplayToken(token){
				const asFiat = token.id.startsWith('fiat_');
				if(asFiat){
					const scatter = this.scatter.clone();
					scatter.settings.displayCurrency = token.title;
					this[Actions.SET_SCATTER](scatter);
				}

				if(!token.id || asFiat) return TokenService.setDisplayToken(null);
				TokenService.setDisplayToken(token.id);
			},
			async addToken(blacklist = false){
				this.newToken.contract = this.newToken.contract.trim();
				if(await TokenService.addToken(this.newToken, blacklist)){
					this.state = blacklist ? STATES.BLACKLIST : STATES.WHITELIST;
				}
			},
			async removeToken(item){
				const token = this.tokens.concat(this.networkTokens).concat(this.blacklistTokens).find(x => x.unique() === item.id);
				await TokenService.removeToken(token);
			},
			async toggleMainnetsOnly(){
				const scatter = this.scatter.clone();
				scatter.settings.showMainnetsOnly = !scatter.settings.showMainnetsOnly;
				this[Actions.SET_SCATTER](scatter);
			},

			...mapActions([
				Actions.SET_SCATTER
			])
		},
		watch:{
			['newToken.blockchain'](){
				this.newToken.decimals = PluginRepository.plugin(this.newToken.blockchain).defaultDecimals();
				this.newToken.chainId = this.filteredNetworks[0].chainId;
			},
			['balanceFilters'](){
				clearTimeout(balanceFilterTimeout);
				balanceFilterTimeout = setTimeout(() => {
					const scatter = this.scatter.clone();
					scatter.settings.balanceFilters = this.balanceFilters;
					this[Actions.SET_SCATTER](scatter);
				}, 500);
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .fiat-currencies {
        .items {
            display:flex;
            flex-direction: row;
        }
    }

    .search {
        margin-left:-30px;
    }

</style>