<template>
    <section class="pop-in-head">
        <section>
            <figure class="bubble-icon">
                <i class="fa " :class="`fa-${nextPopIn.data.props.icon}`"></i>
            </figure>
        </section>
        <section>
            <figure class="title">{{nextPopIn.data.props.title}}</figure>
            <figure class="description">{{nextPopIn.data.props.description}}</figure>
        </section>
        <section v-if="nextPopIn.data.props.hasOwnProperty('buttonText')">
            <btn :text="nextPopIn.data.props.buttonText" :red="!nextPopIn.data.props.hasOwnProperty('denyButtonText')" v-on:clicked="returnResult(true)"></btn>
            <btn v-if="nextPopIn.data.props.hasOwnProperty('denyButtonText')" :text="nextPopIn.data.props.denyButtonText" red="1" v-on:clicked="returnResult(false)"></btn>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    export default {
        computed:{
            ...mapGetters([
                'nextPopIn'
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
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../_variables";

    .pop-in-head {

        section {
            vertical-align: middle;
            /*float:left;*/
            display:inline-block;
            text-align:center;
            padding:30px;

            &:nth-child(1) {
                width:100px;
                //border-right:1px solid $light-grey;
            }

            &:nth-child(2) {
                text-align:left;
                max-width:350px;
                padding-left:0;
            }

            &:nth-child(3) {
                padding-left:0;
            }

            button {
                margin:0;
            }

            .bubble-icon {
                display:inline-block;
                height:40px;
                width:40px;
                line-height:40px;
                text-align:center;
                background:$light-grey;
                border-radius:50%;
                color:$mid-dark-grey;
                font-size:14px;
            }

            .title {
                font-size:14px;
                font-weight: bold;
            }

            .description {
                margin-top:8px;
                font-size:12px;
                color:$dark-grey;
            }
        }
    }

</style>