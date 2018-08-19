<template>
    <section>

        <section>
            <section class="head">

            </section>

            <section class="selected-item scrollable">

                <!--<figure class="name">Repute an Entity</figure>-->
                <!--<figure class="description">-->
                    <!--Reputing entities helps every single Scatter user.-->
                <!--</figure>-->



                <section class="split-panels left">
                    <section class="info-box top">

                        <cin big="true" :placeholder="entityPlaceholder" :text="entityName" v-on:changed="x => entityName = x"></cin>
                        <cin v-if="appUser" placeholder="Enter a Username" :text="appUsername" v-on:changed="x => appUsername = x"></cin>

                        <br>

                        <sel :selected="entityType"
                             :options="entityTypes"
                             :parser="n => n"
                             v-on:changed="switchedEntityType"></sel>

                        <section style="overflow: hidden;">
                            <swch style="float:left;" v-if="entityType === 'application'" first="Application" second="User of Application"
                                  :selected="appUser ? 'Application' : 'User of Application'" v-on:switched="appUser = !appUser"></swch>

                            <btn style="float:right;" red="true" text="Repute This Entity" v-on:clicked="reputeEntity"></btn>
                        </section>
                    </section>
                </section>


                <section class="split-panels">

                    <section class="info-box top">
                        <section v-if="ridlIdentities.length > 1">
                            <sel :selected="selectedIdentity"
                                 :options="ridlIdentities"
                                 :parser="n => n.name"
                                 v-on:changed="switchedSelectedIdentity"></sel>
                            <br><br>
                        </section>


                        <section class="list-item actions">
                            <section class="buttons">
                                <figure class="button" v-tooltip="'Clear All'" @click="clearFragments">
                                    <i class="fa fa-ban"></i>
                                </figure>

                                <figure class="separator"></figure>

                                <figure class="button blue" v-tooltip="'Add Fragment'" @click="addFragment">
                                    <i class="fa fa-plus"></i>
                                </figure>
                            </section>

                            <section class="totals" :class="{'red':remainingRIDL < 0}">
                                {{remainingRIDL}} RIDL
                            </section>
                        </section>

                        <transition-group name="fade">
                            <section :key="index" class="list-item fragment" v-for="(frag, index) in fragments">
                                <figure :class="{'hide':fragments.length == 1}" class="button" @click="removeFragment(frag)">
                                    <i class="fa fa-ban"></i>
                                </figure>

                                <sel :selected="frag.type"
                                     :options="availableFragTypes"
                                     :parser="n => n"
                                     v-on:changed="n => frag.type = n"></sel>

                                <section class="slider-container" :class="{'expand':fragments.length == 1}">
                                    <label :class="frag.quantity < 0 ? 'minus' : 'plus'"><i class="fa" :class="frag.quantity < 0 ? 'fa-minus' : 'fa-plus'"></i>REP</label>
                                    <cin placeholder="RIDL Used" :text="frag.quantity" type="number" v-on:changed="x => frag.quantity = parseFloat(x).toFixed(4)"></cin>
                                    <slider :red="frag.quantity < 0" :min="-availableRIDL" :max="availableRIDL" step="0.0001"
                                            :value="frag.quantity" v-on:changed="x => frag.quantity = parseFloat(x).toFixed(4)"></slider>
                                </section>

                            </section>
                        </transition-group>


                        <br><br>
                        <br><br>
                    </section>


                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    import {Blockchains} from '../../../models/Blockchains'
    import {Popup} from '../../../models/popups/Popup'
    import PopupService from '../../../services/PopupService';
    import RIDLService from '../../../services/RIDLService';

    const ENTITY_TYPES = [
        "application", "contract", "identity"
    ];

    class Fragment {
        constructor(type){
            this.type = type;
            this.quantity = 0;
        }
    }

    export default {
        data () {return {
            selectedIdentity:null,
            ridlIdentity:null,
            entityType:ENTITY_TYPES[0],
            entityName:'',
            entityTypes:ENTITY_TYPES,
            fragTypes:[],
            fragments:[],
            availableRIDL:0,
            appUser:false,
            appUsername:'',
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
                'identities',
            ]),
            availableFragTypes(){
                const used = this.fragments.map(x => x.type);
                return this.fragTypes.filter(x => !used.includes(x));
            },
            entityPlaceholder(){
                switch(this.entityType){
                    case 'contract': return 'Enter a Blockchain Account ( example: someaccount1 or 0x741b197eaa7b7e7a2f1e1d7dc2d1d73bf693cffe )'
                    case 'identity': return 'Enter an Identity Name ( example: Scatter )'
                    case 'application': return 'Enter an Application Name ( example: Overwatch or get-scatter.com )'
                }
            },
            totalRIDLUsed(){
                return parseFloat(this.fragments.reduce((acc,x) => {
                    acc += parseFloat(Math.abs(x.quantity));
                    return acc;
                }, 0)).toFixed(4)
            },
            remainingRIDL(){
                return parseFloat(this.availableRIDL - this.totalRIDLUsed).toFixed(4);
            },
            ridlIdentities(){
                return this.identities.filter(x => x.ridl > -1);
            }
        },
        mounted(){
            this.selectedIdentity = this.ridlIdentities[0];
            this.fetchRidlIdData();

            RIDLService.getFragmentTypes().then(res => {
                this.fragTypes = res.rows.map(x => x.type);
                this.addFragment();
            })
        },
        methods: {
            fetchRidlIdData(){
                RIDLService.getIdentity(this.selectedIdentity).then(id => {
                    if(!id) {
                        console.error('could not find ID')
                        return;
                    }

                    this.ridlIdentity = id;
                    this.availableRIDL = parseFloat(id.tokens.split(' ')[0]).toFixed(4);
                })
            },
            switchedSelectedIdentity(identity){
                this.selectedIdentity = identity;

            },
            switchedEntityType(type){
                this.entityType = type;
                this.entityName = '';
                this.appUser = false;
                this.appUsername = '';
            },
            addFragment(){
                if(this.fragments.length >= 5) return;
                if(!this.availableFragTypes.length) return;
                this.fragments.push(new Fragment(this.availableFragTypes[0]));
            },
            removeFragment(frag){
                this.fragments = this.fragments.filter(f => f.type !== frag.type);
            },
            clearFragments(){
                this.fragments = [];
                this.addFragment();
            },
            async reputeEntity(){

                if(!this.entityName.length){
                    PopupService.push(Popup.prompt('No Entity Specified', `You must enter an Entity to repute.`, 'exclamation-triangle', 'Okay'))
                    return false;
                }

                const usedFragments = this.fragments.filter(x => x.quantity !== 0);
                if(!usedFragments.length){
                    PopupService.push(Popup.prompt('No RIDL Spent', `You must put some RIDL into reputation fragments to repute.`, 'exclamation-triangle', 'Okay'))
                    return false;
                }
                this.fragments = usedFragments;


                const entity = RIDLService.buildEntityName(this.entityType, this.entityName, this.appUsername);
                const reputed = await RIDLService.repute(this.selectedIdentity, entity, this.fragments);
                if(!!reputed) {
                    PopupService.push(Popup.transactionSuccess(Blockchains.EOSIO, reputed));
                    this.fetchRidlIdData();
                }
                else PopupService.push(Popup.prompt('Error sending Repute', 'Looks like something went wrong, please try again', 'ban', 'Okay'));

            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../_variables";


    .actions {
        .buttons {
            width:calc(100% - 215px);
            display: inline-block;
        }

        .totals {
            vertical-align: text-top;
            width: 200px;
            text-align: right;
            display: inline-block;
            font-family: 'Roboto', sans-serif;

            &.red {
                color:$red;
                animation: glow 1.5s infinite;
            }
        }
    }



    .fragment {

        .button {
            margin-right:20px;
            margin-top: -40px;
            vertical-align: middle;
            max-width:30px;
            overflow: hidden;
            opacity:1;
            width:100%;
            margin-left:0;

            transition: max-width 0.3s ease, margin-left 0.3s ease, opacity 0.3s ease;

            &.hide {
                max-width:0;
                margin-left:-30px;
                opacity:0;
            }
        }

        .select {
            width:200px;
            display:inline-block;
        }

        .slider-container {
            max-width:calc(100% - 280px);
            width:100%;
            margin-left:20px;
            display:inline-block;
            vertical-align: middle;
            margin-top: -50px;
            position: relative;

            transition: max-width 0.3s ease;

            &.expand {
                max-width:calc(100% - 230px);
            }

            label {
                font-size: 13px;
                font-weight: bold;
                color:$dark-grey;
                position: absolute;
                right:0;
                top:5px;
                transition: color 0.8s ease;

                &.minus {
                    color:$red;
                }

                &.plus {
                    color:$dark-blue;
                }

                i {
                    font-size: 11px;
                    margin-right:4px;


                }
            }

            .slider {
                margin-top:10px;
            }

            .input {
                margin-top:0;
            }
        }

    }
</style>
