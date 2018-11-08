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
                <cin big="1" placeholder="Name your key" label="Vault Entry Name"></cin>

                <br>
                <br>

                <transition name="slide-left" mode="out-in">
                    <FullWidthRow :items="importTypes" key="select" v-if="importState === IMPORT_STATES.SELECT" />
                    <ImportTextKey key="text" v-if="importState === IMPORT_STATES.TEXT" />
                    <ImportHardwareKey key="text" v-if="importState === IMPORT_STATES.HARDWARE" />
                    <ImportQRKey key="text" v-if="importState === IMPORT_STATES.QR" />
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
    import ImportTextKey from '../components/panels/keypair/ImportTextKey';
    import ImportHardwareKey from '../components/panels/keypair/ImportHardwareKey';
    import ImportQRKey from '../components/panels/keypair/ImportQRKey';

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
    	components:{
    		FullWidthRow,
		    ImportTextKey,
		    ImportHardwareKey,
		    ImportQRKey
        },
        data () {return {
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
	        this.newKeyTypes = [
		        {icon:'', title:'Create a new key', description:`We'll create a set of keys that you can use on any blockchain.`,
                    action:'Create a Key', handler:() => this.state = STATES.CREATE},
		        {icon:'', title:'Import an existing key', description:'If you already have a key and want to import it into Scatter',
                    action:'Import a Key', handler:() => this.state = STATES.IMPORT},
		        {icon:'', title:'Create a new EOS account', description:`We'll quickly generate two keys for you`,
                    action:'Create account', handler:() => this.state = STATES.CREATE},
	        ];

	        this.importTypes = [
		        {icon:'', title:'Import private key as text', description:`If you would like to type in or paste in your private key`,
                    action:'Text', handler:() => this.importState = IMPORT_STATES.TEXT},
		        {icon:'', title:'Import from hardware wallet', description:'If you have a supported hardware wallet',
                    action:'Hardware', handler:() => this.importState = IMPORT_STATES.HARDWARE},
		        {icon:'', title:'Import private key from a QR code', description:`If you have an encrypted paper wallet QR code`,
                    action:'QR', handler:() => this.importState = IMPORT_STATES.QR},
	        ];

        },
        methods:{
	        back(){
	        	if(this.importState !== IMPORT_STATES.SELECT) return this.importState = IMPORT_STATES.SELECT;
	        	if(this.state !== STATES.SELECT) return this.state = STATES.SELECT;
	            this.$router.push({name:RouteNames.HOME});
            },
            ...mapActions([

            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

</style>
