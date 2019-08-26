<template>
	<section class="pop-in">
		<section v-if="contact">
			<section class="head">
				<figure class="icon font icon-user-add"></figure>
				<figure class="title">Add New Contact</figure>
			</section>
			<EditContact :original="contact" v-on:updated="x => contact = x" brand-new="1" />


			<ActionBar :buttons-left="[{text:'Cancel', click:() => returnResult(false)}]" :buttons-right="[{text:'Save new contact', blue:true, click:() => saveContact()}]" />
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import '../../../styles/popins.scss';
	import EditContact from "../../misc/EditContact";
	import Contact from "@walletpack/core/models/Contact";
	import ContactService from "@walletpack/core/services/utility/ContactService";
	import * as UIActions from "../../../store/ui_actions";

	export default {
		components: {EditContact},
		props:['popin'],
		data () {return {
			contact:null,
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([

			]),
			blockchain(){
				return this.popin.data.props.blockchain;
			}
		},
		mounted(){
			const contact = Contact.placeholder();
			contact.blockchain = this.blockchain;
			this.contact = contact;
		},
		methods:{
			returnResult(){
				this.popin.data.callback(this.contact);
				this[UIActions.RELEASE_POPUP](this.popin);
			},
			async saveContact(){
				const added = await ContactService.addOrUpdate(this.contact);
				if(added) this.returnResult();
			},

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.test {
		background:$reverse-gradient;
	}

</style>