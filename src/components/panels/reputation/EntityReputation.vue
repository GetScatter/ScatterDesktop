<template>
    <section>

        <section>
            <section class="head">

            </section>

            <section class="selected-item scrollable">

                <section class="split-panels left">
                    <section class="info-box top">

                        <cin big="true" :placeholder="entityPlaceholder" :text="entityName" v-on:changed="x => entityName = x"></cin>
                        <cin v-if="entityType === 'application'" placeholder="Enter a Username ( optional )" :text="appUsername" v-on:changed="x => appUsername = x"></cin>

                        <br>

                        <sel :selected="entityType"
                             :options="entityTypes"
                             :parser="n => n"
                             v-on:changed="switchedEntityType"></sel>
                    </section>
                </section>


                <section class="split-panels" v-if="reputable && reputation">

                    <section class="info-box top">

                        <section class="key-value">
                            <figure class="key">Mine Owner</figure>
                            <figure class="value">Account: {{reputable.miner}}</figure>
                            <figure class="value">Until: {{new Date(reputable.miner_til).toLocaleString()}}</figure>
                        </section>

                        <section class="key-value">
                            <figure class="key">Total Reputes</figure>
                            <figure class="value">{{reputation.total_reputes}}</figure>
                        </section>

                        <section class="rep-box" v-for="fragment in reputation.fragments">
                            <section class="key-value">
                                <figure class="key">Fragment Type</figure>
                                <figure class="value">{{fragment.type}}</figure>
                            </section>
                            <section class="key-value">
                                <figure class="key">Up / Down</figure>
                                <figure class="value">{{fragment.up}} / {{fragment.down}}</figure>
                            </section>
                            <section class="key-value">
                                <figure class="key">Global Fragment Reputation</figure>
                                <figure class="value">{{fragment.reputation}}</figure>
                            </section>
                        </section>

                        <!--<pre>{{reputable}}</pre>-->
                        <!--<pre>{{reputation}}</pre>-->


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

    let reputableTimeout = null;

    export default {
        data () {return {
            entityType:ENTITY_TYPES[0],
            entityName:'',
            entityTypes:ENTITY_TYPES,
            appUsername:'',
            reputable:null,
            reputation:null,
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
            this.entityName = 'get-scatter.com'
        },
        methods: {
            switchedEntityType(type){
                this.entityType = type;
                this.entityName = '';
                this.appUser = false;
                this.appUsername = '';
            },
            async getEntityReputation(){
                const entity = RIDLService.buildEntityName(this.entityType, this.entityName, this.appUsername);
                const reputable = await RIDLService.getReputableEntity(entity);

                if(reputable) {
                    this.reputable = reputable;
                    this.reputation = await RIDLService.getReputation(entity);
                } else {
                    this.reputable = null;
                    this.reputation = null;
                }

            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            entityName(){
                clearTimeout(reputableTimeout);
                reputableTimeout = setTimeout(() => {
                    this.getEntityReputation();
                }, 500);
            },
            appUsername(){
                clearTimeout(reputableTimeout);
                reputableTimeout = setTimeout(() => {
                    this.getEntityReputation();
                }, 500);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../_variables";

    .rep-box {
        border:1px solid rgba(0,0,0,0.1);
        border-bottom:5px solid rgba(0,0,0,0.1);
        padding:20px;
        margin-bottom:20px;
    }

    .key-value {
        width:100%;

        &:not(:first-child){
            padding-top:10px;
            border-top:1px solid rgba(0,0,0,0.1);
        }

        &:not(:last-child){
            padding-bottom:25px;
        }

        .key {
            font-size:13px;
            font-style: italic;
        }

        .value {
            margin-top:2px;
            font-size:16px;
            font-weight: 600;
            vertical-align: top;
            font-family: 'Roboto', sans-serif;
        }
    }



</style>
