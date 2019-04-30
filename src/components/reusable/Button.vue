<template>
	<button :disabled="disabled" :class="{'blue':blue, 'red':red}" @click="click ? click() : ()=>{}">
		{{text}}
	</button>
</template>

<script>
	export default {
		props:['text','click', 'blue', 'red', 'disabled']
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	button {
		cursor: pointer;
		height:34px;
		border:0;
		outline:0;
		padding:0 15px;
		font-weight: bold;
		border-radius:$radius;
		background:$light-blue;
		color:$blue;

		&.blue {
			background:$blue;
			color:$white;
		}

		&.red {
			background:$red;
			color:$white;
		}
	}
</style>