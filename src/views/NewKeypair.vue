<template>
    <section>

        <back-bar v-on:back="back"></back-bar>

        <!-- SELECT NEW KEY TYPE -->
        <section v-if="state === STATES.SELECT" class="panel-container limited">
            <h1>{{locale(langKeys.DASHBOARD.KEYS.AddKeysButton)}}</h1>

            <br>
            <br>

            <FullWidthRow :items="newKeyTypes" />
        </section>

        <!-- IMPORT KEYPAIR SELECTOR -->
        <section v-if="state === STATES.IMPORT" class="panel-container limited">
            <h1>{{locale(langKeys.ADD_KEYS.SELECT.ImportButton)}}</h1>

            <br>
            <br>

            <FullWidthRow :items="importTypes" key="select" v-if="importState === IMPORT_STATES.SELECT" />
            <ImportTextKey key="text" v-if="importState === IMPORT_STATES.TEXT" v-on:keypair="insertKeypair" />
            <ImportHardwareKey key="text" v-if="importState === IMPORT_STATES.HARDWARE" v-on:keypair="insertKeypair" />
            <ImportQRKey key="text" v-if="importState === IMPORT_STATES.QR" v-on:keypair="insertKeypair" />
        </section>

        <!-- IMPORT KEYPAIR SELECTOR -->
        <CreateEosAccount v-if="state === STATES.CREATE_EOS" />

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import FullWidthRow from '../components/reusable/FullWidthRow';
    import CreateEosAccount from '../components/panels/keypair/CreateEosAccount';
    import ImportTextKey from '../components/panels/keypair/import/ImportTextKey';
    import ImportHardwareKey from '../components/panels/keypair/import/ImportHardwareKey';
    import ImportQRKey from '../components/panels/keypair/import/ImportQRKey';
    import IdGenerator from "../util/IdGenerator";
    import KeyPairService from "../services/KeyPairService";
    import AccountService from "../services/AccountService";
    import Keypair from "../models/Keypair";

    const STATES = {
    	SELECT:'select',
        CREATE_EOS:'createEos',
        IMPORT:'import',
    };

    const IMPORT_STATES = {
    	SELECT:'select',
    	TEXT:'text',
    	HARDWARE:'hardware',
    	QR:'qr',
    };

    export default {
	    components:{
		    FullWidthRow,
		    ImportTextKey,
		    ImportHardwareKey,
		    ImportQRKey,
		    CreateEosAccount
	    },
        data () {return {
	        name:'',

            newKeyTypes:[],
            state:STATES.SELECT,
	        STATES,

            importTypes:[],
            importState:IMPORT_STATES.SELECT,
	        IMPORT_STATES,
        }},
        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([
                'keypairs',
            ]),
        },
        mounted(){
        	const locale = this.locale;
        	const {SELECT, IMPORT} = this.langKeys.ADD_KEYS;

	        this.newKeyTypes = [
		        {icon:'', title:locale(SELECT.CreateTitle), description:locale(SELECT.CreateDescription), actions:[{name:locale(SELECT.CreateButton), handler:this.generateNewKeypair}]},
		        {icon:'', title:locale(SELECT.ImportTitle), description:locale(SELECT.ImportDescription), actions:[{name:locale(SELECT.ImportButton), handler:() => this.state = STATES.IMPORT}]},
		        {icon:'', title:locale(SELECT.CreateEosTitle), description:locale(SELECT.CreateEosDescription), actions:[{name:locale(SELECT.CreateEosButton), handler:() => this.state = STATES.CREATE_EOS}]},
	        ];

	        this.importTypes = [
		        {icon:'', title:locale(IMPORT.TextTitle), description:locale(IMPORT.TextDescription), actions:[{name:locale(IMPORT.TextButton), handler:() => this.importState = IMPORT_STATES.TEXT}]},
		        {icon:'', title:locale(IMPORT.HardwareTitle), description:locale(IMPORT.HardwareDescription), actions:[{name:locale(IMPORT.HardwareButton), handler:() => this.importState = IMPORT_STATES.HARDWARE}]},
		        {icon:'', title:locale(IMPORT.QrTitle), description:locale(IMPORT.QrDescription), actions:[{name:locale(IMPORT.QrButton), handler:() => this.importState = IMPORT_STATES.QR}]},
	        ];

        },
        methods:{
	        back(){
	        	if(this.importState !== IMPORT_STATES.SELECT) return this.importState = IMPORT_STATES.SELECT;
	        	if(this.state !== STATES.SELECT) return this.state = STATES.SELECT;
	            this.$router.push({name:this.RouteNames.HOME});
            },
            async generateNewKeypair(){
	        	this.setWorkingScreen(true);
	        	const keypair = Keypair.placeholder();
	            await KeyPairService.generateKeyPair(keypair);
	            await KeyPairService.makePublicKeys(keypair);
	            this.insertKeypair(keypair, true);
            },
            async insertKeypair(keypair, isNewKeypair = false){
	            const isHardware = !!keypair.external;
	            const existing = this.keypairs.find(x => {
		            const existingHardware = isHardware && x.external && keypair.external.publicKey === x.external.publicKey;
		            return existingHardware || (x.keyHash === keypair.keyHash && x.id !== keypair.id)
	            });

	            if(existing){
		            this.status = null;
		            this.error = `This Private Key already exists under the name ${existing.name}`;
		            return false;
	            }

	            keypair.name = `Wallet-${IdGenerator.text(10)}`;


	            await KeyPairService.saveKeyPair(keypair);
	            await AccountService.importAllAccounts(keypair, isNewKeypair);
	            this.$router.push({name:this.RouteNames.KEYPAIR, params:{id:keypair.id}})
	            setTimeout(() => {
		            this.setWorkingScreen(false);
                }, 200);

            },
            ...mapActions([

            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

</style>
