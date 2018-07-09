<template>
    <section>

        <section class="panel display">
            <section class="head">
                <i class="fa fa-trash-o" @click="removeIdentity" v-tooltip.left-start="'Delete Identity'"></i>
            </section>

            <section class="selected-item scrollable" v-if="identity">

                <figure class="name" :class="{'bad-name':!isValidName}">{{identity.name.length ? identity.name : 'Identity Name Required'}}</figure>
                <figure class="description">This identity is linked to 23 apps.</figure>

                <section class="split-panels left">
                    <section class="info-box">
                        <figure class="header">Identity Information</figure>
                        <cin placeholder="Identity Name ( Username )" :text="identity.name" v-on:changed="changed => bind(changed, 'identity.name')"></cin>
                        <!--<cin placeholder="Username Registered with RIDL" forced="true" disabled="true" :text="identity.name"></cin>-->
                        <!--<btn v-on:clicked="() => {}" text="Release RIDL Identity"></btn>-->

                        <!--<btn v-on:clicked="() => {}" text="Claim RIDL Identity"></btn>-->
                        <!--<btn v-on:clicked="() => {}" text="Register with RIDL"></btn>-->
                        <cin placeholder="Identity's Public Key" forced="true" disabled="true" copy="true" :text="identity.publicKey"></cin>
                    </section>

                    <section class="info-box">
                        <figure class="header">Personal Information</figure>
                        <cin placeholder="First Name" :text="identity.personal.firstname" v-on:changed="changed => bind(changed, 'identity.personal.firstname')"></cin>
                        <cin placeholder="Last Name" :text="identity.personal.lastname" v-on:changed="changed => bind(changed, 'identity.personal.lastname')"></cin>
                        <cin placeholder="Email" :text="identity.personal.email" v-on:changed="changed => bind(changed, 'identity.personal.email')"></cin>
                        <cin placeholder="Date of Birth" type="date" :text="identity.personal.birthdate" v-on:changed="changed => bind(changed, 'identity.personal.birthdate')"></cin>
                    </section>
                </section>

                <section class="split-panels">

                    <section class="info-box">
                        <figure class="header">Location Information</figure>

                        <sel :selected="selectedLocation"
                             :options="identity.locations"
                             :parser="(location) => location.name.length ? location.name : 'Unnamed Location'"
                             v-on:changed="changed => bind(changed, 'selectedLocation')"></sel>

                        <cin placeholder="Location Name" :text="selectedLocation.name" v-on:changed="changed => bind(changed, 'selectedLocation.name')"></cin>

                        <btn v-on:clicked="addLocation" text="Add Another Location" secondary="true"></btn>
                        <btn v-if="identity.locations.length > 1" v-on:clicked="removeLocation" text="Remove Selected Location" red="true"></btn>

                        <cin placeholder="Phone" type="tel" :text="selectedLocation.phone" v-on:changed="changed => bind(changed, 'selectedLocation.phone')"></cin>
                        <cin placeholder="Address" :text="selectedLocation.address" v-on:changed="changed => bind(changed, 'selectedLocation.address')"></cin>
                        <cin placeholder="City" :text="selectedLocation.city" v-on:changed="changed => bind(changed, 'selectedLocation.city')"></cin>
                        <cin placeholder="Postal Code" :text="selectedLocation.zipcode" v-on:changed="changed => bind(changed, 'selectedLocation.zipcode')"></cin>

                        <sel :placeholder="'Country'"
                             :options="countries"
                             :selected="selectedLocation.country"
                             :parser="(obj) => obj.name"
                             v-on:changed="changed => bind(changed, 'selectedLocation.country')"></sel>

                        <cin placeholder="State" v-if="selectedLocation.country.code === 'US'" maxlength="2" :text="selectedLocation.state" v-on:changed="changed => bind(changed, 'selectedLocation.state')"></cin>
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

    let saveTimeout = null;

    export default {
        name: 'Identity',
        data () {return {
            identity:null,
            countries: Countries,
            selectedLocation:null,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
                'accounts',
            ]),
            isValidName(){
                return this.identity && Identity.nameIsValid(this.identity.name);
            }
        },
        mounted(){
            this.identity = this.id.clone();
            this.selectedLocation = this.identity.locations[0];
        },
        methods: {
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

                if(!this.isValidName) return;

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


</style>