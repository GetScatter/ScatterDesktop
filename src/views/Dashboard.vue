<template>
    <section class="dashboard">
        dashboard
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Blockchains, blockchainName, BlockchainsArray} from "../models/Blockchains";
    import PopupService from "../services/utility/PopupService";
    import {Popup} from "../models/popups/Popup";
    import ElectronHelpers from "../util/ElectronHelpers";
    import AccountService from "../services/blockchain/AccountService";
    import KeyPairService from "../services/secure/KeyPairService";

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
