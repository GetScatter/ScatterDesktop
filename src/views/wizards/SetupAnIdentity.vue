<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">
                <i class="fa fa-chevron-left" @click="$router.back()"></i>
            </section>

            <section class="items-list scrollable">
                <section class="item"
                         :class="{'active':onStep.ref === step.ref}"
                         v-for="step in steps" @click="scrollTo(step)">
                    <figure class="title">{{step.title}}</figure>
                    <figure class="description">{{step.description}}</figure>
                </section>
            </section>
        </section>


        <section class="panel display">
            <section class="head">
                <i class="fa fa-check" :class="{'blue':isValidName}" @click="save"></i>
            </section>

            <section ref="scroller" class="selected-item scrollable" v-if="identity">

                <section :ref="steps.WHAT.ref">
                    <figure class="name">What is a Scatter Identity?</figure>
                    <section class="description">
                        Scatter makes applications <u>Request an Identity</u> before they can retrieve any information from you. This sets up a sort of permission for them
                        to interact with you and blacklists all non-permissioned applications from interacting with your Scatter.
                        <br><br>
                        In comparison, MetaMask ( for instance ) gives away your public Ethereum key to every website you visit; whether they are on the blockchain on or not, and allows them to
                        aggregate data about your funds and activity on the blockchain.
                    </section>
                    <br><br>
                </section>

                <section :ref="steps.NAME.ref" class="info-box">
                    <figure class="name">Identity Name</figure>
                    <section class="description">
                        <b class="red"><u>Mandatory!</u></b><br><br>
                        Identity names are your <b>Username</b> for application. Think of it like the player name for a game, or your name on a forum.
                    </section>

                    <cin v-on:blur="checkName" placeholder="Identity Name" :text="identity.name" v-on:changed="changed => bind(changed, 'identity.name')"></cin>
                </section>

                <section :ref="steps.PERSONAL.ref" class="info-box">
                    <figure class="name">Personal Information</figure>
                    <section class="description">
                        <b class="red">Personal information is <u>NOT</u> mandatory!</b><br><br>
                        Some applications need personal information from you to complete certain transactions, such as a shopping website that needs your full name to send you
                        physical goods. They can get this information directly from Scatter without you having to type it in to forms on their website.
                    </section>

                    <cin placeholder="First Name" :text="identity.personal.firstname" v-on:changed="changed => bind(changed, 'identity.personal.firstname')"></cin>
                    <cin placeholder="Last Name" :text="identity.personal.lastname" v-on:changed="changed => bind(changed, 'identity.personal.lastname')"></cin>
                    <cin placeholder="Email" :text="identity.personal.email" v-on:changed="changed => bind(changed, 'identity.personal.email')"></cin>
                    <cin placeholder="Date of Birth" type="date" :text="identity.personal.birthdate" v-on:changed="changed => bind(changed, 'identity.personal.birthdate')"></cin>
                </section>

                <section :ref="steps.LOCATION.ref" class="info-box">
                    <figure class="name">Location Information</figure>
                    <section class="description">
                        <b class="red">Location information is <u>NOT</u> mandatory!</b><br><br>
                        Some applications need personal information from you to complete certain transactions, such as a shopping website that needs your full name to send you
                        physical goods. They can get this information directly from Scatter without you having to type it in to forms on their website.
                    </section>

                    <cin placeholder="Location Name" :text="selectedLocation.name" v-on:changed="changed => bind(changed, 'selectedLocation.name')"></cin>

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
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import {RouteNames} from '../../vue/Routing';
    import * as Actions from '../../store/constants';
    import {Countries} from '../../data/Countries'

    import Identity from '../../models/Identity';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup'

    const WizardSteps = {
        WHAT:{ref:'what', title:'Identities?', description:'Let\'s learn about Scatter\'s Identities.'},
        NAME:{ref:'name', title:'Name your Identity', description:'What are Identity names?'},
        PERSONAL:{ref:'personal', title:'Personal Information', description:'This is not mandatory.'},
        LOCATION:{ref:'location', title:'Location Information', description:'This is not mandatory.'},
    };

    export default {
        data () {return {
            steps:WizardSteps,
            onStep:WizardSteps.WHAT,
            identity:null,
            countries: Countries,
            selectedLocation:null,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'linkedApps'
            ]),
            isValidName(){
                return this.identity && Identity.nameIsValid(this.identity.name);
            }
        },
        mounted(){
            this.identity = Identity.placeholder();
            this.identity.initialize(this.scatter.hash);
            this.selectedLocation = this.identity.locations[0];
        },
        methods: {
            scrollTo(step){
                this.$refs.scroller.scrollTop = this.$refs[step.ref].offsetTop-120;
                this.onStep = step;
            },
            checkName(){
                this.identity.name = this.identity.name.trim();
                if(!this.isValidName){
                    PopupService.push(Popup.snackbar("The name you entered is invalid. Names but be between 3-20 characters and include only a-Z, 0-9 and - or _", "ban"))
                }
            },
            save(){
                if(this.scatter.keychain.identities.find(id => id.publicKey !== this.identity.publicKey && id.name.toLowerCase() === this.identity.name.toLowerCase()))
                    return PopupService.push(Popup.snackbar("You already have an Identity with this name", "ban"));

                if(!this.isValidName) return this.checkName();

                const scatter = this.scatter.clone();
                scatter.keychain.updateOrPushIdentity(this.identity);
                this[Actions.SET_SCATTER](scatter);
                this.$router.push({name:RouteNames.IDENTITIES})
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";
</style>