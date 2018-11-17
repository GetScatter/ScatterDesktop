<template>
    <section>

        <section class="panel-switch">
            <figure class="button" :class="{'active':state === STATES.ADD_TOKEN}" @click="state = STATES.ADD_TOKEN">Add Token</figure>
            <figure class="button" :class="{'active':state === STATES.WHITELIST}" @click="state = STATES.WHITELIST">Added Tokens</figure>
            <figure class="button" :class="{'active':state === STATES.BLACKLIST}" @click="state = STATES.BLACKLIST">Filtered</figure>
        </section>
        <br>

        <section v-if="state === STATES.ADD_TOKEN">

            <cin placeholder="Name this token or leave empty to use it's symbol." label="Token Name" :text="newToken.name" v-on:changed="x => newToken.name = x" />
            <section class="split-inputs">
                <sel style="flex:1; margin-left:0;" label="Blockchain"
                     :selected="{value:newToken.blockchain}"
                     :options="blockchains"
                     :parser="x => blockchainName(x.value)"
                     v-on:changed="x => newToken.blockchain = x" />

                <cin style="flex:1; margin-bottom:0;"
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

        <section v-if="state === STATES.WHITELIST || state === STATES.BLACKLIST">

            <section class="disclaimer less-pad" v-if="state === STATES.WHITELIST">
                Added tokens will allow you to send them and fetch their balances.
                <p>You cannot remove system tokens for your networks.</p>
            </section>

            <section class="disclaimer less-pad" v-if="state === STATES.BLACKLIST">
                Filtered tokens will not be displayed.
                <p>You cannot filter out system tokens for your networks.</p>
            </section>

            <sel style="flex:2;" label="Filter Tokens by Blockchain"
                 :selected="blockchainName(blockchain)"
                 :options="[null].concat(blockchains)"
                 :parser="x => x ? blockchainName(x.value) : 'No Blockchain filter'"
                 v-on:changed="x => blockchain = x ? x.value : null" />

            <br><br>
            <label>Tokens List</label>
            <FlatSelect style="padding:0;"
                        v-if="state === STATES.WHITELIST"
                        unselectable="1"
                        :items="networkTokensList" />

            <FlatSelect style="padding:10px 0 20px 0;"
                        v-if="state === STATES.WHITELIST"
                        :items="tokensList"
                        icon="icon-cancel"
                        v-on:action="removeToken" />

            <FlatSelect style="padding:0 0 20px 0;"
                        v-if="state === STATES.BLACKLIST"
                        :items="blacklistTokensList"
                        icon="icon-cancel"
                        v-on:action="removeToken" />
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'

    import PluginRepository from '../../../plugins/PluginRepository';
    import {BlockchainsArray, Blockchains, blockchainName} from '../../../models/Blockchains';
    import FlatSelect from '../../reusable/FlatSelect';
    import Token from "../../../models/Token";
    import TokenService from "../../../services/TokenService";

    const formatter = list => list.map(x => ({
	    id:x.id,
	    title:`${x.name} (${x.symbol})`,
	    description:this.blockchain ? null : blockchainName(x.blockchain)
    }));

    const STATES = {
        ADD_TOKEN:'addToken',
        WHITELIST:'whitelist',
        BLACKLIST:'blacklist',
    };

    export default {
    	components:{
		    FlatSelect
        },
        data () {return {
        	state:STATES.WHITELIST,
	        STATES,

	        blockchain:null,
	        blockchains:BlockchainsArray,
            newToken:Token.placeholder(),
            addingToken:false,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'tokens',
                'networks',
                'networkTokens',
                'blacklistTokens',
            ]),
	        contractPlaceholder(){
		        return PluginRepository.plugin(this.newToken.blockchain).contractPlaceholder();
	        },
	        blacklistTokensList(){
	            if(!this.blockchain) return formatter(this.blacklistTokens);
	            return formatter(this.blacklistTokens
		            .filter(x => x.blockchain === this.blockchain))
            },
            networkTokensList(){
	            if(!this.blockchain) return formatter(this.networkTokens);
	            return formatter(this.networkTokens
		            .filter(x => x.blockchain === this.blockchain))
            },
            tokensList(){
            	if(!this.blockchain) return formatter(this.tokens);
                return formatter(this.tokens
                    .filter(x => x.blockchain === this.blockchain))

            }
        },
        methods:{
    		async addToken(blacklist = false){
    			if(await TokenService.addToken(this.newToken, blacklist)){
    				this.state = blacklist ? STATES.BLACKLIST : STATES.WHITELIST;
                }
            },
    		async removeToken(item){
    			const token = this.tokens.concat(this.networkTokens).concat(this.blacklistTokens).find(x => x.id === item.id);
			    await TokenService.removeToken(token);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../variables";


</style>