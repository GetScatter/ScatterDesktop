<template>
    <section>

        <section class="panel sub-menu">
            <section class="head">

            </section>

            <section class="items-list scrollable" v-if="selectedOption">
                <section class="item" @click="selectOption(option)">
                    <figure class="title"></figure>
                    <figure class="description"></figure>
                </section>
            </section>
        </section>

        <section class="panel display">

            <section class="head">

            </section>



        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Countries} from '../data/Countries'
    import Identity from '../models/Identity'



    export default {
        name: 'Identities',
        data () {return {

        }},
        computed: {
            ...mapState([
                'scatter',
                'searchTerms',
            ]),
            ...mapGetters([
                'accounts',
            ]),
        },
        mounted(){

        },
        methods: {

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

</style>