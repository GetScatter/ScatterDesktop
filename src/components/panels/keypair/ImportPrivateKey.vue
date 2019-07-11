<template>
	<section class="center-panel">
		<Key />
		<br>
		<br>
		<h2>Import your Private Key</h2>
		<p>
			Your private key never leaves your device. We only use this to sign transactions and
			nobody will have access to it but you. Please remember that though Scatter is a good place to keep your
			key, you should always have a backup of it somewhere offline.
		</p>

		<br>

		<input class="center" type="password" v-model="privateKey" placeholder="input your private key" />
		<p v-if="!error"><u>Once you input a valid key, it will automatically import it.</u></p>
		<p v-else>{{error}}</p>

		<ActionBar v-if="returnOnly" :buttons-left="[{text:'Back', click:() => $emit('back')}]" :buttons-right="[{text:'Skip', click:() => $emit('next')}]" />
	</section>
</template>

<script>
	import {mapGetters} from 'vuex';
	import Key from '../../svgs/Key'

	export default {
		components:{Key},
		props:['returnOnly'],
		data(){return {
			privateKey:'',
			importing:false,
			error:'',
		}},
		computed:{
			...mapGetters([
				'keypairs'
			])
		},
		methods:{

		},
		watch:{
			['privateKey'](){
				this.$emit('key', this.privateKey.trim().replace(/\W/g, '').replace('0x', ''));
			}
		}
	}
</script>

<style scoped lang="scss">

</style>