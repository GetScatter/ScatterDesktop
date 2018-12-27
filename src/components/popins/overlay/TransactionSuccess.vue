<template>
    <section>

        <PopinHead :popin="popin" :name="locale(langKeys.POPINS.OVERLAY.TRX_SUCCESS.Title)" />
        <section class="panel centered">
            <br>
            <img src="../../../assets/piggy_bank.png" />
            <br>
            <label>{{locale(langKeys.POPINS.OVERLAY.TRX_SUCCESS.Desc, explorer.name)}}</label>
            <figure class="description" style="cursor:pointer;" @click="open"><u>{{tx}}</u></figure>

            <br>
            <br>
            <btn :text="locale(langKeys.GENERIC.Okay)"
                 v-on:clicked="returnResult(true)" />
        </section>


    </section>
</template>

<script>
    import {RouteNames} from '../../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import ElectronHelpers from '../../../util/ElectronHelpers'
    import PopinHead from "./PopinHead";

    export default {
	    components: {PopinHead},
	    props:['popin'],
        data(){ return {

        }},
        mounted(){

        },
        computed:{
            ...mapGetters([
                'explorers',
            ]),
            tx(){
                return this.popin.data.props.tx
            },
            blockchain(){
                return this.popin.data.props.blockchain
            },
	        explorer(){
            	return this.explorers[this.blockchain].parsed()
            }
        },
        methods:{
            returnResult(truthy){
                this.popin.data.callback(truthy);
                this[Actions.RELEASE_POPUP](this.popin);
            },
            open(){
                ElectronHelpers.openLinkInBrowser(this.explorer.transaction(this.tx));
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .description {
        color:$primary;
        text-align:center;
        font-size: 9px;

        &:hover {
            color:$secondary;
        }
    }

</style>