<template>
    <section class="home">

        <section class="full-panel home" v-if="keypairs.length">
            <section class="action-bar short">
                <section>
                    <btn text="placeholder"></btn>
                    <!--<btn text="Exchange"></btn>-->
                </section>
                <section>
                    <btn v-on:clicked="$router.push({name:RouteNames.TRANSFER})" :text="locale(langKeys.DASHBOARD.TOOLBARS.SendButton)"></btn>
                    <btn :text="locale(langKeys.DASHBOARD.TOOLBARS.ReceiveButton)"></btn>
                </section>
            </section>

            <section class="split-panel">
                <Wallets class="panel" />
                <Apps class="panel" />
            </section>
        </section>

        <section class="full-panel center-fold" v-if="!keypairs.length">
            <section>
                <PiggyWaiting :faster="hoveringAddKeys" />
                <p>{{locale(langKeys.DASHBOARD.KEYS.NoKeys)}}</p>
            </section>
            <section class="action-bar short bottom centered">
                <btn @mouseover.native="hoveringAddKeys = true"
                     @mouseout.native="hoveringAddKeys = false"
                     v-on:clicked="newKeypair" blue="1"
                     style="width:300px;"
                     :text="locale(langKeys.DASHBOARD.KEYS.AddKeysButton)"></btn>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import PiggyWaiting from '../components/svgs/PiggyWaiting'
    import Apps from '../components/panels/home/Apps';
    import Wallets from '../components/panels/home/Wallets';
    import AccountService from "../services/AccountService";


    export default {
    	components:{
    		PiggyWaiting,
		    Wallets,
            Apps,
	    },
        data () {return {
	        hoveringAddKeys:false,
        }},
        computed:{
            ...mapGetters([
                'keypairs',
                'accounts',
            ]),
        },

        created(){
    		console.log('accounts', this.accounts);
    		// const account = this.accounts.find(x => x.name === 'scatterfunds');
    		// if(account) AccountService.removeAccount(account);
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .home {
        position:relative;
        display:flex;
        flex-direction: column;
        
    }


</style>
