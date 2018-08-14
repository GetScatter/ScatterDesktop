<template>
    <section>

        <section class="popup">
            <section class="top-section" ref="heads">
                <!-- HEADER -->
                <section class="head">
                    <figure class="logo">S</figure>
                    <figure class="info">
                        <figure>Sign {{isArbitrarySignature ? 'an Arbitrary' : 'a' }} Transaction</figure>
                        <figure>{{pluginOrigin}} : {{payload.origin}} {{isArbitrarySignature ? '' : `on ${network.unique().substr(0,15)}...`}}</figure>
                    </figure>
                    <section class="buttons">
                        <btn text="Accept" v-on:clicked="accepted"></btn>
                        <btn red="true" text="Deny" v-on:clicked="returnResult(false)"></btn>
                    </section>
                </section>
            </section>

            <section class="transaction-details" ref="transactions" v-on:scroll="checkScroll" v-if="identity">
                
                <section class="below-fold" v-if="belowFold && !seenAllActions">
                    <figure class="alert">
                        {{belowFold}} more actions below.
                    </figure>
                </section>


                <section class="partition" v-if="identityRequirements.personal.length || identityRequirements.location.length">

                    <section class="split" v-if="identityRequirements.personal.length">
                        <section class="breadcrumbs">
                            <figure class="breadcrumb">personal requirements</figure>
                        </section>

                        <section class="padded">
                            <section class="key-value" v-for="field in identityRequirements.personal">
                                <figure class="key">{{field}}</figure>
                                <figure class="value">{{identity.getPropertyValueByName(field)}}</figure>
                            </section>
                        </section>

                    </section>

                    <section class="split" v-if="identityRequirements.location.length">
                        <section class="breadcrumbs">
                            <figure class="breadcrumb">location requirements</figure>
                        </section>
                        <section class="padded">
                            <section v-if="identityRequirements.location.length && viableLocations.length && selectedLocation">
                                <section class="location-selector">
                                    <figure class="label">Select Location</figure>
                                    <sel :selected="selectedLocation"
                                         :options="viableLocations"
                                         :parser="location => location.name"
                                         v-on:changed="changed => bind(changed, 'selectedLocation')"></sel>
                                </section>
                            </section>


                            <section class="key-value" v-for="field in identityRequirements.location">
                                <figure class="key">{{field}}</figure>
                                <figure class="value">{{identity.getPropertyValueByName(field, selectedLocation)}}</figure>
                            </section>
                        </section>
                    </section>
                </section>

                <section class="breaker">
                    Transaction Data Below
                    <span class="red">( Do not accept this without reading the information below )</span>
                </section>

                <section class="partition" :ref="`message_${index}`" v-for="(message, index) in messages">
                    <section class="action" :class="{'with-ricardian':hasRicardianContract(message), 'showing-ricardian':getAction(message, 'ricardian'),
                                                    'already-whitelisted':isPreviouslyWhitelisted(message)}">

                        <section class="breadcrumbs">
                            <figure class="breadcrumb button" v-if="!isArbitrarySignature" :class="{'whitelisted':!!getWhitelist(message) || isPreviouslyWhitelisted(message)}" @click="addWhitelist(message)">
                                <i class="fa fa-floppy-o"></i>
                            </figure>

                            <figure class="breadcrumb">{{message.code}} -> <u>{{message.type}}</u></figure>

                            <section class="right">
                                <section class="switcher">
                                    <figure class="switch">json</figure>
                                    <figure class="switch active">human</figure>
                                </section>
                            </section>
                        </section>

                        <section class="padded">
                            <section class="key-value" v-for="(value,key) in message.data">
                                <figure class="key">{{key}}</figure>
                                <figure class="whitelister" v-if="!!getWhitelist(message)">
                                    <input type="checkbox" @change="toggleWhitelistProp(getWhitelist(message), key)" />
                                </figure>
                                <figure class="value"><pre>{{value}}</pre></figure>
                            </section>
                        </section>
                    </section>

                    <section class="ricardian" v-if="hasRicardianContract(message)" :class="{'show':getAction(message, 'ricardian')}" @click="toggleAction(message, 'ricardian')">
                        <section class="breadcrumbs">
                            <section class="switcher">
                                <figure class="switch active">
                                    <i class="fa" :class="{'fa-arrow-right':showRicardians, 'fa-arrow-left':!showRicardians}"></i>
                                </figure>
                                <figure class="switch static">ricardian contract</figure>
                            </section>
                        </section>


                        <section class="padded">
                            <section class="key-value">
                                <figure class="key">{{message.type}}</figure>
                                <section class="value">
                                    <figure v-html="message.ricardian"></figure>
                                </section>
                            </section>
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
    import Account from '../../models/Account'
    import Network from '../../models/Network'
    import Identity from '../../models/Identity'
    import {IdentityRequiredFields} from '../../models/Identity'
    import {LocationFields} from '../../models/Identity'
    import Error from '../../models/errors/Error'
    import PopupService from '../../services/PopupService'
    import {Popup} from '../../models/popups/Popup'
    import {Blockchains} from '../../models/Blockchains'
    import PermissionService from '../../services/PermissionService'
    import RIDLService from '../../services/RIDLService'
    import WindowService from '../../services/WindowService'
    import PluginRepository from '../../plugins/PluginRepository'

    let foldInterval = null;

    export default {
        data () {return {
            showRicardians:false,
            identity:null,
            returnedFields:null,
            selectedLocation:null,
            actionList:[],
            whitelists:[],
            scrollTop:0,
            belowFold:0,
            seenAllActions:false,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'identities',
                'accounts',
            ]),
            messages(){
                return this.payload.messages;
            },
            identityRequirements(){
                return IdentityRequiredFields.fromJson(this.payload.requiredFields || {});
            },
            requiresLocationDetails(){
                return this.identityRequirements.hasOwnProperty('location') && this.identityRequirements.location.length;
            },
            network(){
                return Network.fromJson(this.payload.network);
            },
            isArbitrarySignature(){
                return !this.payload.hasOwnProperty('participants');
            },
        },
        mounted(){
            this.checkWarning();
            this.checkResources();

            let id = this.scatter.keychain.identities.find(x => x.publicKey === this.payload.identityKey);
            if(!id) return this.returnResult(Error.identityMissing());
            this.identity = Identity.fromJson(id);

            const hasAllRequiredFields = this.identity.hasRequiredFields(this.identityRequirements);

            if(!hasAllRequiredFields){
                PopupService.push(Popup.prompt(
                    "Missing Required Fields",
                    "You are missing some required fields", "ban", "Okay", () => {
                        this.returnResult(null);
                    }
                ))
            }

            this.returnedFields = this.identity.clone();

            if(this.requiresLocationDetails){
                const requiredLocationFields = Object.keys(LocationFields).filter(field => this.identityRequirements.location.includes(field));
                this.viableLocations = this.identity.locations.filter(location => location.findFields(requiredLocationFields).length === requiredLocationFields.length);
                this.selectedLocation = this.viableLocations.find(location => location.isDefault) || this.viableLocations[0];
                this.returnedFields.location = this.selectedLocation;
            }


            foldInterval = setInterval(() => {
                this.$nextTick(() => {
                    const popupHeight = this.$refs.transactions.clientHeight - this.$refs.heads.clientHeight;
                    let count = 0;
                    this.messages.map((m,i) => {
                        const element = this.$refs[`message_${i}`][0] || null;
                        if(!element) return;

                        const elemTop = element.offsetTop;
                        if(this.scrollTop < elemTop-popupHeight) count++;
                    });
                    this.belowFold = count;
                    if(count === 0) {
                        this.seenAllActions = true;
                        clearInterval(foldInterval);
                    }
                });

            }, 200);

        },
        methods: {
            async checkWarning(){

                const contracts = this.payload.messages.map(x => x.code).reduce((acc, x) => {
                    if(!acc.includes(x)) acc.push(x);
                    return acc;
                }, []);

                const warnings = (await Promise.all(contracts.map(contract => RIDLService.shouldWarn(RIDLService.buildEntityName('contract', contract)).then(x => {
                    if(x && x.length) return x.map(y => {
                        y.contract = contract;
                        return y;
                    });
                    return false;
                })))).filter(x => !!x)
                    .reduce((acc,x) => {
                        x.map(y => acc.push(y));
                        return x;
                    },[]);

                if(warnings.length)
                    PopupService.push(Popup.selector('Warning',
                        `The contract you are interacting with has been given a bad reputation by the users of RIDL.
                        If you decide to interact with this contract make sure you read the parameters and fully understand your liability.`,
                        'exclamation-triangle', warnings, x => `${x.contract} -> ${x.type}: ${x.reputation*100}% REP ( ${x.total_reputes} users )`, () => {}, true))
            },
            async checkResources(){
                const accounts = this.payload.participants;
                const plugin = PluginRepository.plugin(this.payload.blockchain);

                if(this.payload.blockchain === Blockchains.EOS){

                    await Promise.all(accounts.map(account => {
                        account = Account.fromJson(account);
                        plugin.accountData(account, account.network()).then(data => {
                            if (!data) return;

                            if(data.cpu_limit.available <= (data.cpu_limit.max * 0.1)){
                                PopupService.push(Popup.prompt("Running low on Resources",
                                    `The ${account.formatted()} account is running low on CPU, You should delegate some resources before continuing to use it.`, 'exclamation-triangle', 'Okay'));
                            }
                        })
                    }));

                }
            },
            checkScroll(e){
                this.scrollTop = e.target.scrollTop;
            },
            returnResult(result){
                this.$emit('returned', result);
            },
            accepted(){
                //TODO: Return with whitelist and selected location
                this.returnResult({
                    whitelists:this.whitelists,
                    selectedLocation:this.selectedLocation,
                    accepted:true,
                });
            },
            hasRicardianContract(message){
                return message.hasOwnProperty('ricardian') && message.ricardian.length
            },
            isPreviouslyWhitelisted(message){
                if(this.isArbitrarySignature) return false;
                const participants = this.payload.participants.map(x => Account.fromJson(x));
                return PermissionService.hasActionPermission(this.payload.origin, this.identity, participants, message);
            },
            getMessageUnique(message, action){
                return `${message.code}:${message.type}:${action}`
            },
            toggleAction(message, action){
                const unique = this.getMessageUnique(message, action);
                if(this.actionList.includes(unique)) this.actionList = this.actionList.filter(x => x !== unique);
                else this.actionList.push(unique);
            },
            getAction(message, action){
                return this.actionList.find(x => x === this.getMessageUnique(message, action))
            },
            addWhitelist(message){
                if(this.isPreviouslyWhitelisted(message)) return false;
                this.toggleAction(message, 'whitelist');
                const unique = this.getMessageUnique(message, 'whitelist');
                const whitelist = {unique, props:[], code:message.code, type:message.type, fields:message.data};
                if(this.whitelists.find(x => x.unique === whitelist.unique))
                    this.whitelists = this.whitelists.filter(x => x.unique !== unique);
                else this.whitelists.push(whitelist);
            },
            getWhitelist(message){
                const unique = this.getMessageUnique(message, 'whitelist');
                return this.whitelists.find(x => x.unique === unique);
            },
            toggleWhitelistProp(whitelist, prop){
                if(whitelist.props.includes(prop))
                    whitelist.props = whitelist.props.filter(x => x !== prop);
                else whitelist.props.push(prop);
            }

        },
        props:['payload', 'pluginOrigin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";

    .location-selector {
        width:300px;
        margin-bottom:25px;

        .label {
            font-size:13px;
            font-style: italic;
        }
    }

    .key-value {
        width:100%;
        padding-bottom:25px;

        .key {
            font-size:13px;
            font-style: italic;
        }

        .whitelister {
            display:inline-block;
            padding-top:3px;
            input {
                width:16px;
                height:16px;
            }
        }

        .value {
            margin-top:2px;
            font-size:16px;
            font-weight: 600;
            display:inline-block;
            vertical-align: top;

            pre {
                font-family: 'Roboto', sans-serif;
                font-size: 13px;
                margin-top:5px;
            }
        }
    }

    .popup {
        background:$very-light-blue;
        /*width:740px;*/
        width:100%;
        height:800px;
        display: flex;
        flex-flow: column;

        .top-section {
            flex: 0 1 auto;
        }

        .head {
            background:#fff;
            margin-bottom:1px;
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
                width:300px;
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

            .buttons {
                float:left;
                width:calc(100% - 336px);

                button {
                    float:right;
                    margin-top:0;
                    -webkit-app-region: no-drag;
                    margin-left:10px;
                }
            }
        }

        .padded {
            padding:20px;
        }

        .transaction-details {
            position:relative;
            flex: 1 1 auto;
            overflow-y:auto;

            .below-fold {
                position:fixed;
                bottom:0;
                left:0;
                right:0;
                z-index:100001;
                text-align:center;

                .alert {
                    position: relative;
                    background:$red;
                    color:#fff;
                    padding: 10px 20px;
                    text-align:center;
                    display:inline-block;
                }
            }

            .breaker {
                width:100%;
                padding:10px 20px;
                font-weight: 700;
                font-size: 11px;
                background:#fff;
                border-bottom:1px solid rgba(0,0,0,0.1);

                .red {
                    color:$red;
                }
            }

            .partition {
                overflow-y:auto;
                position: relative;
                height:100%;
                overflow-x:hidden;
                border-bottom:1px solid rgba(0,0,0,0.1);

                .split {
                    float:left;
                    width:50%;

                    &:last-child {
                        border-left:1px solid rgba(0,0,0,0.1);
                    }
                }

                .action {
                    width:100%;
                    min-height:0;
                    transition: min-height 0.3s ease;

                    &.with-ricardian {
                        width:calc(100% - 185px);
                        float:left;
                    }

                    &.showing-ricardian {
                        min-height:400px;
                    }

                    &.already-whitelisted {
                        opacity:0.2;
                    }
                }

                .ricardian {
                    cursor: pointer;
                    position: absolute;
                    left:calc(100% - 185px);
                    width:100%;
                    bottom:0;
                    top:0;
                    float:left;
                    overflow-y:scroll;
                    background:#eaecf2;
                    transition: left 0.4s ease;

                    &.show {
                        left:0;
                    }

                    .key-value {
                        width:100%;
                        padding-top:20px;

                        .key {
                            font-size:18px;
                            font-weight: 800;
                        }

                        .value {
                            font-size: 16px;
                            font-weight: 400;
                            margin-top:10px;
                        }
                    }
                }

                .breadcrumbs {
                    padding:20px;
                    padding-bottom:0;
                    width:100%;

                    .breadcrumb {
                        padding:6px 10px;
                        font-size:11px;
                        font-style: italic;
                        font-weight: 600;
                        color:$dark-grey;
                        border-radius:4px;
                        border: 1px dashed $dark-grey;
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

                            &.whitelisted {
                                background:$dark-blue;
                                color:#fff;
                            }
                        }
                    }

                    .right {
                        float:right;
                    }

                    .switcher {

                        .switch {
                            cursor: pointer;
                            background:#ebedf3;
                            float:left;
                            padding:0 10px;
                            font-size:11px;
                            height:27px;
                            line-height:27px;
                            font-style: italic;
                            font-weight: 600;

                            &:not(.static){
                                &:hover, &.active {
                                    background:#fff;
                                    box-shadow:0 2px 3px rgba(0,0,0,0.05);
                                }
                            }

                            &.static {
                                background:#dbdee8;
                            }

                            &:first-child {
                                border-radius: 4px 0 0 4px;
                            }

                            &:last-child {
                                border-radius: 0 4px 4px 0;
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