<template>
    <section>

        <section>
            <section class="head">
                <i class="fa fa-trash-o" @click="removeAllPermissions" v-tooltip="'Delete All Origin Permissions'"></i>
            </section>

            <section class="selected-item scrollable" v-if="perms.length">

                <figure class="name">{{origin}}</figure>
                <figure class="description">
                    Below are permissions issued to {{origin}}.<br>
                    <b class="red">NEVER CREATE CONTRACT ACTION PERMISSIONS WITH TOKEN TRANSFERS</b>
                </figure>

                <section class="split-panels left">
                    <section class="info-box" v-if="identityPermission || identityRequirementPermissions.length">
                        <figure class="header">Identity / Account Permission</figure>

                        <section class="contract-permissions" v-if="identityPermission">
                            <section class="permission" @click="removePermission(identityPermission)">
                                <section class="kv">
                                    <figure class="key">Origin</figure>
                                    <figure class="value">{{identityPermission.origin}}</figure>
                                </section>
                                <section class="kv">
                                    <figure class="key">Identity</figure>
                                    <figure class="value">{{identityPermission.getIdentity().name}}</figure>
                                </section>
                                <section v-if="identityPermission.getAccounts().length">
                                    <section class="kv" v-for="account in identityPermission.getAccounts()">
                                        <figure class="key">Account</figure>
                                        <figure class="value">{{account.formatted()}}</figure>
                                    </section>
                                </section>
                            </section>
                        </section>

                        <section v-if="identityRequirementPermissions.length">
                            <br><br>
                            <figure class="header">Identity Fields Requirement Permissions</figure>

                            <section class="contract-permissions">
                                <section class="permission" v-for="perm in identityRequirementPermissions" @click="removePermission(perm)">
                                    <section class="kv">
                                        <figure class="key">Origin</figure>
                                        <figure class="value">{{perm.origin}}</figure>
                                    </section>
                                    <section class="kv">
                                        <figure class="key">Identity</figure>
                                        <figure class="value">{{perm.getIdentity().name}}</figure>
                                    </section>
                                    <section v-if="perm.identityRequirements.length">
                                        <section class="kv" v-for="field in perm.identityRequirements">
                                            <figure class="key red">Required Field</figure>
                                            <figure class="value">{{field}}</figure>
                                        </section>
                                    </section>
                                </section>
                            </section>
                        </section>
                    </section>
                </section>

                <section class="split-panels" v-if="contractPermissions.length">
                    <section class="info-box">
                        <figure class="header">Contract Permissions</figure>

                        <section class="contract-permissions">
                            <section class="permission" v-for="perm in contractPermissions" @click="removePermission(perm)">
                                <section class="kv">
                                    <figure class="key">Origin</figure>
                                    <figure class="value">{{perm.origin}}</figure>
                                </section>
                                <section class="kv">
                                    <figure class="key">Identity</figure>
                                    <figure class="value">{{perm.getIdentity().name}}</figure>
                                </section>
                                <section class="kv">
                                    <figure class="key">Contract</figure>
                                    <figure class="value">{{perm.contract}}</figure>
                                </section>
                                <section class="kv">
                                    <figure class="key">Action</figure>
                                    <figure class="value">{{perm.action}}</figure>
                                </section>
                                <section v-if="perm.mutableActionFields.length">
                                    <section class="kv" v-for="field in perm.mutableActionFields">
                                        <figure class="key red">Mutable Field</figure>
                                        <figure class="value">{{field}}</figure>
                                    </section>
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

    import Network from '../../models/Network'

    import {Popup} from '../../models/popups/Popup'
    import PopupService from '../../services/PopupService';

    import PluginRepository from '../../plugins/PluginRepository';

    let saveTimeout = null;

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'permissions',
            ]),
            identityPermission(){
                return this.perms.find(x => x.isIdentity);
            },
            contractPermissions(){
                return this.perms.filter(x => x.isContractAction);
            },
            identityRequirementPermissions(){
                return this.perms.filter(x => x.isIdentityRequirements);
            },
            perms(){
                return this.permissions.filter(x => x.origin === this.origin);
            }
        },
        mounted(){

        },
        methods: {
            async removeAllPermissions(){
                PopupService.push(Popup.prompt("Removing All Origin Permissions", "Are you sure?", "trash-o", "Yes", async accepted => {
                    if(!accepted) return;
                    const scatter = this.scatter.clone();
                    scatter.keychain.permissions = scatter.keychain.permissions.filter(x => x.origin !== this.origin);
                    await this[Actions.SET_SCATTER](scatter);
                    this.backToMenu();
                    PopupService.push(Popup.snackbar("All Origin Permissions Removed!", "check"));
                }, "Cancel"))
            },
            async removePermission(permission){
                PopupService.push(Popup.prompt("Removing Permission", "Are you sure?", "trash-o", "Yes", async accepted => {
                    if(!accepted) return;
                    const scatter = this.scatter.clone();
                    scatter.keychain.permissions = scatter.keychain.permissions.filter(x => x.checksum() !== permission.checksum());
                    await this[Actions.SET_SCATTER](scatter);
                    this.backToMenu();
                    PopupService.push(Popup.snackbar("Permission Removed!", "check"));
                }, "Cancel"))
            },
            backToMenu(){
                if(!this.perms.length) this.$emit('emptied');
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['origin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .contract-permissions {

        .permission {
            cursor: pointer;
            padding:20px;
            border:2px solid rgba(0,0,0,0.2);
            border-radius:4px;
            margin-bottom:10px;

            transition: all 0.2s ease;
            transition-property: background, border, color;

            .kv {
                font-size:13px;
                border-bottom:1px solid rgba(0,0,0,0.1);
                padding-bottom:5px;

                &:not(:last-child){
                    margin-bottom:5px;
                }

                .key {
                    display:inline-block;
                    width:120px;
                    color:$medium-grey;
                    font-weight: 800;

                    transition: all 0.2s ease;
                    transition-property: background, border, color;

                    &.red {
                        color:$red;
                    }
                }

                .value {
                    display:inline-block;
                    font-weight: 600;
                    color:$dark-grey;

                    transition: all 0.2s ease;
                    transition-property: background, border, color;
                }
            }

            &:hover {
                background:$red;
                color:#fff !important;
                border:2px solid $dark-red;

                * { color:#fff !important; }
            }

        }

    }



</style>
