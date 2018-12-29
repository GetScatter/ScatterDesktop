<template>
    <section>
        <PopOutHead v-on:closed="returnResult" :hide-close="hideCloseButton" />
        <section class="multi-pane">


            <!-- MAIN PANEL -->
            <section class="main-panel">
                <PopOutAction :origin="popup.origin()" :action="limitedMessages.actions" />
                <figure class="has-more" v-if="limitedMessages.total > 1">{{locale(langKeys.POPOUTS.SIGNATURE.ActionsTotal,limitedMessages.total)}}</figure>
                <section class="participants" :class="{'top-less':limitedMessages.total <= 1}" v-if="participantAccounts">
                    <label>{{locale(langKeys.POPOUTS.SIGNATURE.AccountsInvolved)}}</label>
                    <section class="participant" v-for="p in participantAccounts">
                        {{`${p.network().name} - ${p.sendable()}`}}
                        <span v-if="resources[p.identifiable()]">
                            <b>{{resourcesFor(p)}}</b>
                        </span>
                    </section>
                </section>
                <section class="participants top-less" v-if="isArbitrarySignature">
                    <label>{{locale(langKeys.POPOUTS.SIGNATURE.KeysInvolved)}}</label>
                    <section class="participant">{{arbitraryKeypair.name}} -- {{payload.publicKey.substr(0,6)}}.....{{payload.publicKey.substr(payload.publicKey.length - 5)}}</section>
                </section>

                <section class="fixed-actions">

                    <section v-if="cannotSignArbitrary" class="disclaimer less-pad red centered" style="margin-bottom:10px;">
                        {{locale(langKeys.POPOUTS.SIGNATURE.ArbitraryDisabledTitle)}}
                        <p>{{locale(langKeys.POPOUTS.SIGNATURE.ArbitraryDisabledDesc)}}</p>
                    </section>

                    <!-- ACCEPT TRANSACTION -->
                    <btn blue="1" v-if="!pinning"
                         :disabled="!isValidIdentity || cannotSignArbitrary"
                         :text="locale(langKeys.GENERIC.Allow)"
                         v-on:clicked="accepted" />

                    <!-- DENY TRANSACTION -->
                    <btn :text="locale(langKeys.GENERIC.Deny)" v-if="!pinning"
                         v-on:clicked="returnResult(false)" />

                    <section v-if="!isArbitrarySignature">
                        <br>
                        <br>
                        <label style="text-align:center;">{{locale(langKeys.POPOUTS.SIGNATURE.WhitelistDesc)}}</label>

                        <btn :red="!whitelisted" :blue="whitelisted"
                             :text="whitelisted
                             	? locale(langKeys.POPOUTS.SIGNATURE.DisableWhitelistButton)
								: locale(langKeys.POPOUTS.SIGNATURE.EnableWhitelistButton)"
                             v-on:clicked="whitelist" />
                    </section>
                </section>
            </section>


            <!--SIDE PANEL-->
            <figure class="side-bar" :class="!expanded ? 'icon-right-open-big' : 'icon-left-open-big'" @click="$emit('expanded', 500, null, true)"></figure>
            <section class="side-panel" v-if="!expanded">

                <section class="view-types">
                    <sel :selected="viewType" short="1"
                         :options="viewTypesArray"
                         :parser="x => formatViewType(x)"
                         v-on:changed="x => viewType = x"></sel>
                </section>

                <section class="scroller">

                    <RequiredFields v-if="!isArbitrarySignature && (personalFields.length || locationFields.length)"
                                    :identity="identity" :fields="fields"
                                    :selected-identity="selectedIdentity"
                                    :cloned-location="clonedLocation"
                                    :selected-location="selectedLocation"
                                    split-panels="1"
                                    v-on:selectLocation="x => { selectedLocation = x; clonedLocation = x.clone(); }"
                                    v-on:locationField="(key, val) => clonedLocation[key] = val"
                                    v-on:personalField="(key, val) => selectedIdentity.personal[key] = val" />

                    <section class="messages" :ref="`message_${index}`" v-for="(message, index) in messages">

                        <section class="whitelist-overlay" v-if="isPreviouslyWhitelisted(message)">
                            <section class="box">
                                <figure class="info">{{locale(langKeys.POPOUTS.SIGNATURE.PreviouslyWhitelisted)}}</figure>
                            </section>
                        </section>

                        <section :class="{'previous-whitelist':isPreviouslyWhitelisted(message)}">

                            <section class="details">
                                <figure class="title">
                                    <input v-if="whitelisted && !isPreviouslyWhitelisted(message)"
                                           :checked="!!getWhitelist(message)"
                                           type="checkbox"
                                           @change="addWhitelist(message)" />

                                    <span @click="collapse(message)">{{message.code}} <i class="contract-split icon-right-open-big"></i> {{message.type}}</span>
                                </figure>
                            </section>

                            <section v-if="!isCollapsed(message)">
                                <br>
                                <section class="properties" v-for="(value,key) in message.data" v-if="viewType === VIEW_TYPES.HUMAN">
                                    <label>{{key}}</label>
                                    <section class="split-inputs">
                                        <input v-if="whitelisted && !isPreviouslyWhitelisted(message)" type="checkbox" @change="toggleWhitelistProp(getWhitelist(message), key)" />
                                        <figure class="value object" v-if="typeof value === 'object'">
                                            <div :ref="key + hash(value)" :v-html="formatJson(value, key)"></div>
                                        </figure>
                                        <figure class="value" v-else>{{value}}</figure>
                                    </section>
                                </section>
                                <section class="properties" v-if="viewType === VIEW_TYPES.JSON">
                                    <div class="value object" :ref="hash(message.data)" :v-html="formatJson(message.data)"></div>
                                </section>
                                <section class="properties" v-if="viewType === VIEW_TYPES.RICARDIAN">
                                    <figure class="collapsed" v-if="!hasRicardianContract(message)">No Ricardian Contract</figure>
                                    <figure class="ricardian" v-else v-html="message.ricardian"></figure>
                                </section>
                            </section>

                            <section class="collapsed" v-else>
                                {{locale(langKeys.POPOUTS.SIGNATURE.HiddenActions)}}
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
	import PopOutHead from '../../components/popouts/PopOutHead';
	import PopOutAction from '../../components/popouts/PopOutAction';
	import SearchBar from '../../components/reusable/SearchBar';
	import FullWidthRow from '../../components/reusable/FullWidthRow';
	import JSONFormatter from 'json-formatter-js'
	import Hasher from "../../util/Hasher";
	import Account from "../../models/Account";
	import PopupService from "../../services/PopupService";
	import {Popup} from "../../models/popups/Popup";
	import PermissionService from "../../services/PermissionService";
	import {Blockchains} from "../../models/Blockchains";
	import {IdentityRequiredFields} from "../../models/Identity";
	import RequiredFields from "../../components/popouts/RequiredFields";
	import KeyPairService from "../../services/KeyPairService";
	import ResourceService from "../../services/ResourceService";

	const VIEW_TYPES = {
	    HUMAN:'human',
        JSON:'json',
        RICARDIAN:'ricardian',
    };

	export default {
		props:['popup', 'expanded', 'pinning'],
		components:{
			RequiredFields,
			PopOutHead,
			PopOutAction,
			FullWidthRow,
			SearchBar,
		},
		data () {return {
			Blockchains,
            whitelisted:false,
			whitelists:[],
			actionList:[],

            viewType:VIEW_TYPES.HUMAN,
            VIEW_TYPES,

			selectedIdentity:null,
			selectedLocation:null,
			clonedLocation:null,
			hideCloseButton:false,
		}},
		created(){
			this.selectedIdentity = this.identity.clone();
			this.selectedLocation = this.selectedIdentity.locations[0];
			this.clonedLocation = this.selectedIdentity.locations[0].clone();

			this.participantAccounts.map(async acc => {
				if(ResourceService.usesResources(acc)){
					const resources = await ResourceService.getResourcesFor(acc);
					this[Actions.ADD_RESOURCES]({acc:acc.identifiable(), res:resources});
                }
            })
		},
		computed: {
			...mapState([
				'scatter',
				'resources',
			]),
			...mapGetters([
				'identity',
				'identities',
				'accounts',
				'networks',
			]),
            viewTypesArray(){
			    const hasEos = !this.isArbitrarySignature && !!this.payload.participants.find(x => Account.fromJson(x).blockchain() === Blockchains.EOSIO);
			    const arrMap = [VIEW_TYPES.HUMAN, VIEW_TYPES.JSON];
			    if(hasEos) arrMap.push(VIEW_TYPES.RICARDIAN);
			    return arrMap;
            },
            payload(){ return this.popup.payload(); },
			participantAccounts(){
				if(!this.payload.hasOwnProperty('participants')) return null;
				return this.payload.participants.map(x => {
					return Account.fromJson(x);
                })
			},
			messages(){
				return this.payload.messages;
			},
            limitedMessages(){
                return {
                	actions:this.messages.slice(0, 3).map(x => x.type).join(', '),
                    total:this.messages.length
                }
            },
			isArbitrarySignature(){
				return !this.payload.hasOwnProperty('participants');
			},
			fields(){
				return IdentityRequiredFields.fromJson(this.payload.requiredFields || {});
			},
			personalFields(){
				return this.fields.personal;
			},
			locationFields(){
				return this.fields.location;
			},
			missingFields(){
				if(!this.personalFields.length && !this.locationFields.length) return false;
				return !this.identity.hasRequiredFields(this.fields);
			},
			isValidIdentity() {
				return this.selectedIdentity.hasRequiredFields(this.fields, this.clonedLocation);
			},
            arbitraryKeypair(){
	            return KeyPairService.getKeyPairFromPublicKey(this.payload.publicKey);
            },
            cannotSignArbitrary(){
				if(!this.isArbitrarySignature) return false;
				return this.payload.messages[0].data.signing.split(' ').some(x => x.length > 12);
            }
		},
		methods: {
			returnResult(result){
				this.$emit('returned', result);
			},

			resourcesFor(account){
			    const resources = this.resources[account.identifiable()];
			    if(!resources) return;

			    if(account.blockchain() === Blockchains.EOSIO){
			    	const cpu = resources.find(x => x.name === "CPU");
			    	return parseFloat(cpu.percentage).toFixed(2) + '% CPU';
                }
            },

            formatViewType(type){
			    switch(type){
                    case VIEW_TYPES.HUMAN: return 'Human Readable';
                    case VIEW_TYPES.JSON: return 'JSON Format';
                    case VIEW_TYPES.RICARDIAN: return 'Ricardian Contracts';
                }
            },

			collapse(message){
                this.toggleAction(message, 'collapsed');
            },
            isCollapsed(message){
				return this.actionList.find(x => x === this.getMessageUnique(message, 'collapsed'))
            },

			async accepted(){
				// const needResources = this.payload.hasOwnProperty('participants') ? await ResourceService.transactionNeedsResources(this.payload.participants) : false;

				this.returnResult({
					whitelists:this.whitelists,

					identity:this.selectedIdentity,
					location:this.clonedLocation,
					missingFields:this.missingFields,

					accepted:true,
					needResources:false,
				});
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
						useToJSON: true
					});
					const elem = this.$refs[refKey][0];
					if(elem.children.length >= 1) return false;
					elem.appendChild(formatter.render());
				});
			},

			whitelist(){
				this.hideCloseButton = true;
				const finish = bool => {
					this.whitelisted = bool;
					this.hideCloseButton = false;
					this.messages.map(message => {
						if(!this.isPreviouslyWhitelisted(message)) this.addWhitelist(message);
					})
				};

				if(this.whitelisted) return finish(false);

				PopupService.push(Popup.enableWhitelist(accepted => {
					finish(accepted);
				}));
            },


			getMessageUnique(message, action){
				return `${message.code}:${message.type}:${action}`
			},
			getWhitelist(message){
				const unique = this.getMessageUnique(message, 'whitelist');
				return this.whitelists.find(x => x.unique === unique);
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

				if(this.whitelists.length === 0) this.whitelisted = false;
			},
			toggleWhitelistProp(whitelist, prop){
				if(whitelist.props.includes(prop))
					whitelist.props = whitelist.props.filter(x => x !== prop);
				else whitelist.props.push(prop);
			},
			isPreviouslyWhitelisted(message){
				if(this.isArbitrarySignature) return false;
				return PermissionService.hasActionPermission(this.payload.origin, this.identity, this.participantAccounts, message);
			},
			hasRicardianContract(message){
				return message.hasOwnProperty('ricardian') && message.ricardian.length
			},

            ...mapActions([
            	Actions.ADD_RESOURCES
            ])
		}
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../styles/variables";

    .scroller {
        display:flex;
        flex-direction: column;
        flex:1;
        overflow:auto;
        margin-left:-30px;
        margin-right:-30px;
        margin-bottom:-40px;
        padding:0 30px;
    }

    .view-types {
        position: relative;
        margin-top:-10px;
        margin-left:-30px;
        margin-right:-30px;
        background:#fff;
        padding:10px;
        box-shadow:0 1px 3px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.02);
    }

    input[type=checkbox] {
        flex:0 0 auto;
        align-self: flex-start;
        margin-right:10px;
        width:20px;
        height:20px;
        cursor: pointer;
    }

    .has-more {
        text-align:center;
        font-size:11px;
        font-weight: bold;
        color:$dark-grey;
        border-radius:4px;
        border:1px solid $medium-grey;
        display:table;
        padding:3px 6px;
        margin:-25px auto 0;
    }

    .messages {
        padding:20px 0 20px;
        position: relative;

        &:not(:first-child){
            padding:30px 0 20px;

            &:after {
                content:'';
                position:absolute;
                top:0;
                left:-30px;
                right:-30px;
                height:2px;
                background:rgba(0,0,0,0.05);
                box-shadow:inset 0 1px 3px rgba(0,0,0,0.08), 0 1px 1px #fff;
            }
        }

        .previous-whitelist {
            opacity:0.4;
            cursor: not-allowed;
        }

        .collapsed {
            padding-top:10px;
            font-size: 11px;
        }

        .whitelist-overlay {
            position:absolute;
            top:50px;
            right:0;
            z-index:2;
            display:flex;
            justify-content: center;
            align-items: center;

            .box {
                width:150px;
                padding:20px;
                background:#fff;
                text-align:center;
                //border:1px solid $primary;
                border-radius:4px;
                box-shadow:0 2px 4px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.03);
                font-size: 13px;
                font-weight: bold;
            }
        }

        .details {
            .title {
                align-items: center;
                display: flex;
                font-size: 14px;
                cursor: pointer;

                &:hover {
                    text-decoration: underline;
                }
            }

            .contract-split {
                padding:0 5px;
                font-size: 13px;
                display:inline-block;
                animation: bounce 0.7s infinite;
            }

            @keyframes bounce {
                0%, 100% {
                    transform:translateX(-2px);
                }

                50% {
                    transform:translateX(2px);

                }
            }
        }

        .properties {

            .ricardian {
                background:rgba(0,0,0,0.05);
                border:1px solid rgba(0,0,0,0.15);
                border-radius:4px;
                padding:10px;
            }

            label {
                margin-bottom:5px;
            }

            .value {
                overflow-x:auto;
                min-height:16px;
                font-size: 16px;
                font-weight: bold;

                &.object {
                    font-size: 13px;
                    font-weight: 500;
                }
            }

            &:not(:last-child){
                .value {
                    margin-bottom:20px;
                }
            }
        }
    }

    .json-formatter-dark.json-formatter-row {
        padding:0;
    }


</style>
