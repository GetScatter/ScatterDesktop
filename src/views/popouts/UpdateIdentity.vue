<template>
    <section class="popout-window">
        <PopOutApp :app="popup.data.props.appData" suffix="wants to" />
        <section class="update-identity">
            <section v-if="payload.name">
                <label>Change your identity name</label>
                <figure class="value">{{payload.name}}</figure>
            </section>

            <section v-if="payload.kyc">
                <br>
                <br>
                <label>Add KYC proofs</label>
                <figure class="value">{{payload.kyc.split('::')[0]}}</figure>
                <figure style="font-size: 9px; line-height:6px;" v-for="b in kycBlock" class="value">{{b}}</figure>
            </section>

            <section class="fixed-actions">
                <Button :text="locale(langKeys.GENERIC.Cancel)" big="1" @click.native="returnResult(null)" />
                <Button :text="locale(langKeys.GENERIC.Allow)" blue="1" big="1" @click.native="returnResult(true)" />
            </section>
        </section>



    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import PopOutApp from '../../components/popouts/PopOutApp';
	import SearchBar from '../../components/reusable/SearchBar';
	import {IdentityRequiredFields} from "../../models/Identity";
	import Network from "../../models/Network";
	import RequiredFields from "../../components/popouts/RequiredFields";

	export default {
		props:['popup'],
		components:{
			RequiredFields,
			PopOutApp,
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

    .app-details {
        padding:50px 50px 20px 50px;
    }

    .update-identity {
        text-align:center;
        padding:50px;

        label {
            display:block;
            font-size: $small;
        }

        .value {
            font-size: $medium;
            font-weight: bold;
        }
    }

    .fixed-actions {
        justify-content: space-between;
        display:flex;
    }


</style>
