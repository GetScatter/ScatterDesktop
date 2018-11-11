<template>
	<section>
		<section class="key-row" v-for="item in items">
			<figure class="icon" v-if="item.icon && item.icon.length">
				<span style="font-size: 9px;">icon</span>
			</figure>

			<section class="details" :class="{'has-icon':item.icon && item.icon.length}">
				<figure class="title">{{item.title}}</figure>
				<p>{{item.description}}</p>
			</section>

			<section class="action">
				<btn v-for="action in item.actions" :small="item.actions.length > 1" :text="action.name" v-on:clicked="action.handler"></btn>
			</section>
		</section>
	</section>
</template>

<script>

	export default {
		props:['items']
	}

</script>

<style scoped lang="scss" rel="stylesheet/scss">
	@import "../../_variables";

	.key-row {
		display:flex;
		flex-direction: row;
		width:100%;
		position: relative;
		padding:25px 0;

		&:first-child { padding-top:0; }
		&:last-child { padding-bottom:0; }

		.icon {
			width:40px;
		}

		.details {
			padding-right:20px;
			width:calc(100% - 170px);

			&.has-icon {
				width:calc(100% - 40px - 170px);
			}

			p { margin-top:5px; }
		}

		.action {
			width:170px;
			display:flex;
			align-items: center;
			justify-content: flex-end;

			button {
				display:inline-block;
				margin-left:5px;
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

</style>