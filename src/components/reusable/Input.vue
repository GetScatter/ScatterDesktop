<template>
	<section class="input" :class="{'for-login white':forLogin, 'big':big, 'medium':medium, 'small':small, 'important':red, 'centered':centered, 'white':white}">

		<label v-bind="labelStyles" v-if="error || label" :class="{'error':error}">
			<span>{{error ? error : label}}</span>
			<span v-if="rightText" @click="$emit('right')">{{rightText}}</span>
		</label>

		<input v-if="!textarea" ref="focuser"
		       :placeholder="placeholder"
		       @keyup.enter="enter"
		       @blur="blur"
		       :class="{'pad-right':dynamicButton || copy}"
		       :maxlength="maxlength || -1"
		       :disabled="disabled || false"
		       :type="type || 'text'"
		       v-model="input" />

		<textarea v-if="textarea" ref="focuser"
		          :placeholder="placeholder"
		          @blur="blur"
		          :class="{'pad-right':dynamicButton || copy}"
		          :maxlength="maxlength || -1"
		          :disabled="disabled || false"
		          :type="type || 'text'"
		          v-model="input"></textarea>

		<figure class="dynamic-button" v-if="dynamicButton" v-tooltip="dynamicTooltip" :class="{'labeled':label, 'hide':hideDynamicButton}" @click="emitDynamicButton">
			<i v-if="!loaderOnDynamic" :class="`${dynamicButton}`"></i>
			<i class="icon-spin4 animate-spin" v-if="loaderOnDynamic"></i>
		</figure>
		<figure class="copy" v-if="copy" :class="{'labeled':label}">
			<i class="icon-docs" @click="copyText"></i>
		</figure>
	</section>
</template>

<script>
	import ElectronHelpers from '../../util/ElectronHelpers'

	export default {
		data(){ return { input:this.text }},
		methods: {
			enter(){ this.$emit('enter') },
			emit(){ this.$emit('changed', this.input) },
			blur(){ this.$emit('blur') },
			emitDynamicButton(){ this.$emit('dynamic') },
			copyText(){ ElectronHelpers.copy(this.text); }
		},
		created(){
			if(this.focus) {
				this.$nextTick(() => {
					this.$refs.focuser.focus();
				})
			}
		},
		props:[
			'forLogin',
			'placeholder',
			'label',
			'labelStyles',
			'error',
			'type',
			'maxlength',
			'text',
			'disabled',
			'copy',
			'hideDynamicButton',
			'dynamicButton',
			'dynamicTooltip',
			'big',
			'medium',
			'focus',
			'loaderOnDynamic',
			'red',
			'centered',
			'textarea',
			'rightText',
			'small',
			'white',
		],
		watch:{
			input:function(){ this.emit(); },
			text:function(){ this.input = this.text; },
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";
	.input {
		text-align:left;
		position: relative;
		width:100%;
		margin-bottom:20px;

		.copy, .dynamic-button {
			cursor: pointer;
			position: absolute;
			right:10px;
			bottom:0;
			top:0;
			display:flex;
			justify-content: center;
			align-items: center;
			font-size:20px;
			z-index:2;
			color:$blue;
			opacity:1;

			&.labeled {
				bottom:-20px;
			}

			transition: all 0.2s ease;
			transition-property: color, opacity, right;

			&:hover {
				color:$blue;
			}
		}
		.dynamic-button + .copy {
			right:30px;
		}

		.dynamic-button {
			&.hide {
				opacity:0;
				right:0;
			}
		}

		$small-font:14px;

		input, textarea {
			outline:0;
			height:38px;
			width:100%;
			border:1px solid #dfe0e1;
			border-radius:3px;
			padding:0 12px;
			cursor: text;
			resize: none;
			font-size: $small-font;
			background:$white;

			transition: all 0.15s ease;
			transition-property: line-height, height, padding, border, background;

			&::-webkit-input-placeholder {
				font-size: $small-font;
				color:$placeholder-color;
			}
			&::-moz-placeholder {
				font-size: $small-font;
				color:$placeholder-color;
			}
			&:-ms-input-placeholder {
				font-size: $small-font;
				color:$placeholder-color;
			}
			&:-moz-placeholder {
				font-size: $small-font;
				color:$placeholder-color;
			}

			&.pad-right {
				padding-right:40px;
			}

			&:disabled {
				cursor: not-allowed;
				opacity:0.75;
			}

			&:focus {
				border:1px solid rgba(0,0,0,0.22);
				background:#fff;
			}
		}

		textarea {
			padding:15px;
			height:80px;
		}

		&.big {

			$big-font:20px;
			input, textarea {
				line-height:68px;
				height:68px;
				padding:0 20px;
				font-size: $big-font;

				&::-webkit-input-placeholder {
					font-size: $big-font;
					color:$placeholder-color;
				}
				&::-moz-placeholder {
					font-size: $big-font;
					color:$placeholder-color;
				}
				&:-ms-input-placeholder {
					font-size: $big-font;
					color:$placeholder-color;
				}
				&:-moz-placeholder {
					font-size: $big-font;
					color:$placeholder-color;
				}

				&.pad-right {
					padding-right:50px;
				}
			}

			.dynamic-button {
				font-size: 26px;
				bottom:0;

				&.labeled {
					bottom:-15px;
				}
			}
		}

		&.medium {

			$medium-font:20px;
			input, textarea {
				line-height:48px;
				height:48px;
				padding:0 20px;
				font-size: $medium-font;

				&::-webkit-input-placeholder {
					font-size: $medium-font;
					color:$placeholder-color;
				}
				&::-moz-placeholder {
					font-size: $medium-font;
					color:$placeholder-color;
				}
				&:-ms-input-placeholder {
					font-size: $medium-font;
					color:$placeholder-color;
				}
				&:-moz-placeholder {
					font-size: $medium-font;
					color:$placeholder-color;
				}

				&.pad-right {
					padding-right:50px;
				}
			}

			.dynamic-button {
				font-size: 26px;
				bottom:0;

				&.labeled {
					bottom:-15px;
				}
			}
		}

		&.small {
			$smaller-font:13px;
			margin-bottom:5px;

			input, textarea {
				height:30px;
				padding:0 10px;
				font-size: $smaller-font;
				display: inline-block;

				&::-webkit-input-placeholder {
					font-size: $smaller-font;
					color:$placeholder-color;
				}
				&::-moz-placeholder {
					font-size: $smaller-font;
					color:$placeholder-color;
				}
				&:-ms-input-placeholder {
					font-size: $smaller-font;
					color:$placeholder-color;
				}
				&:-moz-placeholder {
					font-size: $smaller-font;
					color:$placeholder-color;
				}

				&.pad-right {
					padding-right:50px;
				}
			}
		}

		&.white {

			input, textarea {
				color:#fff;
				border:1px solid rgba(255,255,255,0.9);

				&::-webkit-input-placeholder {
					color:#fff;
				}
				&::-moz-placeholder {
					color:#fff;
				}
				&:-ms-input-placeholder {
					color:#fff;
				}
				&:-moz-placeholder {
					color:#fff;
				}

				&:focus {
					background:rgba(0,0,0,0.04);
				}
			}

			.dynamic-button {
				color:$white;
			}
		}

		&.important {
			input {
				border: 1px solid $red;
			}
		}

		&.centered {
			text-align: center;

			input {
				text-align: center;
			}
		}

		&.for-login {
			input {
				background:transparent;

			}
		}

	}
</style>