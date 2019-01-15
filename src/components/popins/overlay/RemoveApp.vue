<template>
    <section>

        <PopinHead :popin="popin" :name="locale(langKeys.POPINS.OVERLAY.REMOVE_APP.Title)" />
        <section class="panel centered">
            <section class="split-inputs">
                <figure class="icon" v-if="appData.hasOwnProperty('img')">
                    <img :src="appData.img" />
                </figure>

                <section class="details">
                    <figure class="title">{{appData.name}}</figure>
                    <p>{{locale(langKeys.POPINS.OVERLAY.REMOVE_APP.Desc)}}</p>

                </section>
            </section>

            <br>

            <btn :text="locale(langKeys.GENERIC.Remove)"
                 v-on:clicked="returnResult(true)" />
        </section>

    </section>
</template>

<script>
    import {RouteNames} from '../../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import {PopupDisplayTypes} from '../../../models/popups/Popup'
    import PopinHead from "./PopinHead";
    import AppsService from "../../../services/AppsService";

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

            ]),
            appData(){
            	return AppsService.getAppData(this.popin.data.props.origin);
            }
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

    .icon {
        width:120px;
        padding-right:5px;

        img {
            width:100%;
        }
    }

</style>