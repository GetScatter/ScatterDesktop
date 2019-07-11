<template>
	<section class="required-fields">

		<section class="fields-title">
			Required Identity Fields
		</section>

		<section>
			<label>Personal information:</label>
			<figure class="text">
				{{identityRequirements}}
			</figure>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'

	export default {
		props:['fields', 'identity', 'selectedIdentity', 'selectedLocation', 'clonedLocation'],

		data(){return {

		}},
		computed:{

			identityRequirements() {
				return this.personalFields.concat(this.locationFields).join(', ');
			},

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

	.fields-title {
		margin:-20px -30px 0;
		padding:20px 30px;
		background:$blue-gradient;
		color:$white;
		font-size: 18px;

		margin-bottom:20px;
	}

	.required-fields {
		padding:20px 0 0;
	}

</style>