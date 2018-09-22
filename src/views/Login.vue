<template>
    <section class="login">
        <!--<figure class="bg"></figure>-->
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'

    export default {
        name: 'Login',
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'accounts',
                'networks',
            ])
        },
        mounted(){

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .login {
        /*position: relative;*/
        /*height:100vh;*/
        /*width:100%;*/
        /*-webkit-app-region: drag;*/

        .bg {
            position:absolute;
            top:0; bottom:0; left:0; right:0;
            background:url(https://images.unsplash.com/photo-1478515463067-d20f52aace26?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=899a8459cffc394ab9d49544618503ff&auto=format&fit=crop&w=968&q=80);
            background-size:cover;
        }
    }

</style>
