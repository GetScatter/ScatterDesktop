<template>
    <section>

        <section>
            <section class="head">

            </section>

            <section class="selected-item scrollable">

                <figure class="name">{{title ? title : 'Nothing Here Yet.'}}</figure>
                <figure class="description">
                    {{description}}
                </figure>


                <section class="info-box" v-if="buttonText">
                    <btn :text="buttonText" v-on:clicked="buttonFn"></btn>
                </section>


            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([

            ])
        },
        mounted(){

        },
        methods: {
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['title', 'description', 'buttonText', 'buttonFn'],
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";


</style>