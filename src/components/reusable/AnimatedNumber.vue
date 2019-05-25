<template>
	<span>{{formatNumber(displayNumber, true)}}</span>
</template>

<script>
	export default {
		props:{'number':{default:0}, 'decimals':{default:2}},
		data(){return {
			displayNumber:0,
			interval:false
		}},
		mounted:function(){
			this.displayNumber = this.number ? this.number : 0;
		},
		watch:{
			number(){
				clearInterval(this.interval);
				if(this.number === this.displayNumber) return;

				this.interval = setInterval(() => {
					if(this.displayNumber !== this.number){
						let change = (parseFloat(this.number) - parseFloat(this.displayNumber)) / 10;
						this.displayNumber = parseFloat(parseFloat(this.displayNumber) + change).toFixed(this.decimals);
					}
				}, 10);
			}

		}
	}
</script>

<style scoped lang="scss">

</style>