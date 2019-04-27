<template>
	<button @click="click ? click() : ()=>{}">
		{{text}}
	</button>
</template>

<script>
	export default {
		props:['text','click']
	}
</script>

<style scoped lang="scss">
	@import "../../styles/variables";

	button {
		cursor: pointer;
		height:34px;
		background:$blue;
		border:0;
		outline:0;
		padding:0 15px;
		color:$white;
		font-weight: bold;
		border-radius:$radius;
	}
</style>