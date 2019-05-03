<template>
	<section class="pop-in">
		<section>
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
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import EditContact from "../../misc/EditContact";
	import Contact from "../../../models/Contact";
	import ContactService from "../../../services/utility/ContactService";

	export default {
		components: {EditContact},
		props:['popin'],
		data () {return {
			contact:Contact.placeholder(),
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([

			]),
		},
		methods:{
			returnResult(){
				this.popin.data.callback(this.contact);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			async saveContact(){
				this.contact.blockchain = this.popin.data.props.blockchain;
				const added = await ContactService.addOrUpdate(this.contact);
				if(added) this.returnResult();
			},

			...mapActions([
				Actions.RELEASE_POPUP
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