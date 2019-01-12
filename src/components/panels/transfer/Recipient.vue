<template>
	<section class="box dark clickable outlined">
		<section class="row" style="" @click="$emit('select','to')">
			<figure class="fill">{{locale(langKeys.GENERIC.OpenContacts)}}</figure>
			<figure class="chevron icon-down-open-big"></figure>
		</section>
		<section class="row input" v-if="!addingContact">
			<input :class="{'small':recipient && recipient.length > 12}" :placeholder="recipientPlaceholder" v-model="localRecipient" style="padding-right:20px;" />
			<btn v-if="!isContact" @click.native="addingContact = true;" v-tooltip="locale(langKeys.GENERIC.AddContact)" icon="icon-user-add" blue="1" style="width:auto; padding:0 8px;" />
		</section>
		<section class="row input" v-if="addingContact">
			<input :class="{'small':recipient && recipient.length > 12}"
			       :placeholder="locale(langKeys.GENERIC.ContactName)"
			       v-model="contactName" style="padding-right:20px;" />
			<btn @click.native="addingContact = false;" icon="icon-cancel" red="1" style="width:auto; padding:0 8px; margin-right:4px;" />
			<btn :disabled="!contactName.length" @click.native="addContact" icon="icon-check" blue="1" style="width:auto; padding:0 8px;" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import PluginRepository from "../../../plugins/PluginRepository";
	import {Blockchains} from "../../../models/Blockchains";
	import ContactService from "../../../services/ContactService";

	export default {
		props:['recipient', 'account'],
		data () {return {
			localRecipient:'',
			addingContact:false,
			contactName:'',
		}},
		computed:{
			...mapState([
				'scatter',
			]),
			...mapGetters([
				'accounts',
				'contacts',
			]),
			recipientPlaceholder(){
				return this.account.blockchain() === Blockchains.EOSIO
					? this.locale(this.langKeys.GENERIC.AccountName)
					: this.locale(this.langKeys.GENERIC.Address)
			},
			isContact(){
				if(!this.recipient) return true;
				return this.contacts.find(x => x.recipient.toLowerCase() === this.localRecipient.toLowerCase()) ||
					   this.accounts.find(x => x.sendable() === this.localRecipient.toLowerCase())
			},
		},
		created(){
			this.localRecipient = this.recipient;
		},
		methods:{
			async addContact(){
				if(!this.recipient.length) return;
				if(!this.contactName.length) return;
				if(await ContactService.add(this.recipient, this.contactName)){
					this.addingContact = false;
				}
			},
		},
		watch:{
			['recipient'](){
				this.localRecipient = this.recipient;
			},
			['localRecipient'](){
				this.$emit('change', this.localRecipient);
			}
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";
	@import "../../../styles/transfer";



</style>