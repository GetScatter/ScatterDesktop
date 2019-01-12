<template>
	<section class="select-account">
		<back-bar v-on:back="returnResult(null)" style="border-bottom:0;" />
		<section class="full-panel inner">
			<section class="select-bar">
				<section class="selector">
					<figure class="option" v-for="s in shownStates"
					        :class="{'selected':state === s}"
					        @click="state = s">
						{{stateText(s)}}
					</figure>
				</section>
			</section>

			<section class="limit">
				<section class="filters">
					<SearchBar style="flex:2; margin-left:-30px;" short="1"
					           :placeholder="locale(langKeys.GENERIC.Search)"
					           v-on:terms="x => searchTerms = x" />

					<sel :options="[null].concat(fullNetworks)" style="margin-bottom:0; flex:1;" v-if="state === STATES.MINE"
					     :selected="networkFilter"
					     v-on:changed="x => networkFilter = x"
					     :parser="x => x ? x.name : locale(langKeys.GENERIC.AllNetworks)" />
				</section>

				<section class="panel" v-if="state === STATES.MINE">

					<FlatList style="padding:0;"
					          :items="myAccounts"
					          :selected="recipient"
					          selected-icon="icon-check"
					          v-on:selected="x => returnResult(x.id, true)" />
				</section>

				<section class="panel" v-if="state === STATES.CONTACTS">

					<FlatList style="padding:0;"
					          :items="filteredContacts"
					          :selected="recipient"
					          selected-icon="icon-check"
					          icon="icon-user-delete"
					          v-on:action="removeContact"
					          v-on:selected="x => returnResult(x.id)" />
				</section>
			</section>

		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import SearchBar from '../../reusable/SearchBar';
	import FlatList from '../../reusable/FlatList';
	import PluginRepository from "../../../plugins/PluginRepository";
	import ContactService from "../../../services/ContactService";

	const STATES = {
		MINE:'mine',
		CONTACTS:'contacts',
	}

	export default {
		props:['popin'],
		components:{
			SearchBar,
			FlatList
		},
		data () {return {
			STATES,
			state:STATES.MINE,
			searchTerms:'',
			networkFilter:null,

			recipient:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'networks',
				'accounts',
				'contacts',
			]),
			fullNetworks(){
				return this.networks.filter(net => {
					const accounts = this.accounts.filter(acc => acc.networkUnique === net.unique());
					return accounts.some(account => {
						return account.tokenCount() > 0 || account.tokenCount(account.network().systemToken()) > 0;
					})
				})
			},
			account(){
				return this.popin.data.props.account;
			},
			accountsOnly(){
				return this.popin.data.props.accountsOnly;
			},
			blockchain(){
				return this.popin.data.props.blockchain;
			},
			hideWatch(){
				return this.popin.data.props.hideWatch;
			},
			shownStates(){
				if(this.accountsOnly || !this.filteredContacts.length) return [STATES.MINE];
				else return STATES;
			},
			myAccounts(){
				const otherAccounts = this.accounts
					.filter(x => !this.hideWatch ? true : x.authority !== 'watch')
					.filter(x => !this.blockchain ? true : this.blockchain === x.blockchain())
					.filter(x => !this.account ? true : x.sendable() !== this.account.sendable())
					.filter(x => !this.account ? true : x.networkUnique === this.account.networkUnique)
					.filter(x => !this.networkFilter ? true : x.networkUnique === this.networkFilter.unique())
					.reduce((acc,account) => {
						if(!acc.find(x => x.sendable() === account.sendable())) acc.push(account);
						return acc;
					}, [])
					.sort((a,b) => b.totalFiatBalance() - a.totalFiatBalance());

				return otherAccounts.map(x => ({
					id:x.unique(),
					sub:`${x.network().name} - ${x.keypair().name}`,
					title:x.sendable(),
					description:`${x.tokenBalance(x.network().systemToken())} ${x.network().systemToken().symbol}`
				})).filter(x => JSON.stringify(x).indexOf(this.searchTerms) > -1);
			},
			formattedContacts(){
				const contacts = this.contacts.filter(x => {
					if(!this.blockchain) return true;
					const plugin = PluginRepository.plugin(this.blockchain);
					if(!plugin) return true;
					return plugin.isValidRecipient(x.recipient);
				});

				return contacts.map(x => ({
					id:x.recipient,
					title:x.name,
					description:x.recipient,
				}));
			},
			filteredContacts(){
				const terms = this.searchTerms.trim().toLowerCase();
				return this.formattedContacts.filter(x => {
					return x.id.toLowerCase().indexOf(terms) > -1
						|| x.title.toLowerCase().indexOf(terms) > -1
				})
			},
		},
		created(){

		},
		methods:{
			returnResult(id, isAccount = false){
				if(!id) this.popin.data.callback(null);
				else {
					if(this.accountsOnly){
						id = this.accounts.find(x => x.unique() === id);
						this.popin.data.callback(id);
					} else {
						if(isAccount) id = this.accounts.find(x => x.unique() === id).sendable();
						this.popin.data.callback(id.trim());
					}
				}

				this[Actions.RELEASE_POPUP](this.popin);
			},
			stateText(s){
				switch(s){
					case STATES.MINE: return this.locale(this.langKeys.GENERIC.MyAccounts);
					case STATES.CONTACTS: return this.locale(this.langKeys.GENERIC.Contacts);
				}
			},
			async removeContact(item){
				const contact = this.contacts.find(x => x.name === item.title);
				await ContactService.remove(contact);
			},
			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.limit {
		max-width:1024px;
		width:100%;
		margin:0 auto;
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.panel-container {
		overflow: auto;
		height: $win-height;
		position: relative;
	}

	.bottom-fixed {
		position:absolute;
		bottom:30px;
		left:30px;
		right:30px;

		> button {
			height:60px; max-width:none; padding:0 20px; margin-top:10px; font-size: 18px;
		}
	}

	.select-bar {
		padding:40px 20px 0;
		background:$blue-grad;
		display:flex;
		flex-direction: column;
		justify-content: center;

		h3 {
			color:#fff;
			font-weight: 300;
			text-align: center;
		}

		.selector {
			display:flex;
			color:rgba(255,255,255,0.7);
			margin:10px auto 0;

			.option {
				cursor: pointer;
				margin:0 30px;
				position: relative;
				height:50px;

				&.selected {
					color:#fff;

					&:after {
						content:'';
						display:block;
						position:absolute;
						left:0;
						right:0;
						bottom:0;
						height:5px;
						background:rgba(255,255,255,0.7);
					}
				}
			}
		}
	}

	.filters {
		padding:30px;
		display:flex;
		padding-bottom:10px;
		border-bottom:1px solid rgba(255,255,255,0.1);
	}

	.panel {
		padding:30px;
		width:100%;
		flex:1;
		height:0;
		overflow-y:auto;

		&.direct {
			display:flex; flex-direction: column; max-height:500px; position: relative;
		}

		img {
			display:block;
			margin:20px auto;
		}

		p {
			text-align:center;
			max-width:600px;
			margin:0 auto;
		}
	}

	.limit-small {
		max-width:600px;
		margin:0 auto;
	}


</style>
