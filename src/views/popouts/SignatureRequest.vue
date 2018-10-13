<template>
    <section>

        <section class="popup">
            <section class="top-section" ref="heads">
                <!-- HEADER -->
                <section class="head">
                    <figure class="logo">S</figure>
                    <figure class="info">
                        <figure>{{isArbitrarySignature ? 'Arbitrary Data' : 'Actions' }}</figure>
                        <figure>
                            {{pluginOrigin}} : {{payload.origin}}
                            <b>
                                {{isArbitrarySignature ? '' : `on ${network ? network.name : ''}`}}
                                <i class="endorsed-network" v-if="!isArbitrarySignature && isEndorsedNetwork">
                                    <i class="fa fa-shield"></i>
                                </i>
                            </b>

                        </figure>
                        <figure v-if="!isArbitrarySignature">
                            Involved Accounts: <b>{{participants}}</b>
                        </figure>
                    </figure>
                    <section class="buttons">
                        <figure class="button red" @click="returnResult(false)"><i class="fa fa-times"></i></figure>
                        <figure class="button" @click="accepted"><i class="fa fa-check"></i></figure>
                    </section>
                </section>
            </section>

            <section class="transaction-details" ref="transactions" v-on:scroll="checkScroll" v-if="identity">

                <section class="below-fold" v-if="belowFold && !seenAllActions">
                    <figure class="alert">
                        {{belowFold}} more actions below.
                    </figure>
                </section>

                <section class="below-fold" v-if="isArbitrarySignature">
                    <figure class="alert">
                        <b style="color:yellow;">Warning, arbitrary signatures can be dangerous.</b> <b>DO NOT</b> sign anything which you can not read clearly in human language.
                        If what you are signing is a random jumble of letters and numbers it's possible that it's a transaction that you can not read and could be a transfer of all of your funds.
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
                                <figure class="value bubbler">{{identity.getPropertyValueByName(field)}}</figure>
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
                                <figure class="value bubbler">{{identity.getPropertyValueByName(field, selectedLocation)}}</figure>
                            </section>
                        </section>
                    </section>
                </section>

                <section class="breaker" v-if="identityRequirements.personal.length || identityRequirements.location.length"></section>

                <section class="partition" :ref="`message_${index}`" v-for="(message, index) in messages">
                    <section class="action" :class="{'with-ricardian':hasRicardianContract(message), 'showing-ricardian':getAction(message, 'ricardian'),
                                                    'already-whitelisted':isPreviouslyWhitelisted(message)}">




                        <section class="breadcrumbs" style="overflow:hidden;">
                            <section class="key-value contract-action">
                                <figure class="value"><span class="bubbler">{{message.code}} -> {{message.type}}</span></figure>
                            </section>

                            <section class="right">
                                <section class="switcher right">
                                    <figure class="switch" :class="{'active':isShowingJson(message)}" @click="toggleJsonDisplay(message)">json</figure>
                                    <figure class="switch" :class="{'active':!isShowingJson(message)}" @click="toggleJsonDisplay(message)">human</figure>
                                </section>
                                <figure class="breadcrumb button whitelist right"
                                        v-if="!isArbitrarySignature"
                                        :class="{'whitelisted':!!getWhitelist(message) || isPreviouslyWhitelisted(message), 'hide':isShowingJson(message)}"
                                        @click="addWhitelist(message)">
                                    <b style="">{{!!getWhitelist(message) || isPreviouslyWhitelisted(message) ? 'whitelisted' : 'whitelist'}}</b>
                                </figure>
                            </section>
                        </section>

                        <section class="padded" v-if="!isShowingJson(message)">
                            <section class="key-value" v-for="(value,key) in message.data">
                                <figure class="key"><b>{{key}}</b></figure>
                                <figure class="whitelister" :class="{'show':!!getWhitelist(message)}">
                                    <input type="checkbox" @change="toggleWhitelistProp(getWhitelist(message), key)" />
                                </figure>
                                <figure class="value" v-if="typeof value === 'object'">
                                    <section class="dark" :ref="key + hash(value)">
                                        <div :v-html="formatJson(value, key)"></div>
                                    </section>
                                </figure>
                                <figure class="value" v-else><span class="bubbler">{{value}}</span></figure>
                            </section>
                        </section>

                        <section class="padded" v-if="isShowingJson(message)">
                            <section class="dark" :ref="hash(message)">
                                <div :v-html="formatJson(message)"></div>
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
                                <figure><b>{{message.type}}</b></figure>
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
    import ResourceService from '../../services/ResourceService'
    import {Popup} from '../../models/popups/Popup'
    import {Blockchains} from '../../models/Blockchains'
    import PermissionService from '../../services/PermissionService'
    import RIDLService from '../../services/RIDLService'
    import WindowService from '../../services/WindowService'
    import PluginRepository from '../../plugins/PluginRepository'
    import Hasher from '../../util/Hasher'
    import JSONFormatter from 'json-formatter-js'

    let foldInterval = null;

    export default {
        data () {return {
            showingJson:[],
            showRicardians:false,
            identity:null,
            returnedFields:null,
            selectedLocation:null,
            actionList:[],
            whitelists:[],
            scrollTop:0,
            belowFold:0,
            seenAllActions:false,
            isEndorsedNetwork:false,
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'identities',
                'accounts',
                'networks',
            ]),
            participants(){
                if(!this.payload.hasOwnProperty('participants')) return '';
                return this.payload.participants.map(x => Account.fromJson(x).sendable()).join(', ')
            },
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
                return this.networks.find(x => x.unique() === Network.fromJson(this.payload.network).unique());
            },
            isArbitrarySignature(){
                return !this.payload.hasOwnProperty('participants');
            },
        },
        mounted(){
//            WindowService.openTools()
            this.checkWarning();
            this.checkNetwork();

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
            async checkNetwork(){
                if(!this.network) return;
                this.isEndorsedNetwork = await PluginRepository.plugin(this.network.blockchain).isEndorsedNetwork(this.network);
            },
            isShowingJson(message){
                return this.showingJson.find(x => x === this.hash(message));
            },
            toggleJsonDisplay(message){
                const hash = this.hash(message);
                if(this.showingJson.includes(hash)) {
                    const elem = this.$refs[hash][0];
                    elem.removeChild(elem.children[1])
                    this.showingJson = this.showingJson.filter(x => x !== hash);
                }
                else this.showingJson.push(hash);
            },
            hash(json){
                return Hasher.unsaltedQuickHash(JSON.stringify(json));
            },
            formatJson(json, key = null){
                this.$nextTick(() => {
                    const refKey = (key ? key : '') + this.hash(json);

                    const formatter = new JSONFormatter(json, 99999, {
                        hoverPreviewEnabled: true,
                        hoverPreviewArrayCount: 10,
                        hoverPreviewFieldCount: 5,
                        theme: 'dark',
                        animateOpen: true,
                        animateClose: true,
                        useToJSON: true
                    });
                    const elem = this.$refs[refKey][0];
                    if(elem.children.length > 1) return false;
                    elem.appendChild(formatter.render());
                });
            },
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
            checkScroll(e){
                this.scrollTop = e.target.scrollTop;
            },
            returnResult(result){
                this.$emit('returned', result);
            },
            async accepted(){
                //TODO: Return with whitelist and selected location
                const needResources = this.payload.hasOwnProperty('participants') ? await ResourceService.transactionNeedsResources(this.payload.participants) : false;
                this.returnResult({
                    whitelists:this.whitelists,
                    selectedLocation:this.selectedLocation,
                    accepted:true,
                    needResources,
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
                else {
                    if(message.type === 'transfer'){
                        PopupService.push(Popup.prompt(
                            'Whitelist Warning',
                            `You are about to whitelist a transfer action. This can be dangerous as you will get no notification of an Application using your funds. Are you sure you want to do this?`,
                            'exclamation-triangle',
                            'Yes',
                            accepted => {
                                if(accepted){
                                    this.whitelists.push(whitelist);
                                }
                            },
                            'No'
                        ))
                    } else this.whitelists.push(whitelist);
                }



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

    .dark {
        padding:20px;
        width:100%;
        background:#333;
        border-radius:4px;
        box-shadow:0 1px 0 #fff, 0 -1px 0 #000, inset 0 25px 150px rgba(0,0,0,0.2);
        font-size: 13px;
        font-weight: 400;
        margin-top:4px;
    }

    .bubbler {
        padding:10px 20px;
        background:#fff;
        display:block;
        border-radius:4px;
        box-shadow:0 1px 3px rgba(0,0,0,0.1), 0 3px 8px rgba(0,0,0,0.1);
        margin-top:4px;
    }

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
            font-size:14px;
            font-style: italic;
            background:rgba(0,0,0,0.1);
            display: table;
            padding:5px 10px 30px;
            margin-bottom:-30px;
            border-radius:4px;
            box-shadow:inset 0 2px 0 rgba(0,0,0,0.1), 0 1px 1px #fff;
        }

        .whitelister {
            display:inline-block;
            padding-top:6px;
            max-width:0;
            width:100%;
            overflow:hidden;
            visibility: hidden;
            opacity: 0;
            transition: all 0.3s ease;
            transition-property: max-width, visibility, opacity;

            input {
                cursor: pointer;
                width:22px;
                height:22px;
                margin-left:2px;
            }

            &.show {
                max-width:25px;
                visibility: visible;
                opacity: 1;
            }
        }

        .value {
            margin-top:2px;
            font-size:22px;
            font-weight: 600;
            display:inline-block;
            vertical-align: top;
            margin-left:5px;

            pre {
                font-family: 'Roboto', sans-serif;
                font-size: 13px;
                margin-top:5px;
            }
        }

        &.contract-action {
            padding:0;
            margin:0;
            width:auto;
            float:left;

            .value {
                margin:0;
                font-size: 18px;
                line-height:18px;
                background:$dark-blue;
                border-radius:4px;

                .bubbler {
                    margin:0;
                    background:transparent;
                    color:#fff;
                    box-shadow:0 -1px 0 #3382c9, 0 1px 1px #fff, inset 0 -10px 20px rgba(0,0,0,0.02);
                }
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
            border-bottom:1px solid rgba(0,0,0,0.05);
        }

        .head {
            background:#fff;
            margin-bottom:1px;
            -webkit-app-region: drag;
            padding:20px;
            overflow: hidden;
            width:100%;
            text-align:center;
            display:flex;
            align-items: center;

            .logo {
                line-height: 66px;
                padding-right:3px;
                height:60px;
                width:60px;
                font-size:45px;
                background:$light-blue;
                color:#fff;
                font-family: 'Grand Hotel', sans-serif;
                border-radius:50%;
                text-align:center;
                display:inline-block;
                margin-right:20px;
            }

            .info {
                overflow: hidden;
                text-align:left;
                flex:1;

                .endorsed-network {
                    display:inline-block;
                    font-size: 11px;
                    animation: attention 1s ease-out;
                    animation-iteration-count: infinite;
                    margin-left:3px;
                }

                figure {

                    &:nth-child(1) {
                        font-size:28px;
                        font-weight: 600;
                        width:100%;
                        padding-top:2px;
                        color:$black;
                    }

                    font-size:11px;
                    color:$dark-grey;
                    margin-top:2px;
                }
            }

            .buttons {
                display:flex;


                .button {
                    cursor: pointer;
                    border:2px solid $light-blue;
                    color:$black;
                    height:70px;
                    width:70px;
                    display:flex;
                    justify-content: center;
                    align-items: center;
                    border-radius:4px;
                    font-size: 30px;
                    font-weight: bold;

                    &:not(:first-child){
                        margin-left:10px;
                    }

                    &:hover {
                        background:$light-blue;
                        color:#fff;
                    }

                    &.red {
                        &:hover {
                            border:2px solid $red;
                            background:$red;
                            color:#fff;
                        }
                    }

                    -webkit-app-region: no-drag;
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
                        padding:10px 20px;
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


                            &.whitelist {
                                background:$dark-blue;
                                color:#fff;
                                margin-right:5px;
                                opacity:1;
                                visibility: visible;
                                transition: all 0.3s ease;
                                transition-property: transform, opacity, visibility;

                                &.hide {
                                    opacity:0;
                                    visibility: visible;
                                    transform:translateY(-10px);
                                }
                            }

                            &:hover {
                                transform:translateY(-1px);
                                box-shadow:0 3px 7px rgba(0,0,0,0.08);
                            }

                            &:active {
                                transform:translateY(1px);
                                box-shadow:0 1px 2px rgba(0,0,0,0.2);
                            }

                            &.whitelisted {
                                background:$red;
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
                            padding:10px 20px;
                            font-size:11px;
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