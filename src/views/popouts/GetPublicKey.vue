<template>
    <section>
        <PopOutHead v-on:closed="returnResult" />
        <section class="multi-pane">
            <section class="main-panel">
                <PopOutAction :origin="popup.origin()" action="public key" />

                <section class="padded">
                    <btn blue="1" :text="locale(langKeys.POPOUTS.GET_KEY.GenerateKeyButton)" v-on:clicked="generateNewKey" />
                    <br>
                    <br>
                </section>

                <SearchBar short="1" :placeholder="locale(langKeys.POPOUTS.GET_KEY.SearchPlaceholder)" v-on:terms="x => searchTerms = x" />

                <section class="popout-list">
                    <FullWidthRow :items="validKeys" popout="1" />
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
	import KeyPairService from "../../services/KeyPairService";
	import Keypair from "../../models/Keypair";
	import IdGenerator from "../../util/IdGenerator";

	export default {
		props:['popup', 'expanded'],
		components:{
			RequiredFields,
			PopOutHead,
			PopOutAction,
			FullWidthRow,
			SearchBar,
		},
		data () {return {
			searchTerms:'',
		}},
		created(){

		},
		computed: {
			...mapState([
				'scatter'
			]),
			...mapGetters([
				'identity',
				'identities',
				'accounts',
				'networks',
                'keypairs',
			]),
			payload(){ return this.popup.payload(); },
            blockchain(){ return this.payload.blockchain; },
			validKeys() {

				return this.keypairs
                    .filter(keypair => keypair.publicKeys.some(x => x.blockchain === this.blockchain))
                    .filter(keypair => keypair.name.toLowerCase().indexOf(this.searchTerms) > -1)
                    .map(keypair => {
                    	const publicKey = keypair.publicKeys.find(x => x.blockchain === this.blockchain).key;

	                    return {
		                    title:keypair.name,
		                    description:publicKey,
		                    actions:[{
			                    name:this.locale(this.langKeys.GENERIC.Select),
			                    handler:() => this.selectKeypair(keypair),
			                    blue:1,
			                    small:1,
		                    }]
	                    }
                    })

			},
		},
		methods: {
			returnResult(result){
				this.$emit('returned', result);
			},
			selectKeypair(keypair){
                this.returnResult({keypair, isNew:false});
            },
			async generateNewKey(){
				this.setWorkingScreen(true);
				setTimeout(async () => {
					const keypair = Keypair.placeholder();
					keypair.name = `${this.popup.origin()}-${IdGenerator.text(4)}`;
					await KeyPairService.generateKeyPair(keypair);
					await KeyPairService.makePublicKeys(keypair);
					keypair.blockchains = [this.blockchain];
					this.returnResult({keypair, isNew:true});
                }, 50);
            },
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../styles/variables";

    .padded {
        padding:0 30px;
    }

    .popout-list {
        padding-top:0;

        &.done {
            opacity:0.3;

            &:hover {
                opacity:1;
            }
        }


        .search-bar {
            margin-left:-30px;
        }
    }

</style>
