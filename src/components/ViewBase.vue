<template>
    <section class="view-base">

        <Popups />

        <section v-if="isPopout">
            <router-view></router-view>
        </section>

        <section v-else>
            <MenuBar />

            <section class="app-content">
                <Sidebar v-if="unlocked && onboarded" />
                <section class="view-pane">
                    <QuickActions v-if="showQuickActions" />
                    <router-view class="router-view" :class="{'lowered':true, 'floated':unlocked}"></router-view>
                </section>

                <Processes />
            </section>
        </section>

        <section class="working-screen" v-if="workingScreen">
            <figure class="spinner icon-spin4 animate-spin"></figure>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'

    import Processes from './Processes';
    import Popups from './Popups';
    import Sidebar from './Sidebar';
    import QuickActions from './QuickActions';
    import MenuBar from './MenuBar';

    export default {
    	components:{
		    Popups,
		    Processes,
            Sidebar,
		    QuickActions,
		    MenuBar
        },
        data(){ return {
            routeNames:RouteNames,
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
            onboarded(){
                return this.unlocked && this.scatter.onboarded && this.route !== RouteNames.LOGIN
            },
            isPopout(){
                return this.$route.name === 'popout';
            },
            route(){
                return this.$route.name
            },
            showQuickActions(){
            	if(!this.onboarded) return false;
            	return ![
		            RouteNames.ITEMS,
		            RouteNames.NETWORKS,
		            RouteNames.CONTACTS,
		            RouteNames.HISTORIES,
		            RouteNames.RIDL,
		            RouteNames.SETTINGS,
		            RouteNames.PURCHASE,
                ].includes(this.$route.name);
            },

        },
        mounted(){

        },
        methods:{
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{

        }
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
        z-index:1000000;
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
