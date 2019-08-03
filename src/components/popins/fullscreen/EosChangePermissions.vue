<template>
	<section class="pop-in">
		<section>
			<section>
				<section class="head">
					<figure class="icon font icon-flow-tree"></figure>
					<figure class="subtitle">{{account.sendable()}}</figure>
					<figure class="title">Changing Account Keys</figure>

					<section class="disclaimer">
						<figure class="title">This can be dangerous!</figure>
						<figure class="description">You are about to change the keys that control this account. Make sure you know what you are doing.</figure>
					</section>

					<section class="authorities">
						<section class="authority" v-if="hasPermission('owner')">
							<label>Owner / Master Key</label>
							<Select v-if="otherKeys.length" bordered="1"
							        :options="otherKeys"
							        :selected="ownerKey ? ownerKey.name : ''"
							        :parser="x => x.name"
							        truncate="1"
							        :subparser="x => publicKeyForKeypair(x)"
							        v-on:selected="x => ownerKey = x" />
						</section>

						<section class="authority" v-if="hasPermission('active')">
							<label>Active / Daily Key</label>
							<Select v-if="otherKeys.length" bordered="1"
							        :options="otherKeys"
							        :selected="activeKey ? activeKey.name : ''"
							        :parser="x => x.name"
							        truncate="1"
							        :subparser="x => publicKeyForKeypair(x)"
							        v-on:selected="x => activeKey = x" />
						</section>
					</section>

				</section>
			</section>

			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:'Confirm', red:true, click:() => changePermissions()}]" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import PasswordService from "../../../services/secure/PasswordService";
	import PopupService from "../../../services/utility/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import {Blockchains} from "../../../models/Blockchains";
	import PluginRepository from "../../../plugins/PluginRepository";

	export default {
		props:['popin'],
		data () {return {
			ownerKey:null,
			activeKey:null,
		}},
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
			otherKeys(){
				return [{name:`Don't Change`}].concat(this.keypairs
					.filter(x => x.publicKeys.some(key => key.blockchain === Blockchains.EOSIO)))
			},
		},
		methods:{
			returnResult(result){
				this.popin.data.callback(result);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			changePermissions(){
				this.returnResult({
					owner:this.publicKeyForKeypair(this.ownerKey),
					active:this.publicKeyForKeypair(this.activeKey),
				})
			},
			hasPermission(type){
				return !!this.account.authorities().find(x => x.authority === type || x.authority === 'owner');
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";


	.disclaimer {
		margin-top:20px !important;
		margin-bottom:30px !important;
	}

	.authorities {
		margin-top:10px;
		max-width:500px;
		min-width:500px;
		display:flex;
		justify-content: space-between;

		.authority {
			flex:1;
			margin:0 5px 20px;
			display:inline-block;

			label {
				display:block;
				margin-bottom:5px;
				font-size: $medium;
				font-weight: bold;
				color:$silver;

			}
		}
	}


</style>