<template>
    <section>

        <section class="mnemonic" v-if="nextPopIn">
            <pop-in-head :next-pop-in="nextPopIn"></pop-in-head>

            <section class="phrase-box">
              <section class="word" v-for="(word, index) in phraseArray">
                <figure class="text">{{word}}</figure>
                <figure class="num">{{index+1}}</figure>

              </section>
            </section>

        </section>

    </section>
</template>

<script>
    import {RouteNames} from '../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {PopupDisplayTypes} from '../../models/popups/Popup'

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
                'nextPopIn'
            ]),
          phraseArray(){
                if(!this.nextPopIn) return false;
              return this.nextPopIn.data.props.phrase.split(' ');
          }
        },
        methods:{
            returnResult(item){
                this.nextPopIn.data.callback(item);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            parse(item){
                if(typeof item === 'string') return item;
                if(this.nextPopIn.data.props.parser) return this.nextPopIn.data.props.parser(item);

                let props = this.prop.split(".");
                const lastKey = props.pop();
                return props.reduce((obj,key)=> obj[key], item)[lastKey];
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .mnemonic {

        .phrase-box {
            border-top:1px solid $light-grey;
            max-height:280px;
            overflow:hidden;
            padding:30px;

            .word {
                width: 25%;
                float:left;
                padding:15px 0;
                text-align:center;
                border:1px solid rgba(0,0,0,0.05);

                .text {
                    display:block;
                    color:rgba(0,0,0,0.8);
                    font-weight: 600;
                }

                .num {
                    display:block;
                    font-size: 11px;
                    color:rgba(0,0,0,0.4);
                }


            }
        }

    }


</style>
