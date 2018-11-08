<template>
	<section>
		<section class="key-row" v-for="item in items">
			<figure class="icon">
				<span style="font-size: 9px;">icon</span>
			</figure>

			<section class="details">
				<figure class="title">{{item.title}}</figure>
				<p>{{item.description}}</p>
			</section>

			<figure class="action">
				<btn :text="item.action" v-on:clicked="item.handler"></btn>
			</figure>
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
		$icon-width:40px;
		$action-width:150px;
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
			width:calc(100% - 40px - 150px);

			.title {
				color:$light-blue;
				font-weight: bold;
			}

			p {
				font-size:11px;
			}
		}

		.action {
			width:150px;
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