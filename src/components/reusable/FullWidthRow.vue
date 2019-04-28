<template>
	<section :class="{'for-popout':popout}">
		<section class="row" v-for="item in items">
			<figure class="icon" v-if="item.hasOwnProperty('icon') && item.icon.length">
				<span :class="item.icon"></span>
			</figure>

			<section class="details" :class="{'has-icon':item.hasOwnProperty('icon') && item.icon.length}">
				<figure class="title">{{item.title}}</figure>
				<p v-if="!item.asInput">{{item.description}}</p>
				<cin style="width:100%;" v-else :text="item.description" copy="1" />
			</section>

			<section class="actions" :class="{'multiple':item.actions.length > 1}">
				<btn :key="action.name" v-for="action in item.actions"
				     :class="{'important':action.hasOwnProperty('important')}"
				     :icon="action.hasOwnProperty('icon') ? action.icon : null"
				     :text="action.name"
				     :small="action.hasOwnProperty('small') && action.small"
				     :blue="action.hasOwnProperty('blue') && action.blue"
				     :red="action.hasOwnProperty('red') && action.red"
				     :disabled="action.hasOwnProperty('disabled') && action.disabled"
				     v-on:clicked="action.handler"></btn>
			</section>
		</section>
	</section>
</template>

<script>

	export default {
		props:['items', 'popout']
	}

</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../styles/variables";

	.important {
		animation: important 1s ease infinite;

		@keyframes important {
			0%, 100% { transform:scale(1); }
			50% { transform:scale(1.1); }
		}
	}

	.row {
		display:flex;
		flex-direction: row;
		width:100%;
		position: relative;
		padding:25px 0;

		&:first-child { padding-top:0; }
		&:last-child { padding-bottom:0; }

		.icon {
			width:70px;
			display:flex;
			justify-content: flex-start;
			align-items: center;
			font-size: 36px;
			color:$dark-grey;
		}

		.details {
			flex:3;
			padding-right:20px;

			p { margin-top:5px; }
		}

		.actions {
			flex:1;
			display:flex;
			align-items: center;
			justify-content: flex-end;

			&.multiple {
				flex-wrap: wrap;
				max-width: 50%;
				width: 100%;

				button {
					display:inline-block;
					margin-left:5px;
					margin-bottom:5px;
					width:max-content;
				}
			}
		}

		&:not(:last-child){
			&:after {
				content:'';
				display:block;
				position:absolute;
				left:-70px;
				right:-70px;
				bottom:0;
				height:1px;
				background:rgba(0,0,0,0.1);
			}
		}
	}

	.for-popout {


		.row {
			padding:15px;
			background:#fff;
			border:1px solid #e0e0e0;
			border-radius:4px;
			margin-bottom:10px;

			.icon {
				width:40px;
			}

			.details {
				display:flex;
				flex-direction: column;
				justify-content: center;

				.title { font-size:14px; }
				p {
					font-size:9px;
					color:$dark-grey;
					margin-top:0;
				}
			}

			.actions {
				button {
					width:max-content;
				}
			}

			&:not(:last-child){
				&:after {
					display:none;
				}
			}
		}
	}

</style>