<template>
    <section>
        <back-bar v-on:back="back" />



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'accounts',
            ]),

        },
        created(){

        },
        methods:{
	        back(){
	        	this.$router.back();
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";


</style>
