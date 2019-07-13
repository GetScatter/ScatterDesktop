<template>
    <section class="dashboard">
        dashboard
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'

    let saveTimeout;
    export default {
    	components:{

        },
        data () {return {
        	
        }},
        computed:{
            ...mapState([
            	'scatter',
            ]),
            ...mapGetters([
            	'keypairs',
            	'accounts',
            ]),
            
        },
	    mounted(){

	    },
        methods:{
	        
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .dashboard {
        background:$blue;
        height:calc(100vh - 175px);
        padding:$padding-med;
        
    }




</style>
