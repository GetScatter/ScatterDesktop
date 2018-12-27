<template>
    <section>
        <section class="full-panel inner center-fold limited">
            <h4>{{locale(langKeys.POPINS.FULLSCREEN.MNEMONIC.Title)}}</h4>
            <section class="disclaimer less-pad red">
                {{locale(langKeys.POPINS.FULLSCREEN.MNEMONIC.Desc)}}
                <p>{{locale(langKeys.POPINS.FULLSCREEN.MNEMONIC.SubDesc)}}</p>
            </section>



            <section class="mnemonic">
                <cin :text="phraseArray.join(' ')" copy="1" />
                <section class="phrase-box">
                    <section class="word" v-for="(word, index) in phraseArray">
                        <figure class="text">{{word}}</figure>
                        <figure class="num">{{index+1}}</figure>

                    </section>
                </section>
            </section>
        </section>

        <section class="action-bar short bottom centered">
            <btn :text="locale(langKeys.GENERIC.Okay)" blue="1" v-on:clicked="returnResult(null)" />
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
			password:'',
		}},
		computed:{
			...mapState([

			]),
			...mapGetters([

			]),
			phraseArray(){
				return this.popin.data.props.mnemonic.split(' ');
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
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .full-panel {
        min-height:calc(100vh - 160px);
    }

    .mnemonic {

        .phrase-box {
            border-top:1px solid rgba(0,0,0,0.1);
            max-height:280px;
            overflow:hidden;
            padding:20px;
            padding-bottom:0;

            .word {
                width: 25%;
                float:left;
                padding:15px 0;
                text-align:center;
                border:1px solid rgba(0,0,0,0.1);

                .text {
                    display:block;
                    color:rgba(0,0,0,0.8);
                    font-weight: 600;
                }

                .num {
                    display:block;
                    font-size: 11px;
                    color:rgba(0,0,0,0.5);
                }


            }
        }

    }


</style>
