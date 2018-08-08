<template>
    <section>
        <section class="menu-search">
            <input placeholder="Search..." v-model="terms" />
            <figure class="search-bg"></figure>
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
        position: relative;
        background:transparent;


        .search-bg {
            background:rgba(255,255,255,0.1);
            /*background:#fff;*/
            position: absolute;
            top:0;
            bottom:0;
            left:0;
            right:0;
            z-index:0;
            box-shadow:inset 0 0 0 rgba(0,0,0,0), inset 0 0 0 rgba(0,0,0,0), inset 0 0 0 rgba(0,0,0,0);

            transition: background 0.4s ease, box-shadow 0.8s ease;

        }

        input {
            border:0;
            outline:0;
            width:100%;
            height:40px;
            padding:0 20px;
            background:transparent;
            position: relative;
            z-index:1;
            font-size: 11px;
            font-weight: bold;

            $placeholder-color:rgba(0,0,0,0.2);
            &::-webkit-input-placeholder {   color: $placeholder-color; }
            &::-moz-placeholder {            color: $placeholder-color; }
            &:-ms-input-placeholder {        color: $placeholder-color; }
            &:-moz-placeholder {             color: $placeholder-color; }


            &:focus {
                & + .search-bg {
                    background:rgba(0,0,0,0.02);
                    box-shadow:inset 0 -1px 1px rgba(0,0,0,0.02), inset 0 0 10px rgba(0,0,0,0.04), inset 0 -8px 18px rgba(0,0,0,0.05);
                }
            }
        }
    }
</style>