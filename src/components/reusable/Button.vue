<template>
	<button :disabled="disabled || loading" :class="{'blue':blue, 'red':red, 'big':big, 'small':small, 'icon':icon && !text}" @click="click && !loading ? click() : ()=>{}">
		<span v-if="icon" class="icon" :class="icon"></span>
		<span v-if="loading" class="loading icon-spin4 animate-spin"></span>
		<span v-if="text">{{text}}</span>
	</button>
</template>

<script>
	export default {
		props:['text','click', 'blue', 'red', 'disabled', 'big', 'icon', 'small', 'loading']
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	button {
		cursor: pointer;
		outline:0;
		padding:6px 12px;
		font-weight: bold;
		border-radius:$radius;
		background:$light-blue;
		border:1px solid $lightestblue;
		color:$blue;

		&.blue {
			background:$blue;
			color:$white;
			border:1px solid $darkblue;
		}

		&.red {
			background:$red;
			color:$white;
			border:0;
		}

		&.big {
			padding:6px 18px;
			font-size: $large;
		}

		&.small {
			padding:4px 6px;
			font-size: $small;
		}

		&.icon {
			padding:0 8px;
		}

		.loading {
			margin-right:10px;
			display:inline-block;
		}

		&:disabled {
			opacity:0.6;
			cursor: not-allowed;
		}
	}
</style>