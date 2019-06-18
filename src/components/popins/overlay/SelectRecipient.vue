<template>
	<section class="pop-over">
		<PopInHead title="Select Recipient" v-on:close="returnResult" />
		<section class="select-recipient">
			<section class="head">


				<section class="panel-switch">
					<figure class="button" :class="{'active':state === STATES.CONTACTS}" @click="switchState(STATES.CONTACTS)">
						Contacts
					</figure>
					<figure class="button" :class="{'active':state === STATES.ACCOUNTS}" @click="switchState(STATES.ACCOUNTS)">
						Accounts
					</figure>
				</section>
			</section>
			<section class="body">
				<KeysAndAccountList v-on:account="accountSelected" v-if="state === STATES.ACCOUNTS" />
				<Contacts v-on:recipient="returnResult" as-selector="1" v-if="state === STATES.CONTACTS" />
			</section>
		</section>
	</section>

</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import KeysAndAccountList from "../../misc/KeysAndAccountList";
	import Contacts from "../../../components/misc/Contacts";

	const STATES = {
		CONTACTS:'contacts',
		ACCOUNTS:'accounts',
	}

	export default {
		components: {Contacts, KeysAndAccountList},
		props:['popin'],
		data(){return {
			state:STATES.CONTACTS,
			STATES,
		}},
		computed:{
			...mapGetters([
				'accounts',
			]),
		},
		methods:{
			returnResult(recipient){
				this.popin.data.callback(recipient);
				this[Actions.RELEASE_POPUP](this.popin);
			},
			switchState(state){
				this.state = state;
			},
			accountSelected(account){
				if(!account) this.returnResult(null);
				this.returnResult(account.sendable());
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		}

	}
</script>

<style scoped lang="scss">
	@import "../../../styles/variables";

	.select-recipient {
		min-width:800px;

		.head {
			.panel-switch {
				margin-bottom:0;
			}
		}

		.body {
			height:calc(100vh - 130px - 60px - 40px);
		}

		.keys-and-accounts-list {
			height: calc(100vh - 230px);
			overflow-y:auto;
		}

		.blockchain-list-container {
			//max-height:calc(100vh - 130px);
		}
	}

</style>