<template>
    <section>

        <section class="popup">

            <section class="top-section">
                <!-- HEADER -->
                <section class="head">
                    <figure class="logo">S</figure>
                    <figure class="info">
                        <figure>Login with Scatter</figure>
                        <figure>{{pluginOrigin}} - {{payload.origin}}</figure>
                    </figure>
                    <figure class="close" @click="returnResult(null)">
                        <i class="fa fa-times"></i>
                    </figure>
                </section>

                <!-- REQUIREMENTS -->
                <section class="requirements" v-if="(!selectedIdentity && identityRequirements.length) || (selectedIdentity && printableAccountRequirements.length)">
                    <section v-if="!selectedIdentity">
                        <figure class="title">Identity Requirements</figure>
                        <section class="requirement">
                            {{identityRequirements}}
                        </section>
                    </section>
                    <section v-if="selectedIdentity">
                        <figure class="title">Blockchain Requirements</figure>
                        <section class="requirement">
                            {{printableAccountRequirements}}
                        </section>
                    </section>
                </section>

                <section class="search-bar" v-if="shouldShowSearchbar">
                    <figure class="icon"><i class="fa fa-search"></i></figure>
                    <input placeholder="Search" v-model="searchTerms" />
                </section>
            </section>

            <section class="lists">

                <section class="list" v-if="!selectedIdentity || !accountRequirements.length">


                    <section class="big-login">
                        <section v-if="isValidIdentity">
                            <figure class="title">Do you want to log into <b>{{payload.origin}}</b> with <b>{{identity.name}}</b></figure>
                            <section class="item" @click="selectIdentity(identity)" style="margin:20px 0 0 0;">
                                <figure class="title" :style="{'text-align':validAccounts.length === 1 ? 'center' : 'left'}">Login</figure>
                                <figure class="sub-title" v-if="validAccounts.length === 1">Only one account available, it will automatically be used.</figure>
                                <figure class="sub-title" style="text-align:left;" v-if="validAccounts.length > 1">Continue to account selection.</figure>
                                <figure class="chevron" v-if="validAccounts.length > 1">
                                    <i class="fa fa-chevron-right"></i>
                                </figure>
                            </section>
                        </section>

                        <!-- TODO: Allow to add properties to an identity from this popup -->
                        <section v-else>
                            <figure class="title">Your Identity doesn't have all the requirements.</figure>
                            <p style="font-size: 13px;">Check the panel above to see all the fields that this application is requiring.</p>
                        </section>
                    </section>




                </section>

                <section class="list" v-if="selectedIdentity && accountRequirements.length">
                    <section class="breadcrumbs">

                    </section>

                    <section class="item" v-for="account in validAccounts" @click="selectAccount(account)">
                        <figure class="title">{{account.formatted()}}</figure>
                        <figure class="sub-title">{{account.keypair().name}}</figure>
                        <figure class="chevron">
                            <i class="fa fa-chevron-right"></i>
                        </figure>
                    </section>
                </section>

            </section>
        </section>



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import Account from '../../models/Account'
    import Network from '../../models/Network'
    import {IdentityRequiredFields} from '../../models/Identity'

    import RIDLService from '../../services/RIDLService';
    import WindowService from '../../services/WindowService';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup';

    export default {
        data () {return {
            selectedIdentity:null,
            selectedAccounts:[],
            searchTerms:'',
        }},
        computed:{
            ...mapState([
                'state',
                'scatter'
            ]),
            ...mapGetters([
                'identity',
                'identities',
                'accounts',
                'networks',
            ]),
            validAccounts(){
                const neededBlockchains = this.accountRequirements.map(x => x.blockchain.toLowerCase());
                const neededNetworks = this.accountRequirements.map(x => Network.fromJson(x).unique());
                const alreadySelectedUniques = this.selectedAccounts.map(x => x.unique());
                return this.accounts
                    .filter(x => neededNetworks.includes(x.networkUnique))
                    .filter(x => neededBlockchains.includes(x.blockchain().toLowerCase()))
                    .filter(x => !alreadySelectedUniques.includes(x.unique()))
                    .filter(id => JSON.stringify(id).toLowerCase().indexOf(this.searchTerms.toLowerCase()) > -1);
            },
            isValidIdentity(){
                return this.identity.hasRequiredFields(this.fields);
            },
            fields(){
                return IdentityRequiredFields.fromJson(this.payload.fields);
            },
            identityRequirements(){
                return this.fields.personal.concat(this.fields.location).join(', ');
            },
            accountRequirements(){
                return this.fields.accounts || [];
            },
            printableAccountRequirements(){
                return this.accountRequirements.map(x => this.networks.find(x => x.chainId === x.chainId).name).join(' / ')
            },
            shouldShowSearchbar(){
                return this.selectedIdentity && this.validAccounts.length > 1;
            }
        },
        mounted(){
            this.checkWarning();
        },
        methods: {
            async checkWarning(){
                const warn = await RIDLService.shouldWarn(RIDLService.buildEntityName('application', this.payload.origin));
                if(warn.length)
                    PopupService.push(Popup.selector('Warning', 'This entity has a negative reputation. Be careful interacting with it.',
                        'exclamation-triangle', warn, x => `${x.type}: ${x.reputation*100}% REP ( ${x.total_reputes} users )`, () => {}, true))
            },
            returnResult(result){
                this.$emit('returned', result);
            },
            selectIdentity(identity){
                if(!this.accountRequirements.length)
                    return this.returnResult({identity});

                this.searchTerms = '';
                this.selectedIdentity = identity;

                if(this.validAccounts.length === 1) this.selectAccount(this.validAccounts[0]);
            },
            selectAccount(account){
                this.selectedAccounts.push(account);
                if(this.accountRequirements.length > this.selectedAccounts.length)
                    return;

                this.returnResult({identity:this.selectedIdentity, accounts:this.selectedAccounts});
            },
            backToIdentities(){
                this.selectedAccounts = [];
                this.selectedIdentity = null;
            },
            neededProperties(identity){
                const personal = (this.fields.personal || []).map(x => identity.getPropertyValueByName(x));
                const location = (this.fields.location || []).map(x => identity.getPropertyValueByName(x))
                                    .map(field => typeof field === 'object' ? field.name : field);

                return personal.concat(location).join(', ');
            }
        },
        props:['payload', 'pluginOrigin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";

    .pop-in {
        width:200px;
    }

    .popup {
        background:$very-light-blue;
        width:440px;
        height:560px;
        display: flex;
        flex-flow: column;



        .top-section {
            flex: 0 1 auto;
        }

        .head, .requirements, .search-bar {
            background: #fff;
            margin-bottom:1px;
        }

        .head {
            -webkit-app-region: drag;
            padding:20px;
            overflow: hidden;

            .logo {
                line-height: 40px;
                height:36px;
                width:36px;
                background:$light-blue;
                color:#fff;
                font-family: 'Grand Hotel', sans-serif;
                font-size:24px;
                border-radius:50%;
                text-align:center;
                float:left;
                padding-right: 1px;
            }

            .info {
                float:left;
                width:calc(100% - 36px);
                padding-left:20px;
                overflow: hidden;

                figure {
                    float:left;

                    &:first-child {
                        font-size:16px;
                        font-weight: 600;
                        width:100%;
                        padding-top:2px;
                    }

                    &:last-child {
                        font-size:11px;
                        color:$dark-grey;
                        margin-top:2px;
                    }
                }
            }

            .close {
                -webkit-app-region: no-drag;
                position:absolute;
                top:20px;
                right:20px;
                font-size:24px;
                color:$mid-light-grey;
                transition: color 0.2s ease;
                cursor: pointer;

                &:hover {
                    color:$light-blue;
                }
            }
        }

        .requirements {
            padding:15px 20px;

            .title {
                font-size:11px;
                font-style: italic;
                font-weight: 600;
                color:$medium-grey;
            }

            .requirement {
                font-size:13px;
                font-weight: 600;
                color:$dark-grey;
                margin-top:5px;
            }
        }

        .search-bar {
            padding:10px 20px;
            overflow: hidden;

            .icon {
                width:20px;
                float:left;
                font-size:11px;
                color:$medium-grey;
                padding-top:2px;
            }

            input {
                float:left;
                width:calc(100% - 20px);
                height:15px;
                outline:0;
                border:0;
                font-size:11px;
                color:$medium-grey;
            }

        }

        .lists {
            position:relative;
            flex: 1 1 auto;
            overflow-y:auto;
            display: flex;
            flex-direction: column;

            .big-login {
                flex:1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;


                padding:40px;
                text-align:center;

                .title {
                    font-size: 24px;
                }
            }

            .list {
                padding-bottom:30px;
                overflow-y:auto;
                position: relative;
                height:100%;
                display: flex;
                flex-direction: column;
                flex:1;

                .breadcrumbs {
                    padding:10px 20px;

                    .breadcrumb {
                        padding:6px 10px;
                        font-size:11px;
                        font-style: italic;
                        font-weight: 600;
                        color:$dark-grey;
                        border-radius:4px;
                        border: 1px dashed $medium-grey;
                        display:inline-block;

                        &.button {
                            cursor: pointer;
                            background:#fff;
                            border: 0;
                            box-shadow:0 1px 2px rgba(0,0,0,0.1);
                            transform:translateY(0px);
                            transition: box-shadow 0.1s ease, transform 0.1s ease;

                            &:hover {
                                transform:translateY(-1px);
                                box-shadow:0 3px 7px rgba(0,0,0,0.08);
                            }

                            &:active {
                                transform:translateY(1px);
                                box-shadow:0 1px 2px rgba(0,0,0,0.2);
                            }
                        }
                    }
                }


                .item {
                    cursor: pointer;
                    margin:0 20px;
                    padding:30px;
                    background:#fff;
                    color:$dark-grey;
                    border-radius:4px;
                    box-shadow:0 1px 2px rgba(0,0,0,0.1);
                    transform:translateY(0px);
                    transition: box-shadow 0.2s ease, transform 0.2s ease;
                    margin-bottom:10px;
                    padding-right:50px;

                    .title {
                        font-size:18px;
                        color:$dark-grey;
                        font-weight: 600;
                        margin-bottom:5px;
                    }

                    .sub-title {
                        font-size:11px;
                        font-style: italic;
                    }

                    .chevron {
                        position:absolute;
                        right:20px;
                        top:0;
                        bottom:0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color:$mid-light-grey;
                    }

                    &:hover {
                        transform:translateY(-1px);
                        box-shadow:0 3px 7px rgba(0,0,0,0.08);
                    }

                    &:active {
                        transform:translateY(1px);
                        box-shadow:0 1px 2px rgba(0,0,0,0.2);
                    }
                }
            }

        }

    }
</style>
