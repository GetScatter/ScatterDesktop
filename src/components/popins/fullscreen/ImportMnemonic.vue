<template>
    <section>
        <section class="full-panel inner center-fold limited">
            <h4>Mnemonic Phrase</h4>

            <section class="mnemonic">
                <cin :text="allWords" v-on:changed="x => allWords = x" />
                <section class="phrase-box">
                    <section class="word" v-for="(word, index) in words" :class="{'red':!word || !word.length}">
                        <figure class="text">
                            {{word}}
                        </figure>
                        <figure class="num">{{index+1}}</figure>

                    </section>
                </section>
            </section>
        </section>

        <section class="action-bar short bottom centered">
            <btn :text="locale(langKeys.GENERIC.Okay)" blue="1" v-on:clicked="returnResult(words.join(' '))" />
        </section>
    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import * as Actions from '../../../store/constants';
	import '../../../styles/popins.scss';
	import PasswordService from "../../../services/PasswordService";
	import PopupService from "../../../services/PopupService";
	import {Popup} from "../../../models/popups/Popup";

	export default {
		props:['popin'],
		data () {return {
			words:[],
            allWords:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([

			]),
			// phraseArray(){
			// 	return this.popin.data.props.mnemonic.split(' ');
			// }
		},
        created(){
	        this.words = new Array(24);
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
        watch:{
			['allWords'](){
				this.words = new Array(24);
				this.allWords.split(' ').map((x,i) => {
					this.words[i] = x;
				})
            }
        }
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .full-panel {
        min-height:calc(100vh - 160px);
    }

    .mnemonic {
        max-width:750px;
        width:100%;
        margin:0 auto;

        .phrase-box {
            border-top:1px solid rgba(0,0,0,0.1);
            max-height:280px;
            overflow:hidden;
            overflow-y:auto;
            padding:5px;
            padding-bottom:0;

            .word {
                width: 16.66%;
                float:left;
                padding:15px 0;
                height:65px;
                text-align:center;
                border:1px solid rgba(0,0,0,0.1);

                .text {
                    height:16px;
                    font-size: 14px;
                    display:block;
                    color:rgba(0,0,0,0.8);
                    font-weight: 600;
                }

                .num {
                    display:block;
                    font-size: 11px;
                    color:rgba(0,0,0,0.5);
                    margin-top:5px;
                }

                &.red {
                    background:$red;
                    .text, .num {
                        color:#fff;
                    }
                }


            }
        }

    }


</style>
