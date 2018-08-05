<template>
    <section>
        <section class="menu-search">
            <input placeholder="Search..." v-model="terms" />
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    export default {

        data () {return {
            terms:'',
        }},
        mounted(){

        },
        methods: {
            ...mapActions([
                Actions.SET_SEARCH_TERMS
            ])
        },
        watch:{
            terms(){
                this[Actions.SET_SEARCH_TERMS](this.terms);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";

    .menu-search {
        width:100%;
        border-bottom:1px solid rgba(0,0,0,0.05);
        background:rgba(255,255,255,0.3);

        input {
            border:0;
            outline:0;
            width:100%;
            height:40px;
            padding:0 20px;
            background:transparent;
        }
    }
</style>