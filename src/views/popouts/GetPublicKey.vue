<template>
    <section class="popout-window">
        <PopOutApp :app="popup.data.props.appData" suffix="wants you to provide a public key" />

        <section class="get-public-key">

            <Button blue="1" big="1" text="Select a Key" @click.native="selectKeypair" />
            <figure class="or">
                <figure class="text">or</figure>
            </figure>
            <Button blue="1" big="1" text="Generate a Key" @click.native="generateNewKey" />
        </section>

    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
	import SearchBar from '../../components/reusable/SearchBar';
	import {IdentityRequiredFields} from "../../models/Identity";
	import Network from "../../models/Network";
	import RequiredFields from "../../components/popouts/RequiredFields";
	import KeyPairService from "../../services/secure/KeyPairService";
	import Keypair from "../../models/Keypair";
	import IdGenerator from "../../util/IdGenerator";
	import PopOutApp from "../../components/popouts/PopOutApp";
	import PopupService from "../../services/utility/PopupService";
	import {Popup} from "../../models/popups/Popup";

	export default {
		props:['popup', 'expanded'],
		components:{
			PopOutApp,
			RequiredFields,
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
		},
		methods: {
			returnResult(result){
				this.$emit('returned', result);
			},
			selectKeypair(){
                PopupService.push(Popup.selectKeypair(keypair => {
                    if(keypair) this.returnResult({keypair, isNew:false});
                }, [this.blockchain]));
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

    .app-details {
        padding:50px 50px 20px 50px;
    }

    .get-public-key {
        text-align:center;
        padding:50px;
    }

</style>
