<template>
	<section class="select" :class="{'bordered':bordered, 'open':open, 'disabled':disabled}">
		<input ref="terms" placeholder="Search..." v-model="optionsTerms" />
		<section class="selected" @click="toggle" :class="{'bordered':bordered, 'truncate':truncate}">
			<figure class="text">
				{{parse(selectedOption)}}
				<div class="subtitle" v-if="subparser">{{subparser(selectedOption)}}</div>
			</figure>
			<figure class="chevron icon-down-open-big"></figure>
		</section>
		<section class="options" v-if="!noClick" :class="{'start-left':startLeft}">
			<figure class="option" :class="{'hovered':hovered === index}" @click="select(item)" @mouseover="hovered = index" v-for="(item, index) in filteredOptions">
				{{parse(item)}}
				<div class="subtitle" v-if="subparser">{{subparser(item)}}</div>
			</figure>
			<figure class="option" v-if="!filteredOptions.length">
				No results
			</figure>
		</section>
	</section>
</template>

<script>
	export default {
		props:['selected', 'placeholder', 'disabled', 'options', 'parser', 'subparser', 'bordered', 'noClick', 'truncate', 'startLeft'],
		data(){return {
			open:false,
			optionsTerms:'',
			hovered:0,
		}},
		mounted(){
			document.addEventListener('click', this.handleDocumentClick);
			document.addEventListener('keyup', this.handleKeyPress);
		},
		destroyed(){
			document.removeEventListener('click', this.handleDocumentClick);
			document.removeEventListener('keyup', this.handleKeyPress);
		},
		computed:{
			filteredOptions(){
				return this.options.filter(x => {
					const parsed = this.parse(x);
					return !parsed || parsed.toLowerCase().indexOf(this.optionsTerms.toLowerCase()) > -1
				});
			},
			selectedOption(){
				return this.selected || this.placeholder || this.options[0];
			}
		},
		methods:{
			handleDocumentClick(e){
				if(this.open) this.open = false;
			},
			handleKeyPress(e){
				if(this.open){
					switch(e.which){
						case 40: this.hovered++; break;
						case 38: this.hovered--; break;
						case 13: return this.select(this.filteredOptions[this.hovered])
					}
				}
				if(this.hovered < 0){
					this.hovered = this.filteredOptions.length-1;
				}
				if(this.hovered > this.filteredOptions.length-1){
					this.hovered = 0;
				}
			},
			toggle(){
				if(this.open) return;
				setTimeout(() => {
					if(this.disabled) return false;
					this.open = !this.open;

					if(this.open){
						this.optionsTerms = '';
						setTimeout(() => {
							this.$refs.terms.focus()
						}, 50);
					}
				},1)
			},
			parse(item){
				if(typeof item === 'string' && (!this.parser || !this.parser(item))) return item;
				if(typeof this.parser !== 'function') return item;
				return this.parser(item);
			},
			select(item){
				this.open = false;
				this.$emit('selected', item);
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.select {
		position: relative;
		z-index: 10;
		width:100%;
		display:inline-block;

		input {
			position: absolute;
			top:-9000px;
			width:0;
			height:0;
			opacity:0;
		}

		.subtitle {
			font-size: $small;
			line-height:$small;
			margin:0;
			padding:0;
			color:$silver;
		}

		.selected {
			cursor: pointer;
			height:24px;
			width:100%;
			line-height:24px;
			border-radius:$radius;
			padding:0 10px;
			z-index:1;
			background:#fff;
			opacity:1;
			padding-right:30px;
			display:inline-block;
			position: relative;

			transition: all 0.2s ease;
			transition-property: opacity;

			.text {
				color:$black;
				font-size: $medium;
				font-weight: bold;
				display:inline-block;
			}

			&.truncate {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;

				.text {
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					width:100%;
				}
			}

			.chevron {
				display:flex;
				align-items: center;
				position: absolute;
				right:0;
				top:0;
				bottom:0;
				line-height:24px;
				color:$blue;
				font-size: 14px;

				transition: transform 0.2s ease;
			}
		}

		.options {
			position: absolute;
			top:25px;
			width:100%;
			max-height:150px;
			min-height:25px;
			background: #fff;
			min-width:200px;
			right:0;
			z-index:2;
			border-radius:$radius;
			overflow: hidden;
			border:1px solid $lightgrey;
			box-shadow:0 0 1px rgba(0,0,0,0);
			opacity:0;
			visibility: hidden;
			text-align:left;

			transition: all 0.1s ease;
			transition-property: opacity, visibility, box-shadow;

			&.start-left {
				left:0;
			}

			.option {
				cursor: pointer;
				padding:8px 12px;
				color:$silver;
				font-size: $medium;
				font-weight: bold;

				&.hovered {
					background:rgba(0,0,0,0.02);
					color:$black;
				}
			}
		}

		&.open {
			z-index:11;

			.options {
				overflow-y: auto;
				box-shadow:0 0 20px $blue-shadow;
				opacity:1;
				visibility: visible;
			}

			.selected {
				opacity:0.5;

				.chevron {
					transform:rotateZ(180deg) translateY(-1px);
				}

				&.bordered {
					.chevron {
						transform:rotateZ(180deg) translateY(4px);
					}
				}
			}
		}

		&.bordered {
			border:1px solid $lightgrey;
			border-radius:$radius;
			padding:6px 0;

			.selected {
				.chevron {
					top:6px;
					right:10px;
				}
			}

			.options {
				top:38px;
			}
		}
	}


</style>