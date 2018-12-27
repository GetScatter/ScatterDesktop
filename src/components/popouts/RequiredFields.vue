<template>
	<section>
		<section class="key-val" v-if="personalFields.length">
			<figure>{{locale(langKeys.POPOUTS.REQ_FIELDS.PersonalInfo)}}</figure>
			<figure v-for="field in personalFields" class="key-val nested split-inputs">
				<figure>{{field}}</figure>
				<figure v-if="fieldValueFor(field, true).length">{{fieldValueFor(field)}}</figure>
				<cin red="1" v-else small="1"
				     :text="selectedIdentity.personal[field]"
				     v-on:changed="x => $emit('personalField', field, x)"
				     :placeholder="field" />
			</figure>
		</section>

		<section class="key-val" v-if="locationFields.length">
			<sel :selected="selectedLocation" label="Select a Location"
			     :options="selectedIdentity.locations"
			     :parser="location => location.name"
			     short="1"
			     v-on:changed="x => $emit('selectLocation', x)" />
			<br>
			<label>{{locale(langKeys.POPOUTS.REQ_FIELDS.LocationInfo)}}</label>
			<figure v-for="field in locationFields" class="key-val nested split-inputs">
				<figure>{{field}}</figure>
				<figure v-if="fieldValueFor(field, true).length">{{fieldValueFor(field)}}</figure>
				<cin red="1" v-else small="1"
				     :text="clonedLocation[field]"
				     v-on:changed="x => $emit('locationField', field, x)"
				     :placeholder="field" />
			</figure>
			<br>
			<br>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import {IdentityRequiredFields} from "../../models/Identity";

	export default {
		props:['fields', 'identity', 'selectedIdentity', 'selectedLocation', 'clonedLocation'],

		data(){return {

		}},
		computed:{

			personalFields(){
				return this.fields.personal;
			},
			locationFields(){
				return this.fields.location;
			},
		},
		methods:{

			fieldValueFor(field, useUnclonedIdentity = false){
				return useUnclonedIdentity
					? this.identity.getPropertyValueByName(field, this.selectedLocation)
					: this.selectedIdentity.getPropertyValueByName(field, this.clonedLocation);
			},
		}

	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";


</style>