<template>
    <section>

        <section v-if="identity">
            <section class="head">
                <i class="fa fa-trash-o" v-if="!isNew && identity.ridl === -1" @click="removeIdentity" v-tooltip="'Delete Identity'"></i>
            </section>

            <section class="selected-item scrollable">

                <section class="panel-shifter">
                    <section class="info-box top" style="margin-bottom:10px;">
                        <cin :disabled="identity.ridl > 0" big="true" placeholder="Identity Name ( Username )" :text="identity.name" v-on:changed="changed => bind(changed, 'identity.name')"></cin>

                        <btn v-if="ridlActive && identity.ridl > 0" red="true" v-on:clicked="releaseRIDLIdentity" text="Release RIDL Identity"></btn>
                        <btn v-if="ridlActive && !isNew && identity.ridl <= 0" secondary="true" v-on:clicked="registerWithRIDL" text="Register / Claim RIDL Identity"></btn>
                    </section>

                    <section class="shifter-options">
                        <figure class="shifter-option" v-for="p in PANELS" @click="panel = p" :class="{'active':panel === p}">{{p}}</figure>
                    </section>

                    <section class="shited-panel" v-if="panel === PANELS.PROOFS">
                        <section class="info-box">
                            <cin disabled="true" copy="true" :text="identity.publicKey"></cin>
                            <btn v-if="!isNew" v-on:clicked="generateQr" :text="`Generate Encrypted QR`"></btn>
                            <section style="width:100%; margin-left:-15px;"><img :src="qr" /></section>
                        </section>
                    </section>

                    <section class="shited-panel" v-if="panel === PANELS.PERSONAL">
                        <section class="info-box">
                            <cin placeholder="First Name" :text="identity.personal.firstname" v-on:changed="changed => bind(changed, 'identity.personal.firstname')"></cin>
                            <cin placeholder="Last Name" :text="identity.personal.lastname" v-on:changed="changed => bind(changed, 'identity.personal.lastname')"></cin>
                            <cin placeholder="Email" :text="identity.personal.email" v-on:changed="changed => bind(changed, 'identity.personal.email')"></cin>
                            <cin placeholder="Date of Birth" type="date" :text="identity.personal.birthdate" v-on:changed="changed => bind(changed, 'identity.personal.birthdate')"></cin>
                        </section>
                    </section>

                    <section class="shited-panel" v-if="panel === PANELS.LOCATION">
                        <section class="info-box">

                            <sel :selected="selectedLocation"
                                 :options="identity.locations"
                                 :parser="(location) => location.name.length ? location.name : 'Unnamed Location'"
                                 v-on:changed="changed => bind(changed, 'selectedLocation')"></sel>

                            <cin placeholder="Location Name" :text="selectedLocation.name" v-on:changed="changed => bind(changed, 'selectedLocation.name')"></cin>

                            <btn v-on:clicked="addLocation" text="Add Another Location" secondary="true"></btn>
                            <btn v-if="identity.locations.length > 1" v-on:clicked="removeLocation" text="Remove Selected Location" red="true"></btn>

                            <br><br>

                            <sel :placeholder="'Country'"
                                 :options="countries"
                                 :selected="selectedLocation.country"
                                 :parser="(obj) => obj.name"
                                 v-on:changed="changed => bind(changed, 'selectedLocation.country')"></sel>

                            <br>
                            <figure style="clear:both;"></figure>

                            <cin placeholder="Phone" type="tel" :text="selectedLocation.phone" v-on:changed="changed => bind(changed, 'selectedLocation.phone')"></cin>
                            <cin placeholder="Address" :text="selectedLocation.address" v-on:changed="changed => bind(changed, 'selectedLocation.address')"></cin>
                            <cin placeholder="City" :text="selectedLocation.city" v-on:changed="changed => bind(changed, 'selectedLocation.city')"></cin>
                            <cin :class="selectedLocation.country.code === 'US' ? 'quarter' : 'half'" placeholder="Postal Code" :text="selectedLocation.zipcode" v-on:changed="changed => bind(changed, 'selectedLocation.zipcode')"></cin>
                            <cin class="quarter" placeholder="State" v-if="selectedLocation.country.code === 'US'" maxlength="2" :text="selectedLocation.state" v-on:changed="changed => bind(changed, 'selectedLocation.state')"></cin>

                            <br><br>
                        </section>
                    </section>

                </section>



              </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import {Countries} from '../../data/Countries'
    import Identity from '../../models/Identity'
    import {LocationInformation} from '../../models/Identity'

    import {Popup} from '../../models/popups/Popup'
    import PopupService from '../../services/PopupService';
    import RIDLService from '../../services/RIDLService';
    import QRService from '../../services/QRService';

    let saveTimeout = null;

    const PANELS = {
        PERSONAL:'Personal',
        LOCATION:'Locations',
        PROOFS:'Proofs'
    }

    export default {
        name: 'Identity',
        data () {return {
            panel:PANELS.PERSONAL,
            PANELS:PANELS,
            ridlActive:false,
            identity:null,
            countries: Countries,
            selectedLocation:null,
            ridlIdentity:null,
            qr:'',
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
                'accounts',
                'permissions'
            ]),
            isValidName(){
                return this.identity && Identity.nameIsValid(this.identity.name);
            },
            connectedApps(){
                return this.permissions.filter(x => x.isIdentity && x.identity === this.identity.publicKey).length
            },
            isNew(){
                return !this.scatter.keychain.findIdentity(this.identity.publicKey);
            }
        },
        mounted(){
            this.identity = this.id.clone();
            this.selectedLocation = this.identity.locations[0];

            RIDLService.canConnect().then(bool => {
                if(bool) {
                    this.ridlActive = true;
                    if(this.identity.ridl > 0) RIDLService.getIdentity(this.identity).then(id => {
                        if(id && id.key === this.identity.publicKey) this.ridlIdentity = id;
                    })
                }

            })
        },
        methods: {
            async generateQr(){
                this.qr = await QRService.createQR(this.identity.privateKey)
            },
            async registerWithRIDL(){
                RIDLService.identify(this.identity);
            },
            async releaseRIDLIdentity(){
                RIDLService.release(this.identity);
            },
            addLocation(){
                const location = LocationInformation.placeholder();
                this.identity.locations.push(location);
                this.selectedLocation = location;
            },
            removeLocation(){
                this.identity.locations = this.identity.locations.filter(x => x.id !== this.selectedLocation.id);
                this.selectedLocation = this.identity.locations[0];
            },
            async removeIdentity(){
                PopupService.promptGuard(Popup.prompt(
                    "Deleting Identity", "This will delete this Identity, as well as all associated permissions.",
                    "trash-o", "Delete Identity"
                ), async accepted => {
                    if(!accepted) return;

                    // TODO: Remove Origin Permissions

                    const scatter = this.scatter.clone();
                    scatter.keychain.removeIdentity(this.identity);
                    this[Actions.SET_SCATTER](scatter);
                    this.$emit('deleted');
                    PopupService.push(Popup.snackbar("Identity Removed!", "check"));
                });

            },
            save(){
                const oldIdentity = this.scatter.keychain.findIdentity(this.identity.publicKey);
                if (oldIdentity && !JSON.stringify(oldIdentity) === JSON.stringify(this.identity))
                    return;

                if(this.scatter.keychain.identities.find(id => id.publicKey !== this.identity.publicKey && id.name.toLowerCase() === this.identity.name.toLowerCase()))
                    return;

                if(!this.isValidName) return PopupService.push(Popup.invalidIdentityName());

                const scatter = this.scatter.clone();
                scatter.keychain.updateOrPushIdentity(this.identity);
                this[Actions.SET_SCATTER](scatter);
                PopupService.push(Popup.snackbar("Identity Saved!", "check"));
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['id'],
        watch:{
            'identity':{
                handler(a,b){
                    if(!b) return;
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        this.save();
                    }, 500);
                },
                deep:true
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .half {
        width:50% !important;
        display:inline-block;

        &:nth-child(odd){
            width: calc(50% - 20px) !important;
            margin-left: 15px;
        }
    }

    .quarter {
        width: calc(25% - 10px) !important;
        display: inline-block;
        margin-left: 6px;

        &:nth-child(odd){
            width: calc(25% - 20px) !important;
            margin-left: 15px;
        }
    }
</style>
