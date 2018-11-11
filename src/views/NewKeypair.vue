<template>
    <section>

        <back-bar v-on:back="back"></back-bar>

        <transition name="slide-left" mode="out-in">
            <!-- SELECT NEW KEY TYPE -->
            <section key="select" v-if="state === STATES.SELECT" class="panel-container">
                <h1>Add Keys</h1>

                <br>
                <br>

                <FullWidthRow :items="newKeyTypes" />
            </section>

            <!-- IMPORT KEYPAIR SELECTOR -->
            <section key="import" v-if="state === STATES.IMPORT" class="panel-container">
                <cin big="1"
                     :label="locale(langKeys.ADD_KEYS.IMPORT.NameLabel)"
                     :placeholder="locale(langKeys.ADD_KEYS.IMPORT.NamePlaceholder)"
                     :text="name" v-on:changed="x => name = x"></cin>

                <br>
                <br>

                <transition name="slide-left" mode="out-in">
                    <FullWidthRow :items="importTypes" key="select" v-if="importState === IMPORT_STATES.SELECT" />
                    <ImportTextKey key="text" v-if="importState === IMPORT_STATES.TEXT" v-on:keypair="insertKeypair" />
                    <ImportHardwareKey key="text" v-if="importState === IMPORT_STATES.HARDWARE" v-on:keypair="insertKeypair" />
                    <ImportQRKey key="text" v-if="importState === IMPORT_STATES.QR" v-on:keypair="insertKeypair" />
                </transition>
            </section>
        </transition>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'
    import FullWidthRow from '../components/reusable/FullWidthRow';
    import ImportTextKey from '../components/panels/keypair/import/ImportTextKey';
    import ImportHardwareKey from '../components/panels/keypair/import/ImportHardwareKey';
    import ImportQRKey from '../components/panels/keypair/import/ImportQRKey';
    import IdGenerator from "../util/IdGenerator";
    import KeyPairService from "../services/KeyPairService";
    import AccountService from "../services/AccountService";
    import Keypair from "../models/Keypair";

    const STATES = {
    	SELECT:'select',
    	CREATE:'create',
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
        data () {return {
	        name:'',

            newKeyTypes:[],
            state:STATES.SELECT,
	        STATES,

            importTypes:[],
            importState:IMPORT_STATES.SELECT,
	        IMPORT_STATES,
        }},
	    components:{
		    FullWidthRow,
		    ImportTextKey,
		    ImportHardwareKey,
		    ImportQRKey
	    },
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
		        {icon:'', title:locale(SELECT.CreateTitle), description:locale(SELECT.CreateDescription), action:locale(SELECT.CreateButton), handler:this.generateNewKeypair},
		        {icon:'', title:locale(SELECT.ImportTitle), description:locale(SELECT.ImportDescription), action:locale(SELECT.ImportButton), handler:() => this.state = STATES.IMPORT},
		        {icon:'', title:locale(SELECT.CreateEosTitle), description:locale(SELECT.CreateEosDescription), action:locale(SELECT.CreateEosButton), handler:() => this.state = STATES.CREATE},
	        ];

	        this.importTypes = [
		        {icon:'', title:locale(IMPORT.TextTitle), description:locale(IMPORT.TextDescription), action:locale(IMPORT.TextButton), handler:() => this.importState = IMPORT_STATES.TEXT},
		        {icon:'', title:locale(IMPORT.HardwareTitle), description:locale(IMPORT.HardwareDescription), action:locale(IMPORT.HardwareButton), handler:() => this.importState = IMPORT_STATES.HARDWARE},
		        {icon:'', title:locale(IMPORT.QrTitle), description:locale(IMPORT.QrDescription), action:locale(IMPORT.QrButton), handler:() => this.importState = IMPORT_STATES.QR},
	        ];

        },
        methods:{
	        back(){
	        	if(this.importState !== IMPORT_STATES.SELECT) return this.importState = IMPORT_STATES.SELECT;
	        	if(this.state !== STATES.SELECT) return this.state = STATES.SELECT;
	            this.$router.push({name:RouteNames.HOME});
            },
            async generateNewKeypair(){
	        	this.setWorkingScreen(true);
	        	const keypair = Keypair.placeholder();
	            await KeyPairService.generateKeyPair(keypair);
	            await KeyPairService.makePublicKeys(keypair);
	            this.insertKeypair(keypair);
            },
            async insertKeypair(keypair){
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

	            keypair.name = this.name.trim().length ? this.name.trim() : `VaultEntry-${IdGenerator.text(10)}`;


	            if(this.keypairs.find(x => x.name.toLowerCase() === keypair.name.toLowerCase()))
	            	return 'A Vault Entry with this name already exists.';


	            await KeyPairService.saveKeyPair(keypair);
	            await AccountService.importAllAccounts(keypair);
	            this.setWorkingScreen(false);
	            this.$router.push({name:RouteNames.KEYPAIR, params:{id:keypair.id}})

            },
            ...mapActions([

            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

</style>
