<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="full-panel inner with-action center-fold limited">
			<section>
				<section class="head">
					<figure class="icon icon-flow-tree"></figure>
					<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Title)}}</figure>
					<br>
					<section class="disclaimer less-pad">
						{{locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Desc)}}
						<p v-if="account.authorities().length > 1">{{locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.SubDesc)}}</p>
					</section>

					<section class="split-inputs" v-if="hasPermission('owner')">
						<sel :label="locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.KeysLabel)"
						     v-if="otherKeys.length"
						     :options="otherKeys"
						     :parser="x => x.name"
						     :subparser="x => publicKeyForKeypair(x)"
						     v-on:changed="x => ownerKey = publicKeyForKeypair(x)"></sel>
						<cin :text="ownerKey"
						     v-on:changed="x => ownerKey = x"
						     :placeholder="locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.KeyPlaceholder)"
						     :label="locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.OwnerLabel)"
						     :dynamic-button="isValidPermission(ownerKey) ? 'icon-check' : null" />
					</section>

					<section class="split-inputs" v-if="hasPermission('active')">
						<sel :label="locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.KeysLabel)"
						     v-if="otherKeys.length"
						     :options="otherKeys"
						     :parser="x => x.name"
						     :subparser="x => publicKeyForKeypair(x)"
						     v-on:changed="x => activeKey = publicKeyForKeypair(x)"></sel>
						<cin :text="activeKey"
						     v-on:changed="x => activeKey = x"
							 :placeholder="locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.KeyPlaceholder)"
						     :label="locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.ActiveLabel)"
						     :dynamic-button="isValidPermission(activeKey) ? 'icon-check' : null" />
					</section>

				</section>
			</section>

			<section class="action-bar short bottom centered">
				<btn :disabled="!isValidPermission(ownerKey) && !isValidPermission(activeKey)"
					 :text="locale(langKeys.POPINS.FULLSCREEN.EOS.CHANGE_PERMS.Button)"
					 blue="1" v-on:clicked="changePermissions" />
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import PasswordService from "../../../services/PasswordService";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";
	import {Blockchains} from "../../../models/Blockchains";
	import PluginRepository from "../../../plugins/PluginRepository";

	export default {
		props:['popin'],
		data () {return {
			ownerKey:'',
			activeKey:'',
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
				return this.keypairs
					.filter(x => x.publicKeys.some(key => key.blockchain === Blockchains.EOSIO))
			},
		},
		methods:{
			returnResult(result){
				this.popin.data.callback(result);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			publicKeyForKeypair(keypair){
				return keypair.publicKeys.find(key => key.blockchain === Blockchains.EOSIO).key;
			},
			isValidPermission(keyOrAccountName){
				const plugin = PluginRepository.plugin(Blockchains.EOSIO);
				return plugin.validPublicKey(keyOrAccountName) || plugin.isValidRecipient(keyOrAccountName);
			},
			changePermissions(){
				this.returnResult({
					owner:this.ownerKey,
					active:this.activeKey,
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


	.split-inputs {
		max-width:600px;
		width:100%;
		margin-bottom:20px;
		text-align:left;

		> section {
			margin-bottom:0;

			&:first-child {
				flex:0.5;
			}
			&:last-child {
				flex:1;
			}
		}
	}

</style>
