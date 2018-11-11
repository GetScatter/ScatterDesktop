<template>
	<section>
		<!-- MAIN KEYPAIR DASHBOARD -->
		<section class="panel-container limited">
			<cin :big="scrollerAtTop"
			     :error="nameError"
			     :label="locale(langKeys.KEYPAIR.NameLabel)"
			     :placeholder="locale(langKeys.KEYPAIR.NamePlaceholder)"
			     :text="keypair.name"
			     v-on:changed="x => keypair.name = x" />

			<section class="dash-switch" :class="{'short':!scrollerAtTop}">
				<figure class="button" :class="{'active':dashState === DASH_STATES.ACCOUNTS}" @click="dashState = DASH_STATES.ACCOUNTS">Accounts</figure>
				<figure class="button" :class="{'active':dashState === DASH_STATES.PUBLIC_KEYS}" @click="dashState = DASH_STATES.PUBLIC_KEYS">Keys and Blockchains</figure>
			</section>

			<!-- ACCOUNTS -->
			<section class="list-container" key="accounts" v-if="dashState === DASH_STATES.ACCOUNTS">
				<!-- Accounts Searchbar -->
				<SearchBar :short="!scrollerAtTop"
				           class="search" :class="{'short':!scrollerAtTop}"
				           :placeholder="locale(langKeys.KEYPAIR.ACCOUNTS.SearchPlaceholder)"
				           v-on:terms="x => searchTerms = x" />

				<!-- Accounts List -->
				<section class="list accounts" :class="{'scrolled':!scrollerAtTop}" @scroll="handleScroll">
					<section class="item" v-for="account in filteredAccounts">
						<KeypairAccount :key="account.unique()" :account="account" />
					</section>
				</section>
			</section>

			<!-- KEYS AND BLOCKCHAINS -->
			<section class="list-container" key="keys" v-if="dashState === DASH_STATES.PUBLIC_KEYS">
				<section class="list blockchains" :class="{'scrolled':!scrollerAtTop}" @scroll="handleScroll">
					<KeypairBlockchains :key="keypair.unique()" :keypair="keypair" />
				</section>
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import SearchBar from '../../../components/panels/home/SearchBar';
	import KeypairAccount from './existing/KeypairAccount';
	import KeypairBlockchains from '../../../components/panels/keypair/existing/KeypairBlockchains';

	import KeyPairService from "../../../services/KeyPairService";
	import ResourceService from "../../../services/ResourceService";

	let saveTimeout;

	const DASH_STATES = {
		ACCOUNTS:'accounts',
		PUBLIC_KEYS:'publicKeys',
	};

	export default {
		props:['keypair'],

		data () {return {
			scrollerAtTop:true,
			dashState:DASH_STATES.ACCOUNTS,
			DASH_STATES,

			searchTerms:'',
		}},

		components:{
			SearchBar,
			KeypairAccount,
			KeypairBlockchains
		},

		computed:{
			...mapGetters([
				'keypairs',
			]),
			filteredAccounts(){
				return this.keypair.accounts()
					.reduce((acc, account) => {
						if(!acc.find(x => account.network().unique() === x.network().unique()
						   && account.sendable() === x.sendable())) acc.push(account);
						return acc;
					}, [])
					.filter(x => x.name.toLowerCase().match(this.searchTerms))
			},
			nameError(){
				if(!this.keypair.name.trim().length) return 'Enter a name for this Vault Entry';
				if(this.keypairs.find(x => x.id !== this.keypair.id && x.name.toLowerCase() === this.keypair.name.toLowerCase())) return 'A Vault Entry with this name already exists.';
				return false;
			}
		},

		methods:{
			handleScroll(e){
				this.scrollerAtTop = e.target.scrollTop <= 80;
			},
		},

		watch:{
			['dashState'](){
				setTimeout(() => {
					this.scrollerAtTop = true;
				}, 200);
			},
			['keypair.name'](){
				clearTimeout(saveTimeout);
				if(!this.keypair) return;
				saveTimeout = setTimeout(async () => {
					if(this.nameError) return;
					await KeyPairService.updateKeyPair(this.keypair);
				}, 500);
			},
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../_variables";

	.panel-container {
		position:fixed;
		top:170px;
		left:0;
		right:0;
		bottom:0;
		display: flex;
		flex-direction: column;
	}

	.dash-switch {
		height:60px;
		position: relative;
		margin-top:-20px;
		display:flex;
		justify-content: center;
		align-items: center;
		transition:all 0.2s ease;
		transition-property: height;

		.button {
			height:40px;
			line-height:40px;
			font-weight: bold;
			color:$mid-dark-grey;
			font-size: 14px;
			position: relative;
			cursor: pointer;
			transition:all 0.2s ease;
			transition-property: color, height, line-height;

			&:last-child {
				margin-left:40px;
			}

			&:after {
				content:'';
				display:block;
				position:absolute;
				bottom:-10px;
				left:0;
				right:0;
				background:$dark-blue;
				height:2px;
				z-index:2;
				opacity:0;
				transition:all 0.2s ease;
				transition-property: opacity;
			}

			&:hover {
				color:$dark-grey;
			}

			&.active {
				color:$dark-blue;

				&:after { opacity:1; }

				&:last-child {
					&:after { animation: in-left 0.3s forwards; }
				}

				&:first-child {
					&:after { animation: in-right 0.3s forwards; }
				}

			}

			@keyframes in-left {
				0% {
					transform:translateX(-120px);
					width:120%;
				}
				100% {
					transform:translateX(0px);
					width:100%;
				}
			}

			@keyframes in-right {
				0% {
					transform:translateX(280px);
					width:30%;
				}
				100% {
					transform:translateX(0px);
					width:100%;
				}
			}
		}

		&:after {
			content:'';
			display:block;
			position:absolute;
			left:-70px;
			right:-70px;
			bottom:0;
			border-bottom:2px solid #f4f4f4;
		}

		&.short {
			height:40px;

			.button {
				height:20px;
				line-height:20px;
			}
		}
	}

	.list-container {
		flex: 1;
		display:flex;
		flex-direction: column;
		position: relative;
		margin-left:-70px;
		margin-right:-70px;
		margin-bottom:-40px;
		padding-left:70px;
		padding-right:55px;

		@media (min-width:1280px){
			padding:0;
		}

		.search {
			margin-left:-30px;
			border-bottom:0 solid rgba(0,0,0,0);
			transition: border-bottom 0.3s ease;

			&.short {
				border-bottom:1px solid rgba(0,0,0,0.05);
			}

			@media (min-width:1280px){
				padding:0;
			}
		}
	}

	.list {
		position:absolute;
		bottom:0;
		left:0;
		right:0;
		overflow-y:scroll;
		padding-left:70px;
		padding-right:55px;
		padding-bottom:50px;
		transition: top 0.4s ease, padding-top 0.2s ease;
		overflow-x:hidden;

		&.blockchains {
			top:0;
		}

		&.accounts {
			top:60px;

			@media (min-width:1280px){
				padding:0 10px;
				padding-bottom:50px;
			}

			.item {
				flex:1;
				margin-bottom:20px;
				border:1px solid #dfe0e1;
				border-radius:2px;
			}
		}

		&.scrolled {
			top:40px;
			padding-top:80px;
		}
	}

</style>