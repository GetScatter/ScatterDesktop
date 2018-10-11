<template>
    <section class="identity">

        <section class="explainer">
            <figure class="bg"></figure>

            <section class="head">
                <figure class="title">What's this?</figure><br>
                <figure class="description">
                    Think of your Identity like your personally owned digital Passport which lives only on your computer.<br><br>
                    <b>If you choose</b> to fill out your personal information, applications that you are interacting with will be able to
                    request pieces of it allowing you to provide those pieces to them without
                    having to re-type personal information for each application, or have them inserted insecurely into input forms by your browser automatically leaking your information
                    which can then be tracked by the browser and extensions.
                </figure>
            </section>
        </section>

        <section class="details" v-if="identity">
            <section class="actions"></section>

            <section class="data">

                <section class="inputs">
                    <label>Identity Name <i style="margin-left:10px;">( your username on applications )</i></label>
                    <input class="large" v-model="identity.name" placeholder="" />
                    <transition name="slide-left" mode="out-in">
                        <label class="red" v-if="!isValidName">Names must be between 3-20 characters and include only a-Z, 0-9 and - or _</label>
                        <div style="height:29px;" v-else></div>
                    </transition>
                </section>
                <br>

                <section class="inline-inputs">
                    <section class="inputs third">
                        <label>Full Name</label>
                        <input v-model="fullname" placeholder="John Smith" />
                    </section>
                    <section class="inputs third">
                        <label>Date of Birth</label>
                        <input v-model="identity.personal.birthdate" placeholder="18/12/1970" type="date" />
                    </section>
                </section>

                <figure class="breaker"></figure>


                <section class="inputs">
                    <label>Email</label>
                    <input v-model="identity.personal.email" type="email" placeholder="jsmith@get-scatter.com" />
                </section>


                <figure class="breaker"></figure>
                <br><br><br>

                <section class="inline-inputs">
                    <section class="inputs">
                        <label>Locations</label>
                        <figure class="breaker" style="margin-top:10px;"></figure>
                        <section class="flexer">
                            <sel :selected="location" style="flex:3;"
                                 :options="identity.locations"
                                 :parser="x => x.name"
                                 v-on:changed="x => location = x"></sel>

                            <section style="display:flex;">
                                <figure class="action large relative" v-tooltip="'New Location'" @click="addLocation">
                                    <i class="fa fa-plus"></i>
                                </figure>
                                <figure :class="{'hide-action':identity.locations.length <= 1}" class="action red large relative" v-tooltip="'Remove'" @click="removeLocation">
                                    <i class="fa fa-ban"></i>
                                </figure>
                            </section>
                        </section>

                    </section>
                </section>

                <figure class="breaker"></figure>
                <br>

                <section class="inputs">
                    <label>Location Name ( used for organization only )</label>
                    <input v-model="location.name" placeholder="Unnamed Location" />
                </section>

                <section class="inline-inputs">

                    <section class="inputs third">
                        <label>Phone Number</label>
                        <section class="flexer" style="height:60px;">
                            <input style="flex:2" v-model="phone.area" max="3" type="number" placeholder="Area" class="with-icon" />
                            <figure class="prefix" style="bottom:11px;"><i class="fa fa-plus"></i></figure>

                            <input style="flex:3" v-model="phone.prefix" type="number" placeholder="555" />
                            <input style="flex:3" v-model="phone.suffix" type="number" placeholder="5555" />
                        </section>
                    </section>

                    <section class="inputs third">
                        <label>Country</label>
                        <sel :selected="location.country" style="flex:3;"
                             :options="[null].concat(countries)"
                             :parser="x => x ? x.name : 'No Country Selected'"
                             v-on:changed="x => location.country = x"></sel>
                    </section>
                </section>

                <figure class="breaker"></figure>

                <section class="inline-inputs">
                    <section class="inputs half">
                        <label>Address</label>
                        <input v-model="location.address" placeholder="555 1st Street" />
                    </section>

                    <section class="inputs third">
                        <label>City</label>
                        <input v-model="location.city" placeholder="New York" />
                    </section>

                    <transition name="slide-left" mode="out-in">
                        <section v-if="location.country && location.country.code === 'US'" class="inputs third">
                            <label>State</label>
                            <input v-model="location.state" placeholder="NY" maxlength="2" />
                        </section>
                    </transition>
                </section>

                <figure class="breaker"></figure>

                <section class="inputs">
                    <label>Zip/Postal Code</label>
                    <input v-model="location.zipcode" placeholder="10001" />
                </section>

                <figure class="breaker"></figure>

                <br><br><br><br>

            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import IdGenerator from '../util/IdGenerator'
    import PopupService from '../services/PopupService';
    import {Popup} from '../models/popups/Popup';
    import Identity, {LocationInformation} from '../models/Identity';
    import {Countries} from '../data/Countries'
    let saveTimeout;

    export default {
        data () {return {
            countries:Countries,
            location:null,
            phone:{
                area:'',
                prefix:'',
                suffix:'',
            },
            fullname:'',
            identity:null
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'accounts',
                'contacts',
                'identities',
            ]),
            isValidName(){
                return this.identity && Identity.nameIsValid(this.identity.name);
            },
        },
        mounted(){
            this.identity = this.identities[0].clone();
            this.fullname = [this.identity.personal.firstname, this.identity.personal.lastname].filter(x => x && x.length).join(' ');
            this.location = this.identity.locations[0];
        },
        methods:{
            setPhone(){
                let area, prefix, suffix, presuffix;
                if(this.location.phone.length){
                    [area, presuffix] = this.location.phone.split(' ');
                    if(area) area = area.replace('(', '').replace(')', '');
                    if(presuffix) [prefix, suffix] = presuffix.split('-');
                }

                this.phone = {
                    area,
                    prefix,
                    suffix
                }
            },
            save(){
                if(JSON.stringify(this.identities[0]) === JSON.stringify(this.identity)) return;
                if(!this.isValidName) return;

                const scatter = this.scatter.clone();
                scatter.keychain.updateOrPushIdentity(this.identity);
                this[Actions.SET_SCATTER](scatter);
            },
            addLocation(){
                const location = LocationInformation.placeholder();
                location.name = IdGenerator.text(10);
                this.identity.locations.push(location);
                this.location = location;
            },
            removeLocation(){
                if(this.identity.locations.length <= 1) return;
                PopupService.push(Popup.prompt('Removing Location', 'Are you sure you wish to remove this location?', 'exclamation-triangle', 'Yes', removed => {
                    if(!removed) return;
                    this.identity.locations = this.identity.locations.filter(x => x.id !== this.location.id);
                    this.location = this.identity.locations[0];
                }, 'No'))
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            ['fullname'](){
                if(!this.fullname.trim().length){
                    this.identity.personal.firstname = '';
                    this.identity.personal.lastname = '';
                    return false;
                }

                const names = this.fullname.trim().split(' ');
                this.identity.personal.firstname = names.slice(0, names.length > 1 ? names.length-1 : 1).join(' ').trim();
                if(names.length > 1) this.identity.personal.lastname = names[names.length-1].trim();
            },
            'identity':{
                handler(a,b){
                    if(!b) return;
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        this.save();
                    }, 500);
                },
                deep:true
            },
            'phone':{
                handler(a,b){
                    if(!this.phone || typeof this.phone !== 'object') return false;
                    const {area, prefix, suffix} = this.phone;
                    if(!area || !prefix || !suffix) return false;
                    if(!area.length && !prefix.length && !suffix.length) return this.location.phone = '';
                    if(!area.length || !prefix.length || !suffix.length) return;
                    this.location.phone = `(${area}) ${prefix}-${suffix}`
                },
                deep:true
            },
            ['location'](){
                this.setPhone();
            }
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .identity {
        display:flex;
        flex-direction: row;
        flex:1;

        .explainer {
            flex:.8;
            display:flex;
            flex-direction: column;
            background:$light-blue;
            position: relative;
            z-index:2;

            .bg {
                position:absolute;
                top:10px; bottom:0; left:0; right:0;
                background:#fff;
                z-index:-1;
            }


            .head {
                padding:40px;
                background:#fff;
                border-top-right-radius:8px;
                box-shadow:10px -10px 20px rgba(0,0,0,0.01);
                border-bottom:1px solid rgba(0,0,0,0.1);

                .title {
                    font-size: 28px;
                    font-weight: 600;
                    margin-bottom:5px;
                    color:$black;
                }

                .description {
                    font-size: 16px;
                    color:$dark-grey;
                }
            }
        }

        .details {
            flex:1.5;
            display:flex;
            flex-direction: column;
            box-shadow: inset 1px 0 3px rgba(0,0,0,0.1);

            .actions {
                flex:0 0 auto;
                height:50px;
                display: flex;
                justify-content: space-between;
                background:$light-blue;
                padding:0 50px 0 30px;
                float:left;
                width:100%;
                z-index:10;
            }

            .data {
                flex:1;
                padding:40px;
                overflow-y:auto;
                overflow-x:hidden;

                .breaker {
                    width:100%;
                    clear:both;
                }

                .inline-inputs {
                    display:flex;

                }

                .inputs {
                    margin-bottom:20px;
                    position: relative;
                    width:100%;

                    .flexer {
                        display:flex;
                        input {
                            &:not(:first-child){
                                border-left:1px dashed rgba(0,0,0,0.2);
                                padding-left:10px;
                            }
                        }
                    }

                    label {
                        font-size: 11px;

                        &.red {
                            color:$red;
                            font-weight: bold;
                            font-size: 16px;
                            margin-top:10px;
                            display:block;
                        }
                    }

                    .action {
                        cursor: pointer;
                        position:absolute;
                        top:15px;
                        right:0;
                        width:35px;
                        height:35px;
                        line-height:33px;
                        font-size: 16px;
                        text-align:center;
                        border:1px solid rgba(0,0,0,0.2);
                        color:rgba(0,0,0,0.3);
                        border-radius:2px;

                        opacity:1;
                        visibility: visible;
                        margin-right:0;

                        transition: all 0.2s ease;
                        transition-property: color, background, border, opacity, visibility, margin;

                        &.hide-action {
                            opacity:0;
                            margin-right:-55px;
                            visibility: hidden;
                        }

                        &.large {
                            width:50px;
                            height:50px;
                            line-height: 48px;
                            top:29px;
                            font-size: 18px;

                            &.relative {
                                position:relative;
                                margin-top:0;
                                margin-left:10px;
                                top:0;
                            }
                        }

                        &:hover {
                            background:$light-blue;
                            border:1px solid $light-blue;
                            color:#fff;
                        }

                        &.red {
                            &:hover {
                                background:$red;
                                border:1px solid $red;
                                color:#fff;
                            }
                        }
                    }

                    .prefix {
                        position:absolute;
                        bottom:3px;
                        left:0;
                        font-size: 22px;
                        color:$medium-grey;
                        font-weight: bold;


                        &.icon {
                            cursor: pointer;

                            &:hover {
                                color:$red;
                            }
                        }
                    }

                    input {
                        width:100%;
                        border:0;
                        outline:0;
                        background:transparent;
                        border-bottom:1px dashed rgba(0,0,0,0.2);
                        font-size: 24px;
                        margin-top:10px;

                        transition:all 0.4s ease;
                        transition-property: padding;

                        &.with-action {
                            padding-right:40px;
                        }

                        &.with-prefix {
                            padding-left:17px;
                        }

                        &.with-icon {
                            padding-left:25px;
                        }

                        $placeholdercolor:rgba(0,0,0,0.3);
                        &::-webkit-input-placeholder { color: $placeholdercolor; }
                        &::-moz-placeholder { color: $placeholdercolor; }
                        &:-ms-input-placeholder { color: $placeholdercolor; }
                        &:-moz-placeholder { color: $placeholdercolor; }

                        &.amount {
                            font-size:40px;
                        }

                        &[type=date]{
                            font-size:18px;
                            margin-top:11px;
                        }

                        &.large {
                            font-size: 36px;
                        }
                    }

                    &.half {
                        flex:2;

                        &:nth-child(2){
                            margin-left:20px;
                        }
                    }

                    &.third {
                        flex:1;

                        &:not(:first-child){
                            margin-left:20px;
                        }
                    }
                }
            }
        }

    }



</style>
