<template>
    <section class="home">
        hiu


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import SingletonService from "../services/utility/SingletonService";


    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
            	'scatter',
            ]),
        },

        methods:{
        },
        created(){

        },

        mounted(){
	        setTimeout(async() => {
	        	await SingletonService.init();
            })
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";



</style>
