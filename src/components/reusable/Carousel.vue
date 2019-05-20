<template>
	<section class="carousel" ref="base">

		<section v-if="slides.length > 1" @click="slide(-1)" class="go-right icon-right-open-big"></section>
		<section v-if="slides.length > 1" @click="slide(1)" class="go-left icon-left-open-big"></section>


		<section class="slider-container">
			<section class="slider" :style="{'left':left+'px'}">

				<section class="slide" v-for="(slide,i) in slides" :style="{'left':i*slideWidth+'px', 'width':slideWidth+'px'}">

					<section class="image-container" :class="{'full-height':noInfo}">
						<figure class="bg" :style="`background-image:url(${slide.img});`"></figure>
						<figure class="image" :style="`background-image:url(${slide.img});`"></figure>
					</section>

					<section class="info" v-if="!noInfo">
						<section>
							<figure class="name">{{slide.name}}</figure>
							<figure class="description">{{slide.description}}</figure>
						</section>
						<section>
							<Button text="View App" :blue="1" @click.native="goToApp(slide)" />
						</section>
					</section>
				</section>
			</section>
		</section>
	</section>
</template>

<script>

	let interval;
	export default {
		props:['slides', 'noInfo'],
		data(){return {
			left:0,
			slideWidth:0,
		}},
		mounted(){
			this.$nextTick(() => {
				this.setInterval();
				this.calcBaseWidth();
				window.addEventListener('resize', this.calcBaseWidth);
			})
		},
		destroyed(){
			clearInterval(interval)
			window.removeEventListener('resize', this.calcBaseWidth);
		},
		computed:{
			maxLeft(){
				return -((this.slides.length-1) * this.slideWidth);
			},
			slideIndex(){
				return Math.abs(this.left) / this.slideWidth
			},
		},
		methods:{
			calcBaseWidth(){
				this.$nextTick(() => {
					if(!this.$refs.base) return;
					this.slideWidth = this.$refs.base.clientWidth;
					this.left = 0;
				})
			},
			slide(delta){
				if(delta > 0) this.left += this.slideWidth;
				else this.left -= this.slideWidth;
				if(this.left < this.maxLeft) this.left = 0;
				if(this.left > 0) this.left = this.maxLeft;
				this.setInterval();
			},
			setInterval(){
				clearInterval(interval);
				interval = setInterval(() => {
					this.slide(-1);
				}, 10000);
			},
			goToApp(slide){
				this.$router.push({name:this.RouteNames.APP, params:{applink:slide.applink}});
			}
		},
		watch:{
			['window'](){
				this.calcBaseWidth();
			}
		}

	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	.carousel {
		position: relative;
		height:300px;
		width:100%;
		max-width:860px;
		margin:0 auto;
		margin-top:1px;

		.go-right, .go-left {
			cursor: pointer;
			position: absolute;
			color:$blue;
			font-size: 28px;
			width:44px;
			height:44px;
			line-height:44px;
			text-align:center;
			z-index:3;
			transition:all 0.12s ease-in-out;

			&:hover {
				width:40px;
				box-shadow:$blue-shadow;
			}
		}

		.go-left {
			left:-40px;
			top:60%;
			margin-top:-54px;
			border-top-right-radius: 3px;
			border-bottom-right-radius: 3px;
		}

		.go-right {
			right:-40px;
			top:60%;
			margin-top:-54px;
			border-top-left-radius: 3px;
			border-bottom-left-radius: 3px;
		}

		.slider-container {
			position: relative;
			overflow:hidden;
			height:300px;
			width:100%;
			border-radius:20px;
			box-shadow:0 12px 24px $blue-shadow;
		}

		.slider {
			position: absolute;
			top:0;
			bottom:0;
			left:0;
			right:0;

			transition: all 0.6s ease;
			transition-property: left;

			.slide {
				position: absolute;
				top:0;
				height:100%;

				.image-container {
					position: absolute;
					top:0;
					bottom:80px;
					left:0;
					right:0;
					z-index:1;
					overflow: hidden;
					background:$black;

					&.full-height {
						bottom:0;
					}

					.bg {
						position: absolute;
						top:-900px;
						bottom:-900px;
						left:-900px;
						right:-900px;
						background-size: 200px;
						background-position: center;
						z-index:1;
						transform:rotateZ(20deg) scale(1.2);
						opacity:0.1;

						transition: 1s transform ease;
					}

					.image {
						position: absolute;
						top:0;
						bottom:0;
						left:0;
						right:0;
						background-size: contain;
						background-position: center;
						background-repeat: no-repeat;
						margin:20px;
						z-index:1;
						transition: 1s transform ease;
					}

					&.full {
						.bg {
							display:none;
						}

						.image {
							margin:0;
							background-size: cover;
						}
					}
				}

				.info {
					position: absolute;
					bottom:0;
					left:0;
					right:0;
					display:flex;
					padding:20px;
					z-index:2;
					flex-direction: row;
					justify-content: space-between;

					.name {
						font-size: $medium;
						font-weight: bold;
						white-space:nowrap;
						overflow:hidden;
						text-overflow:ellipsis;
					}

					.description {
						margin-top:2px;
						font-size: $small;
						color:$black;
					}
				}
			}

			&:hover {
				.slide {
					.image-container {
						.bg {
							transition: 8s transform ease;
							transform:rotateZ(50deg) scale(0.5);
						}
					}
				}
			}
		}
	}

</style>