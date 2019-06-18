<template>
    <section class="ridl">
        <section class="panel-switch">
            <figure class="button" :class="{'active':state === STATES.RIDL}" @click="switchState(STATES.RIDL)">
                RIDL Network
            </figure>
            <figure class="button" :class="{'active':state === STATES.TOKENS}" @click="switchState(STATES.TOKENS)">
                Get Tokens
            </figure>
        </section>

        <webview v-if="state === STATES.RIDL" class="webview" src="https://ridl.network/" />
        <section class="get-ridl" v-if="state === STATES.TOKENS">
            <GetRIDL />
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import GetRIDL from '../components/misc/GetRIDL';

    const STATES = {
    	RIDL:'ridl',
        TOKENS:'tokens',
    };


    export default {
    	components:{GetRIDL},
    	data(){return {
    		state:STATES.RIDL,
		    STATES
        }},
        methods:{
	        switchState(state){
	        	this.state = state;
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .ridl {
        height:$fullheight;

        .panel-switch {
            margin:0;
        }

        .webview {
            height:calc(#{$fullheight} - 70px);
        }
    }





</style>
