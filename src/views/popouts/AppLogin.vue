<template>
    <section>
        <PopOutHead :origin="payload.origin" v-on:closed="returnResult" action="log in" />

        <section class="popout-list">
            <FullWidthRow :items="validAccounts" popout="1" />
        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import PopOutHead from '../../components/reusable/PopOutHead';
    import FullWidthRow from '../../components/reusable/FullWidthRow';
    import {IdentityRequiredFields} from "../../models/Identity";
    import Network from "../../models/Network";

    export default {
	    components:{
		    PopOutHead,
		    FullWidthRow
	    },
        data () {return {
	        selectedAccounts:[],
	        searchTerms:'',
        }},
        computed: {
	        ...mapState([
		        'scatter'
	        ]),
	        ...mapGetters([
		        'identity',
		        'identities',
		        'accounts',
		        'networks',
	        ]),
	        validAccounts() {
		        const neededBlockchains = this.accountRequirements.map(x => x.blockchain.toLowerCase());
		        const neededNetworks = this.accountRequirements.map(x => Network.fromJson(x).unique());
		        const alreadySelectedUniques = this.selectedAccounts.map(x => x.unique());
		        return this.accounts
			        .filter(x => neededNetworks.includes(x.networkUnique))
			        .filter(x => neededBlockchains.includes(x.blockchain().toLowerCase()))
			        .filter(x => !alreadySelectedUniques.includes(x.unique()))
			        .filter(id => JSON.stringify(id).toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1)
                    .map(account => ({
                        icon:'',
                    	title:account.formatted(),
                        description:`${this.blockchainName(account.blockchain())} - ${account.network().name}`,
                        actions:[{
                        	name:'Go!',
                            handler:() => this.selectAccount(account)
                        }]
                    }))
	        },
	        isValidIdentity() {
		        return this.identity.hasRequiredFields(this.fields);
	        },
	        fields() {
		        return IdentityRequiredFields.fromJson(this.payload.fields);
	        },
	        identityRequirements() {
		        return this.fields.personal.concat(this.fields.location).join(', ');
	        },
	        accountRequirements() {
		        return this.fields.accounts || [];
	        },
	        printableAccountRequirements() {
		        return this.accountRequirements.map(x => this.networks.find(y => y.chainId === x.chainId).name).join(' / ')
	        },
        },
        created(){
            console.log('validAccounts', this.validAccounts)
        },
        methods: {
	        returnResult(result){
		        this.$emit('returned', result);
	        },
	        selectAccount(account){
		        this.selectedAccounts.push(account);
		        if(this.accountRequirements.length > this.selectedAccounts.length)
			        return;

		        this.returnResult({identity:this.identity, accounts:this.selectedAccounts});
	        },

        },
        props:['payload', 'pluginOrigin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../variables";

</style>
