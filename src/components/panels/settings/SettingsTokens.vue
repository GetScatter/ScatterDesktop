<template>
    <section>

        <section class="panel-switch">
            <figure class="button" :class="{'active':state === STATES.ADD_TOKEN}" @click="state = STATES.ADD_TOKEN">Add Token</figure>
            <figure class="button" :class="{'active':state === STATES.WHITELIST}" @click="state = STATES.WHITELIST">Tokens</figure>
            <figure class="button" :class="{'active':state === STATES.BLACKLIST}" @click="state = STATES.BLACKLIST">Filtered</figure>
            <figure class="button" :class="{'active':state === STATES.SETTINGS}" @click="state = STATES.SETTINGS">Settings</figure>
        </section>
        <br>


        <!--------------------------->
        <!------   ADD TOKEN   ------>
        <!--------------------------->
        <section v-if="state === STATES.ADD_TOKEN">

            <section class="disclaimer less-pad">
                Adding tokens will allow you to send them and fetch their balances.
            </section>

            <cin placeholder="Name this token or leave empty to use it's symbol." label="Token Name" :text="newToken.name" v-on:changed="x => newToken.name = x" />
            <section class="split-inputs">
                <sel style="flex:1; margin-left:0;" label="Blockchain"
                     :selected="{value:newToken.blockchain}"
                     :options="blockchains"
                     :parser="x => blockchainName(x.value)"
                     v-on:changed="x => newToken.blockchain = x.value" />

                <cin style="flex:1; margin-bottom:0;"
                     v-if="newToken.needsContract()"
                     :placeholder="contractPlaceholder"
                     label="Contract"
                     :text="newToken.contract"
                     v-on:changed="x => newToken.contract = x" />
            </section>
            <br>
            <section class="split-inputs">
                <cin placeholder="XXX" label="Symbol" :text="newToken.symbol" v-on:changed="x => newToken.symbol = x" />
                <cin placeholder="4" type="number" label="Decimals" :text="newToken.decimals" v-on:changed="x => newToken.decimals = x" />
            </section>

            <section class="split-inputs">
                <btn style="max-width:100%;" text="Whitelist Token" v-on:clicked="addToken(false)" />
                <btn style="max-width:100%;" red="1" text="Blacklist Token" v-on:clicked="addToken(true)" />
            </section>
        </section>




        <!--------------------------->
        <!------   SETTINGS   ------->
        <!--------------------------->
        <section v-if="state === STATES.SETTINGS">

            <section class="action-box top-pad">
                <label>Main Balance Display</label>
                <p>You can set whether you want to see balances for all networks in the main dashboard, or just balances for mainnets.</p>

                <btn v-on:clicked="toggleMainnetsOnly" :red="mainnetTokensOnly" :text="mainnetTokensOnly ? 'Show all networks' : 'Show only Mainnets'" />
            </section>

            <section class="action-box top-pad">
                <label>Filter Small Balances</label>
                <p>If you want to always filter out tokens with small balances you can set a modifier here.</p>
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

            <sel style="flex:2;" label="Filter Tokens by Blockchain"
                 :selected="blockchainName(blockchain)"
                 :options="[null].concat(blockchains)"
                 :parser="x => x ? blockchainName(x.value) : 'No Blockchain Filter'"
                 v-on:changed="x => blockchain = x ? x.value : null" />

            <SearchBar class="search" placeholder="Search Tokens" v-on:terms="x => searchTerms = x" />

            <br>
            <section v-if="state === STATES.WHITELIST">
                <section class="disclaimer less-pad" v-if="!searchTerms.length">
                    Select any token or currency to make it your main display type.
                </section>

                <section v-if="blockchain === null && !searchTerms.length">
                    <FlatList as-rows="1" style="padding:0;"
                                :selected="selectedDisplayToken"
                                label="Show as fiat currency"
                                v-on:selected="selectDisplayToken"
                                small="1"
                                :items="currencyList" />
                    <br>
                    <br>
                </section>

                <section v-if="networkTokensList.length">
                    <FlatList style="padding:0;"
                                label="System Tokens"
                                :selected="selectedDisplayToken"
                                v-on:selected="selectDisplayToken"
                                :items="networkTokensList" />
                    <br>
                    <br>
                </section>

                <FlatList style="padding:0;" label="Custom Tokens"
                            :items="tokensList"
                            icon="icon-cancel"
                            v-if="tokensList.length"
                            :selected="selectedDisplayToken"
                            v-on:selected="selectDisplayToken"
                            v-on:action="removeToken" />
            </section>

            <section v-if="state === STATES.BLACKLIST">

                <section class="disclaimer less-pad" v-if="!searchTerms.length">
                    Filtered tokens will not be displayed.
                    <p>You cannot filter out system tokens for your networks.</p>
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
    	const description = `${blockchainName(token.blockchain)} ${fiatPrice ? ' - ' : ''}${fiatPrice}`;
    	return {
		    id:token.unique(),
		    title:`${token.name} (${token.symbol})`,
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
            	const tokens = this.filterTokensByTerms(this.networkTokens);
	            if(!this.blockchain) return formatter(tokens);
	            return formatter(tokens
		            .filter(x => x.blockchain === this.blockchain))
            },
            tokensList(){
	            const tokens = this.filterTokensByTerms(this.tokens);
            	if(!this.blockchain) return formatter(tokens);
                return formatter(tokens
                    .filter(x => x.blockchain === this.blockchain))
            }
        },
        methods:{
    		filterTokensByTerms(tokensList){
    		    return tokensList
                    .filter(x => {
                    	return x.symbol.toLowerCase().match(this.terms)
                            || x.name.toLowerCase().match(this.terms)
                            || x.blockchain.toLowerCase().match(this.terms)
                            || this.blockchainName(x.blockchain).toLowerCase().match(this.terms)
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

	        	if(!token.id || asFiat) return TokenService.toggleDisplayToken(null);
	        	TokenService.toggleDisplayToken(token.id);
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
    @import "../../../variables";

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