<template>
	<section class="container">
		<label v-if="label">{{label}}</label>
		<section class="items">
			<section class="item" :key="item.id" v-for="item in items" :class="{'selected':selected && selected === item.id, 'unselectable':unselectable}" @click="$emit('selected',item)">
				<transition name="slide-left" mode="out-in">
					<figure v-if="selected && selected === item.id && selectedIcon" :class="selectedIcon"
					        class="selected-icon" @click="$emit('action', item)"></figure>
				</transition>

				<section class="details">
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
		props:['items', 'label', 'selected', 'selectedIcon', 'icon', 'unselectable']
	}

</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../_variables";

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

		.item {
			border:1px solid #e2e2e2;
			border-radius:4px;
			padding:16px;
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
				color:$dark-blue;
				font-size: 22px;
				border-radius:4px;
				height:30px;
				width:30px;
				display:flex;
				justify-content: center;
				align-items: center;

				&:hover {
					background:$dark-blue;
					color:#fff;
				}
			}

			.selected-icon {
				color:$dark-blue;
				font-size: 22px;
				padding-right:15px;
			}

			.details {
				flex:1;
			}
		}
	}


</style>