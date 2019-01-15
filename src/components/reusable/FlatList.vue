<template>
	<section class="container">
		<label v-if="label">{{label}}</label>
		<section class="items" :class="{'as-rows':asRows, 'small':small, 'dark':dark}">
			<section class="item"
			         :key="item.id"
			         v-for="item in items"
			         :class="{'selected':itemIsSelected(item), 'unselectable':unselectable, 'select-blue':selectBlue}">

				<figure v-if="itemIsSelected(item) && selectedIcon" :class="selectedIcon"
				        class="selected-icon"></figure>

				<section class="details" @click="$emit('selected',item)">
					<p v-if="item.hasOwnProperty('sub')" style="margin-top:0; margin-bottom:10px; font-size: 9px;"><b>{{item.sub}}</b></p>
					<figure class="title">{{item.title}}</figure>
					<p v-if="item.hasOwnProperty('description')">{{item.description}}</p>
				</section>

				<figure  v-if="icon":class="icon" class="icon" @click="$emit('action', item)"></figure>
			</section>
		</section>
	</section>
</template>

<script>

	export default {
		props:['items', 'label', 'selected', 'selectedIcon', 'icon', 'unselectable', 'asRows', 'small', 'selectBlue', 'dark'],
		methods:{
			itemIsSelected(item){
				if(!this.selected) return false;
				if(typeof this.selected !== 'object') return this.selected === item.id;
				return this.selected.includes(item.id);
			}
		}
	}

</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";

	.container {
		display:flex;
		flex-direction: column;
		overflow:auto;
		flex:1;
		padding:30px 30px 50px;
	}

	label {
		font-size: 11px;
		color:#7899a6;
		font-weight: bold;
		display: block;
		margin-bottom:8px;
	}

	.items {
		flex:1;

		&.as-rows {
			display:flex;
			flex-direction: row;
			flex-wrap: wrap;

			.item {
				flex:0 0 auto;
				margin:2px;

				&:not(:last-child){
					margin-bottom:2px;
				}
			}
		}

		.item {
			border:1px solid #e2e2e2;
			border-radius:4px;
			transition: border 0.15s ease;
			cursor: pointer;
			display:flex;
			align-items: center;

			&:not(:last-child){
				margin-bottom:10px;
			}

			&:hover, &.selected {
				border:1px solid #719fb6;
			}

			&.unselectable {
				cursor: not-allowed;
			}

			.icon {
				color:$primary;
				font-size: 22px;
				border-radius:4px;
				height:30px;
				width:30px;
				display:flex;
				justify-content: center;
				align-items: center;
				margin-right:20px;
				padding:20px;

				&:hover {
					background:$primary;
					color:#fff;
				}
			}

			.selected-icon {
				color:$primary;
				font-size: 22px;
				margin-left:20px;
			}

			.details {
				flex:1;
				padding:20px;
			}

			&.selected {
				&.select-blue {
					background:$primary;
					.details {
						.title {
							color:#fff;
						}
					}
				}
			}
		}

		&.small {

			.item {
				font-size: 11px;
				padding:8px 12px;
			}
		}

		&.dark {


			.item {
				border:1px solid #e2e2e2;

				.details {
					.title {
						color:rgba(255,255,255,0.5);
					}

					p {
						color:rgba(255,255,255,0.3);
					}
				}

				&:hover, &.selected {
					border:1px solid #719fb6;
				}

				.icon {
					color:#fff;

					&:hover {
						background:$primary;
						color:#fff;
					}
				}

				.selected-icon {
					color:$primary;
				}

				&.selected {
					background:rgba(0,0,0,0.2);
					.details {
						.title {
							color:#fff;
						}

						p {
							color:rgba(255,255,255,0.5);
						}
					}
				}
			}
		}
	}


</style>