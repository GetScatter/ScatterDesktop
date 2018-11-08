<template>
    <section class="keypair">

        <back-bar v-on:back="back"></back-bar>

        <!--<section class="full-panel center-fold" v-if="!keypairs.length">-->
            <!--<section>-->
                <!--<img src="../assets/piggy_waiting.png" /><br>-->
                <!--Well, what are you waiting for?-->
            <!--</section>-->
            <!--<section class="action-bar short bottom centered">-->
                <!--<btn blue="1" style="width:300px;" text="Add Keys"></btn>-->
            <!--</section>-->
        <!--</section>-->

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import PermissionService from '../services/PermissionService';
    import ElectronHelpers from '../util/ElectronHelpers';
    import {BlockchainsArray, blockchainName} from '../models/Blockchains';
    import {RouteNames} from "../vue/Routing";

    let saveTimeout = null;

    export default {
        data () {return {
            searchTerms:'',
            appData:null,
            images:[],
        }},
        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([
                'keypairs',
            ]),
        },
        mounted(){

        },
        methods:{
	        back(){
	            this.$router.push({name:RouteNames.HOME});
            },
            ...mapActions([

            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .keypair {
        height:calc(100vh - 80px);


    }


</style>
