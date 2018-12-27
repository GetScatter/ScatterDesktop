<template>
    <section>

        <PopinHead :popin="popin" :name="popin.data.props.title" />
        <section class="panel centered">
            <br>
            <figure class="description">{{popin.data.props.description}}</figure>

            <br>
            <br>
            <section class="split-inputs">
                <btn :blue="popin.data.props.acceptDeny" :text="popin.data.props.acceptDeny ? locale(langKeys.GENERIC.Yes) : locale(langKeys.GENERIC.Confirm)"
                     v-on:clicked="returnResult(true)" />
                <btn red="1" v-if="popin.data.props.acceptDeny" :text="locale(langKeys.GENERIC.No)"
                     v-on:clicked="returnResult(false)" />
            </section>
        </section>

    </section>
</template>

<script>
    import {RouteNames} from '../../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import {PopupDisplayTypes} from '../../../models/popups/Popup'
    import PopinHead from "./PopinHead";

    export default {
	    components: {PopinHead},
	    data(){ return {

        }},
        mounted(){

        },
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([

            ])
        },
        methods:{
	        returnResult(truthy){
		        this.popin.data.callback(truthy);
		        this[Actions.RELEASE_POPUP](this.popin);
	        },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        props:['popin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .description {
        font-size: 16px;
        text-align:center;
    }

    .split-inputs {
        width:100%;
        button {
            flex:1;
        }
    }

</style>