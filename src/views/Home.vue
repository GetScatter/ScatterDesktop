<template>
    <section class="home">

        <section class="full-panel home" v-if="keypairs.length">
            <section class="action-bar short">
                <section>
                    <btn text="placeholder"></btn>
                    <!--<btn text="Exchange"></btn>-->
                </section>
                <section>
                    <btn :text="locale(langKeys.DASHBOARD.TOOLBARS.SendButton)"></btn>
                    <btn :text="locale(langKeys.DASHBOARD.TOOLBARS.ReceiveButton)"></btn>
                </section>
            </section>

            <section class="vertical-split">
                <Wallets class="half" />
                <Apps class="half" />
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
            ]),
        },
        methods:{

        }
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .home {
        position:relative;
        display:flex;
        flex-direction: column;

        .vertical-split {
            flex:1;
            display: flex;
            flex-direction: row;

            .half {
                &:first-child {
                    border-right:2px solid #f4f4f4;
                }
            }
        }
        
    }


</style>
