<template>
	<section class="prompt pop-over">

		<figure class="title">{{title}}</figure>
		<figure class="description">{{description}}</figure>

		<Input v-if="inputField" v-bind="inputField" centered="1" :text="text" v-on:changed="x => text = x" />

		<section class="actions" :class="{'between':acceptDeny}">
			<Button red="1" v-if="acceptDeny" text="Deny" @click.native="returnResult(false)" />
			<Button blue="1" text="Okay" @click.native="returnResult(inputField ? text : true)" />
		</section>

	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import {BlockchainsArray, blockchainName} from '@walletpack/core/models/Blockchains';
	import * as UIActions from "../../../store/ui_actions";

	export default {
		props:['popin'],
		data(){return {
			text:'',
		}},
		computed:{
			title(){ return this.popin.data.props.title; },
			description(){ return this.popin.data.props.description; },
			acceptDeny(){ return this.popin.data.props.acceptDeny; },
			inputField(){ return this.popin.data.props.inputField; },
		},
		methods:{
			returnResult(value){
				this.popin.data.callback(value);
				this[UIActions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				UIActions.RELEASE_POPUP
			])
		}

	}
</script>

<style scoped lang="scss">
	@import "../../../styles/variables";

	.prompt {
		width:400px;
		padding:30px;
		display:flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.title {
			font-size: $large;
			font-weight: bold;
		}

		.description {
			margin-top:4px;
			font-size: $small;
		}

		.input {
			margin:30px 0 0 0;
		}

		.actions {
			margin-top:20px;
			display:flex;
			justify-content: flex-end;
			width:100%;

			&.between {
				justify-content: space-between;
			}
		}
	}

</style>