<template>
    <section>
        <PopOutHead v-on:closed="returnResult" />
        <section class="multi-pane">
            <section class="main-panel">
                <PopOutAction :origin="popup.origin()" action="update identity" />

                <section class="changing" v-if="payload.name">
                    <figure class="field">Changing Identity Name</figure>
                    <figure class="value">{{payload.name}}</figure>
                </section>

                <section class="changing" v-if="payload.kyc">
                    <br>
                    <br>
                    <figure class="field">Adding KYC proof</figure>
                    <figure class="value">{{payload.kyc.split('::')[0]}}</figure>
                    <!--<figure style="font-size: 9px;" class="value">{{payload.kyc.split('::')[1]}}</figure>-->
                    <figure style="font-size: 9px; line-height:6px;" v-for="b in kycBlock" class="value">{{b}}</figure>
                </section>

                <section style="padding:0 30px;">
                    <br>
                    <br>

                    <section class="fixed-actions">
                        <btn :text="locale(langKeys.GENERIC.Confirm)" blue="1" big="1" v-on:clicked="returnResult(true)" />
                        <btn :text="locale(langKeys.GENERIC.Deny)" red="1" v-on:clicked="returnResult(null)" />
                    </section>
                </section>
            </section>
        </section>

    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import PopOutHead from '../../components/popouts/PopOutHead';
	import PopOutAction from '../../components/popouts/PopOutAction';
	import SearchBar from '../../components/reusable/SearchBar';
	import FullWidthRow from '../../components/reusable/FullWidthRow';
	import {IdentityRequiredFields} from "../../models/Identity";
	import Network from "../../models/Network";
	import RequiredFields from "../../components/popouts/RequiredFields";

	export default {
		props:['popup'],
		components:{
			RequiredFields,
			PopOutHead,
			PopOutAction,
			FullWidthRow,
			SearchBar,
		},
		data () {return {

		}},
		created(){

		},
		computed: {
			...mapState([
				'scatter',
				'balances'
			]),
			...mapGetters([
				'identity',
				'identities',
				'accounts',
				'networks'
			]),
			payload(){ return this.popup.payload(); },
            kycBlock(){
				if(!this.payload.kyc) return [];
				let c=0;
				return this.payload.kyc.split('::')[1].split('').reduce((acc,x,i) => {
					if(i>1&&i%24===0) c++;
					if(!acc.hasOwnProperty(c)) acc[c]='';
					acc[c] += x;
					return acc;
                }, [])
            }
		},
		methods: {
			returnResult(result){
				this.$emit('returned', result);
			},

		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../styles/variables";

    .changing {
        display:flex;
        flex:0 0 auto;
        padding:0 30px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-bottom:10px;
        margin-top:-10px;

        .field {
            font-size: 11px;
            font-weight: bold;
        }

        .value {
            font-size: 18px;
            margin-top:10px;
        }


    }


</style>
