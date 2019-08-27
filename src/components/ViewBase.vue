<template>
    <section class="view-base">
        <Popups />

        <router-view v-if="isPopout"></router-view>

        <section v-else>
            <MenuBar />

            <section class="app-content">
                <section class="view-pane">
                    <router-view class="router-view"></router-view>
                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import {RouteNames, Routing} from '../vue/Routing'

    import MenuBar              from './MenuBar';
    import Popups from './Popups';


    export default {
    	components:{
		    Popups,
		    MenuBar
        },
        data(){ return {
            routeNames:RouteNames,
	        initialized:false,
        }},
        computed:{
            ...mapState([
                'scatter',
                'workingScreen',
                'processes'
            ]),
            ...mapGetters([
                'unlocked',
            ]),
            isPopout(){
                return this.$route.name === 'popout';
            },

        },
        mounted(){

        },
        methods:{

        },
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    @import '../styles/variables';

    .working-screen {
        background:rgba(255,255,255,0.93);
        position:fixed;
        top:40px;
        left:0;
        right:0;
        bottom:0;
        z-index:10001;
        display:flex;
        justify-content: center;
        align-items: center;
        text-align: center;

        .spinner {
            font-size: 36px;
            color:$blue;
        }
    }

    .app-content {
        height:$fullheight;
        width:100%;
        display:flex;
        background:$white;
        margin-top:40px;
        box-shadow:inset 0 0 0 1px $lightgrey;

        &.no-menu {

        }
    }

    .view-base {
        min-height:100vh;
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    .view-pane {
        flex:1;
        position: relative;
        overflow-y: auto;
    }

    .floated {
        flex:1;
    }


</style>
