<template>
	<section>
		<back-bar v-on:back="returnResult(null)" />
		<section class="full-panel inner with-action center-fold limited">
			<section>
				<section class="head">
					<figure class="icon icon-flow-tree"></figure>
					<figure class="title">Change Account Permissions</figure>
					<br>
					<section class="disclaimer less-pad">
						Changing your account's permissions means changing the keys that power the account.
						<p>You can leave either field blank to keep the existing permission.</p>
					</section>

					<section class="split-inputs">
						<sel label="Imported Keys"
						     v-if="otherKeys.length"
						     :options="otherKeys"
						     :parser="x => x.name"
						     :subparser="x => publicKeyForKeypair(x)"
						     v-on:changed="x => ownerKey = publicKeyForKeypair(x)"></sel>
						<cin :text="ownerKey"
						     v-on:changed="x => ownerKey = x"
						     placeholder="Enter a public key or account name"
						     label="Owner"
						     :dynamic-button="isValidPermission(ownerKey) ? 'icon-check' : null" />
					</section>

					<section class="split-inputs">
						<sel label="Imported Keys"
						     v-if="otherKeys.length"
						     :options="otherKeys"
						     :parser="x => x.name"
						     :subparser="x => publicKeyForKeypair(x)"
						     v-on:changed="x => activeKey = publicKeyForKeypair(x)"></sel>
						<cin :text="activeKey"
						     v-on:changed="x => activeKey = x"
						     placeholder="Enter a public key or account name"
						     label="Active"
						     :dynamic-button="isValidPermission(activeKey) ? 'icon-check' : null" />
					</section>

				</section>
			</section>

			<section class="action-bar short bottom centered">
				<btn :disabled="!isValidPermission(ownerKey) && !isValidPermission(activeKey)" text="Change Permissions" blue="1" v-on:clicked="changePermissions" />
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../fullscreen-popins.scss';
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
			}
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

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../variables";


	.split-inputs {
		max-width:500px;
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
