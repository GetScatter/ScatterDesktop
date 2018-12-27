<template>
    <section>
        <back-bar v-on:back="back" />

        <section class="full-panel center-fold inner">

            <section class="disclaimer">
                <label>Select an Account</label>
                <sel :options="recipientAccounts" style="width:420px;"
                     :selected="account"
                     :parser="x => x.sendable()"
                     :subparser="x => `${x.network().name} - ${x.keypair().name}`"
                     v-on:changed="x => account = x"></sel>
            </section>

            <!-- DETAILS -->
            <section v-if="account">

                <figure class="details">
                    <figure class="title">You can send any type of {{blockchainName(account.blockchain())}} tokens to</figure>
                </figure>
                <cin style="width:500px; margin-top:10px; margin-bottom:10px;" disabled="1" big="1"
                     :text="account.sendable()" copy="1" />
                <section class="details">
                    <p><b>{{account.network().name}}</b></p>
                </section>
            </section>

        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import SearchBar from '../components/reusable/SearchBar';
    import FlatList from '../components/reusable/FlatList';

    export default {
    	components:{
		    SearchBar,
            FlatList,
        },
        data () {return {
            searchTerms:'',
            account:null,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'accounts',
            ]),
	        recipientAccounts(){
		        const reducer = accs => accs.reduce((acc,x) => {
			        if(!acc.find(y => `${y.networkUnique}${y.sendable()}` === `${x.networkUnique}${x.sendable()}`)) acc.push(x);
			        return acc;
		        }, []);

		        const terms = this.searchTerms.trim().toLowerCase();

		        return reducer(this.accounts)
			        .filter(x => {
				        return x.blockchain().toLowerCase().indexOf(terms) > -1
					        || x.sendable().toLowerCase().indexOf(terms) > -1
					        || x.keypair().name.toLowerCase().indexOf(terms) > -1
			        })
	        },

        },
        created(){
            this.account = this.recipientAccounts[0];
        },
        methods:{
	        back(){
	        	this.$router.back();
            },
	        selectAccount(item){
	        	this.account = this.accounts.find(x => x.unique() === item.id);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";


</style>
