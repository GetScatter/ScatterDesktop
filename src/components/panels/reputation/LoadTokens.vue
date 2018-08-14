<template>
    <section>

        <section>
            <section class="head">

            </section>

            <section class="selected-item scrollable">



                <section class="split-panels left">
                    <section class="info-box top">

                        <section class="from-to-container">
                            <section class="from">
                                <sel :selected="selectedAccount" v-tooltip="'From Blockchain Account'"
                                     :options="ridlAccounts"
                                     :parser="n => n.name"
                                     v-on:changed="x => selectedAccount = x"></sel>
                            </section>

                            <section class="arrow">
                                <i class="fa fa-arrow-right"></i>
                            </section>

                            <section class="to">
                                <cin v-if="!selectingIdentity" big="true" placeholder="Enter an Identity Name" :text="identityName" v-on:changed="x => identityName = x"></cin>

                                <section v-if="selectingIdentity && ridlIdentities.length">
                                    <sel :selected="selectedIdentity" v-tooltip="'To RIDL Identity'"
                                         :options="ridlIdentities"
                                         :parser="n => n.name"
                                         v-on:changed="switchedSelectedIdentity"></sel>
                                    <div style="height:12px;"></div>
                                </section>
                            </section>
                        </section>
                        <div style="clear:both"></div>

                        <section class="slider-container expand" style="position:relative;">
                            <label class="available-ridl">{{parseFloat(parseFloat(availableRIDL).toFixed(4) - parseFloat(quantity).toFixed(4)).toFixed(4)}} RIDL</label>
                            <cin placeholder="RIDL To Send" :text="quantity" type="number" v-on:changed="x => quantity = parseFloat(x).toFixed(4)"></cin>
                            <slider :min="0" :max="availableRIDL" step="0.0001"
                                    :value="quantity" v-on:changed="x => quantity = parseFloat(x).toFixed(4)"></slider>
                        </section>
                        <br><br>

                        <section v-if="ridlIdentities.length" style="overflow: hidden;">
                            <swch style="float:left;" first="Local Identity" second="Other Identity"
                                  :selected="!selectingIdentity ? 'Local Identity' : 'Other Identity'" v-on:switched="toggleSelectingIdentity"></swch>

                            <btn style="float:right;" red="true" text="Send Tokens To Identity" v-on:clicked="loadTokens"></btn>
                        </section>
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
    import PluginRepository from '../../../plugins/PluginRepository';


    export default {
        data () {return {
            selectedAccount:null,
            identityName:'',
            selectedIdentity:null,
            selectingIdentity:true,
            ridlIdentity:null,
            quantity:0,
            availableRIDL:0,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
                'identities',
                'accounts',
            ]),
            availableFragTypes(){
                const used = this.fragments.map(x => x.type);
                return this.fragTypes.filter(x => !used.includes(x));
            },
            remainingRIDL(){
                return parseFloat(this.availableRIDL - this.quantity).toFixed(4);
            },
            ridlIdentities(){
                return this.identities.filter(x => x.ridl > -1);
            },
            ridlNetwork(){
                return RIDLService.getNetwork();
            },
            ridlAccounts(){
                return this.accounts.filter(x => x.networkUnique === this.ridlNetwork.unique());
            }
        },
        mounted(){
            this.selectedIdentity = this.ridlIdentities[0];
            this.identityName = this.ridlIdentities[0].name;

            this.selectedAccount = this.ridlAccounts[0];

            this.getBalance();
        },
        methods: {
            async getBalance(){
                const balance = await PluginRepository.plugin(Blockchains.EOS).balanceFor(this.selectedAccount, this.ridlNetwork, 'ridlridlcoin', 'RIDL');
                this.availableRIDL = balance ? balance : 0;
            },
            toggleSelectingIdentity(){
                this.selectingIdentity = !this.selectingIdentity;
                this.identityName = '';
                if(this.selectingIdentity) this.identityName = this.ridlIdentities[0].name;
            },
            switchedSelectedIdentity(identity){
                this.selectedIdentity = identity;

            },
            async loadTokens(){
                const quantity = parseFloat(this.quantity).toFixed(4);

                if(quantity <= 0) return PopupService.push(Popup.prompt(`Can't send 0 RIDL`, 'You can not send 0 RIDL to Identities.', 'exclamation-triangle', 'Okay'));
                if(!RIDLService.validName(this.identityName)) return PopupService.push(Popup.prompt(`Bad Identity Name`, 'The Identity name you are trying to load tokens into is invalid.', 'exclamation-triangle', 'Okay'));

                const sent = await RIDLService.loadTokens(this.selectedAccount, this.identityName, quantity);
                if(!sent) return PopupService.push(Popup.prompt('Error!', 'Could not sent RIDL to the given Identity', 'exclamation-triangle', 'Okay'));
                else PopupService.push(Popup.transactionSuccess(Blockchains.EOS, sent));

                this.getBalance();
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../_variables";

    .available-ridl {
        position: absolute;
        right:0;
        top:5px;
        font-family: 'Roboto', sans-serif;
        font-size: 13px;
        font-weight: bold;
    }

    .from-to-container {


        .from, .to {
            width:calc(50% - 25px);
            float:left;
        }

        .arrow {
            width:50px;
            height:50px;
            text-align:center;
            line-height:50px;
            float:left;
        }
    }
</style>
