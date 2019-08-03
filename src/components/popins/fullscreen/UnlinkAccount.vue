<template>
	<section class="pop-in">
		<section v-if="account">
			<section>
				<section class="head">
					<figure class="icon font icon-trash"></figure>
					<figure class="subtitle">{{account.sendable()}}</figure>
					<figure class="title">Unlinking Account</figure>

					<section class="disclaimer" style="margin-top:20px;">
						<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.UNLINK_ACCOUNT.Desc)}}</figure>
						<figure class="description">This will NOT remove the account from the blockchain, only Scatter.</figure>
					</section>
				</section>

			</section>

			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:locale(langKeys.GENERIC.Confirm), red:true, click:() => unlinkAccount()}]" />
		</section>


	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import AccountService from "../../../services/blockchain/AccountService";

	export default {
		props:['popin'],
		data () {return {

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
		},
		methods:{
			returnResult(removed){
				this.popin.data.callback(removed);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			async unlinkAccount(){
				await AccountService.removeAccounts(this.account.authorities());
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