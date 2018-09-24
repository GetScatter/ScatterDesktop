<template>
    <section>

        <section class="prompt" v-if="nextPopIn">
            <section class="pop-in-head">
                <section>
                    <figure class="bubble-icon">
                        <i class="fa fa-check"></i>
                    </figure>
                </section>
                <section>
                    <figure class="title">Success!</figure>
                    <figure class="description" style="cursor:pointer;" @click="open"><u>{{tx}}</u></figure>
                </section>
                <section>
                    <btn text="Okay" v-on:clicked="returnResult(true)"></btn>
                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import {RouteNames} from '../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import ElectronHelpers from '../../util/ElectronHelpers'

    export default {
        data(){ return {

        }},
        mounted(){

        },
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([
                'nextPopIn',
                'explorers',
            ]),
            tx(){
                return this.nextPopIn.data.props.tx
            },
            blockchain(){
                return this.nextPopIn.data.props.blockchain
            }
        },
        methods:{
            returnResult(truthy){
                this.nextPopIn.data.callback(truthy);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            open(){
                ElectronHelpers.openLinkInBrowser(this.explorers[this.blockchain].transaction(this.tx));
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .prompt {



    }

</style>