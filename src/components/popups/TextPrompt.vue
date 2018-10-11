<template>
    <section class="pop-in-head">
        <section>
            <figure class="bubble-icon" :class="{'red':nextPopIn.data.props.icon === 'exclamation-triangle'}">
                <i class="fa " :class="`fa-${nextPopIn.data.props.icon}`"></i>
            </figure>
        </section>
        <section>
            <figure class="title">{{nextPopIn.data.props.title}}</figure>
            <figure class="description">{{nextPopIn.data.props.description}}</figure>
        </section>
        <section>
            <btn :text="nextPopIn.data.props.buttonText" :red="true" v-on:clicked="returnResult(returnedText)"></btn>
        </section>
        <section>
            <cin :focus="true" :placeholder="input.placeholder" :type="input.type || 'text'"
                 v-on:enter="returnResult(returnedText)" :text="returnedText"
                 v-on:changed="x => returnedText = x"></cin>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    export default {
        data(){return {
            returnedText:'',
        }},
        computed:{
            input(){
                return this.nextPopIn.data.props.input
            },
            ...mapGetters([

            ])
        },
        methods:{
            returnResult(truthy){
                this.nextPopIn.data.callback(truthy);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        props:['nextPopIn']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .pop-in-head {

        section {

            &:nth-child(4) {
                display:block;
                padding-top:0;
                width:100%;
                flex:0 0 auto;

                section {
                    width:100%;
                    text-align:left;
                    padding:0;
                    margin:0;
                }
            }

        }
    }

</style>
