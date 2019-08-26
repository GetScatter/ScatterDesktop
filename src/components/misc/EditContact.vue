<template>
	<section>
		<section class="edit-contact" v-if="contact">

			<section>
				<Input label="Name"
				       placeholder="Add a memorable name"
				       :text="contact.name"
				       v-on:changed="x => contact.name = x" />

				<Input :error="recipientError" label="Account / Address"
				       placeholder="..."
				       :text="contact.recipient"
				       v-on:changed="x => contact.recipient = x" />

				<br>

				<section style="text-align:right" v-if="!brandNew">
					<Button text="Update contact details" blue="1" @click.native="$emit('save')" />
				</section>
			</section>


		</section>
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import Contact from "@walletpack/core/models/Contact";
	import ContactService from "@walletpack/core/services/utility/ContactService";

	export default {
		props:['original', 'brandNew'],
		data(){return {
			contact:null
		}},
		mounted(){
			this.contact = this.original ? this.original.clone() : Contact.placeholder();
		},
		computed:{
			...mapGetters([
				'contacts',
			]),
			isNew(){
				if(!this.contact) return false;
				if(this.brandNew) return true;
				return !this.contacts.find(x => x.id === this.contact.id);
			},
			recipientError(){
				if(this.contact.recipient.trim().length === 0) return null;
				if(!ContactService.validate(this.contact.blockchain, this.contact.recipient)){
					return `Are you sure this is correct?`
				}
				return null;
			}
		},
		watch:{
			['contact'](){
				this.$emit('updated', this.contact);
			},
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";


	.edit-contact {
		padding:0 20px 20px;
		border-radius:$radius;
		margin-top:20px;
		width:100%;
		max-width:500px;
		min-width:400px;

		.select {
			text-align:left;
		}

		.custom-token-info {
			display:flex;
			flex-direction: row;
			align-items: center;
			margin-bottom:20px;
		}
	}


</style>