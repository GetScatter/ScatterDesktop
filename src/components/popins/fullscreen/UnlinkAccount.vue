<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section v-if="account">
			<section class="panel-container limited">
				<section class="head">
					<figure class="icon icon-trash"></figure>
					<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.UNLINK_ACCOUNT.Title)}}</figure>
					<p>{{account.sendable()}}</p>

					<br>
					<section class="disclaimer less-pad red">
						{{locale(langKeys.POPINS.FULLSCREEN.UNLINK_ACCOUNT.Desc)}}

						<p v-if="authorities.length">
							{{locale(langKeys.POPINS.FULLSCREEN.UNLINK_ACCOUNT.SubDesc)}}
						</p>
					</section>
				</section>


				<section class="list">
					<FlatList :label="locale(langKeys.POPINS.FULLSCREEN.UNLINK_ACCOUNT.AuthoritiesLabel)"
					          select-blue="1"
					          :selected="selectedAuthorities"
					          :items="authorities"
					          v-on:selected="addOrRemoveAuthority" />
				</section>
			</section>

			<section class="action-bar short bottom centered">
				<btn :disabled="authorities.length > 1 && !selectedAuthorities.length"
				     :text="locale(langKeys.GENERIC.Confirm)" blue="1"
				     v-on:clicked="unlinkAccount" />
			</section>
		</section>

	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
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
			if(this.authorities.length <= 1) this.authorities.map(this.addOrRemoveAuthority);
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
				return this.account.authorities()
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
	@import "../../../styles/variables";

	.panel-container {
		overflow: auto;
		height: calc(100vh - 240px);
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
		margin:0 auto;
		width:100%;
		text-align:left;

	}

</style>
