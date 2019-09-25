<template>
    <section class="view-base">
        <MenuBar v-if="!isPopOut" />

        <section class="app-content" :class="{'popout':isPopOut}">
            <section class="view-pane">
                <router-view class="router-view"></router-view>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import {RouteNames, Routing} from '../vue/Routing'

    import MenuBar              from './MenuBar';


    export default {
    	components:{
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
	        isPopOut(){
            	return this.$route.name === RouteNames.POP_OUT
            }

        },
        mounted(){

        },
        methods:{

        },
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    @import '../styles/variables';


    .app-content {
        height:$fullheight;
        width:100%;
        display:flex;
        background:$white;
        margin-top:40px;
        box-shadow:inset 0 0 0 1px $lightgrey;

        &.popout {
            height:100vh;
            margin-top:0;
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
