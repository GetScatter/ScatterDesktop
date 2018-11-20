<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="panel-container limited">
			<section class="head">
				<figure class="icon icon-trash"></figure>
				<figure class="title">Unlink Accounts</figure>
				<p>{{account.sendable()}}</p>

				<br>
				<section class="disclaimer less-pad red">
					Removing a linked account also removes all of it's application permissions

					<p v-if="authorities.length">
						Select all the authorities you want to remove.
					</p>
				</section>
			</section>


			<section class="list">
				<FlatList label="Authorities" select-blue="1" :selected="selectedAuthorities" :items="authorities" v-on:selected="addOrRemoveAuthority" />
			</section>



		</section>
		<section class="action-bar short bottom centered">
			<btn :disabled="authorities.length && !selectedAuthorities.length" text="Confirm" blue="1" v-on:clicked="unlinkAccount" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../fullscreen-popins.scss';
	import {Blockchains} from "../../../models/Blockchains";
	import FlatList from '../../reusable/FlatList';
	import AccountService from "../../../services/AccountService";

	export default {
		props:['popin'],
		components:{
			FlatList
		},
		data () {return {
			selectedAuthorities:[],
		}},
		mounted(){

		},
		computed:{
			...mapState([

			]),
			...mapGetters([
				'keypairs',
				'accounts',
			]),
			account(){
				return this.accounts.find(x => x.unique() === this.popin.data.props.account.unique());
			},
			authorities(){
				if(!this.account.authority.length) return [];
				return this.accounts.filter(x => x.identifiable() === this.account.identifiable() && x.keypairUnique === this.account.keypairUnique)
					.map(x => ({
						id:x.authority,
						title:x.authority,
					}))
			}
		},
		methods:{
			returnResult(proxy){
				this.popin.data.callback(proxy);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			addOrRemoveAuthority(item){
				const removing = !!this.selectedAuthorities.find(x => x === item.id);
				this.selectedAuthorities = this.selectedAuthorities.filter(x => x !== item.id);
				if(!removing) this.selectedAuthorities.push(item.id);
			},
			async unlinkAccount(){
				let accounts = [];
				if(this.authorities.length){
					accounts = this.accounts.filter(account => {
						return account.identifiable() === this.account.identifiable()
							&& account.keypairUnique === this.account.keypairUnique
							&& this.selectedAuthorities.includes(account.authority);
					})
				} else {
					accounts = [this.account];
				}

				console.log('accounts', accounts);

				await AccountService.removeAccounts(accounts);
				this.returnResult(true);
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../variables";

	.panel-container {
		overflow: auto;
		height: calc(100vh - 250px);
	}

	.auto-vote {
		max-width:600px;
		margin:0 auto;
		display:flex;

		.switch {

		}

		.details {
			padding-left:20px;
		}
	}

	.list {
		max-width:700px;
		width:100%;
		text-align:left;

	}

</style>
