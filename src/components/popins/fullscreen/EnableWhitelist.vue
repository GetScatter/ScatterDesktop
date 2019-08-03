<template>
	<section>
		<section class="full-panel inner center-fold limited whitelist">
			<section>
				<section class="head">
					<!--<figure class="title">{{locale(langKeys.POPINS.FULLSCREEN.WHITELISTING.Title)}}</figure>-->
					<p>
						{{locale(langKeys.POPINS.FULLSCREEN.WHITELISTING.Desc)}}
					</p>

					<br>

					<section class="mock-props">
						<label><b class="red">{{locale(langKeys.POPINS.FULLSCREEN.WHITELISTING.ActionLabel)}}</b></label>
						<section class="details split-inputs">
							<input checked disabled="true" type="checkbox" />
							<figure class="title" style="font-size: 13px;">eosio.token <i class="contract-split icon-right-open-big"></i> transfer</figure>
						</section>
						<br>

						<section class="mock-props">
							<label>amount <b class="red">({{locale(langKeys.POPINS.FULLSCREEN.WHITELISTING.MutableProp)}})</b></label>
							<section class="split-inputs">
								<input checked disabled="true" type="checkbox" />
								<figure class="value">1 TOKENS</figure>
							</section>
						</section>

						<section class="mock-props">
							<label>recipient <b class="red">({{locale(langKeys.POPINS.FULLSCREEN.WHITELISTING.ImmutableProp)}})</b></label>
							<section class="split-inputs">
								<input disabled="true" type="checkbox" />
								<figure class="value">xxxxxxxxxxxxx</figure>
							</section>
						</section>
					</section>

				</section>
			</section>

			<section class="action-bar short bottom centered">
				<Button :text="locale(langKeys.GENERIC.Back)" @click.native="returnResult(false)" />
				<Button :text="locale(langKeys.GENERIC.Enable)" blue="1" @click.native="returnResult(true)" />
			</section>
		</section>
	</section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';

	export default {
		props:['popin'],
		data () {return {
			password:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([

			]),
			returnOnly(){
				return this.popin.data.props.returnOnly;
			}
		},
		methods:{
			returnResult(truthy){
				this.popin.data.callback(truthy);
				this[Actions.RELEASE_POPUP](this.popin);
			},

			...mapActions([
				Actions.RELEASE_POPUP
			])
		},
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../../styles/variables";

	.mock-props {
		max-width:500px;
		width:100%;
		text-align:left;
		padding:10px;
		border:1px solid rgba(0,0,0,0.1);
		border-radius:4px;
		margin-bottom:5px;
		background:#fff;
		color:$dark-grey;

		input {
			width:20px;
			height:20px;
			margin-right:10px;
		}

		label {
			.red {
				color:$red;
			}
		}
	}

	.whitelist {
		background:$reverse-gradient;
		color:#fff;
	}

	.head {
		p {
			color:rgba(255,255,255,0.65);
			font-size: 13px;
		}
	}

	.action-bar {
		button {
			width:auto;
			min-width:200px;

			&:last-child {
				margin-left:10px;
			}
		}
	}

</style>