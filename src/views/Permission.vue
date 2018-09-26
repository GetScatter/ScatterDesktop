<template>
    <section class="transfer">

        <!-- ADDRESS BOOK -->
        <section class="address-book">
            <figure class="bg"></figure>

            <section class="head">{{origin}}</section>

            <!--<section class="search">-->
                <!--&lt;!&ndash; INPUT &ndash;&gt;-->
                <!--<section class="input">-->
                    <!--<figure class="icon"><i class="fa fa-search"></i></figure>-->
                    <!--<input placeholder="Search..." />-->
                <!--</section>-->
            <!--</section>-->

            <section class="permissions">

                <!-- IDENTITY PERMISSION -->
                <section class="permission" @click="selected = identityPermission">
                    <figure class="name">Application Link</figure>
                </section>

                <section class="permission" v-for="perm in identityRequirementPermissions" @click="selected = perm;">
                    <figure class="name">Identity Requirements</figure>
                </section>

                <section class="permission" v-for="perm in contractPermissions" @click="selected = perm;">
                    <figure class="name">{{perm.contract}} -> {{perm.action}}</figure>
                </section>

            </section>
        </section>



        <!-- TRANSFER DETAILS -->
        <section class="details" v-if="selected">
            <section class="actions">
                <figure class="action" @click="removeAll">Clear All</figure>
                <figure class="action" @click="removeSelected">Remove Selected</figure>
            </section>

            <section class="data">

                <section class="keyval">
                    <figure class="title">Permission Type</figure>
                    <figure class="description">{{permissionType}}</figure>
                </section>

                <section class="keyval" v-if="isIdentity">
                    <figure class="title">Accounts</figure>
                    <figure class="description" v-if="selected.accounts.length">{{selected.getAccounts().map(x => x.formatted()).join(', ')}}</figure>
                    <figure class="description" v-else>None</figure>
                </section>

                <section class="keyval" v-if="isAction">
                    <figure class="title">Contract -> Action</figure>
                    <figure class="description">{{selected.contract}} -> {{selected.action}}</figure>
                </section>

                <section class="keyval" v-if="isAction">
                    <figure class="title">Mutable Fields</figure>
                    <figure class="description">{{selected.mutableActionFields.join(', ')}}</figure>
                </section>

                <section class="keyval" v-if="selected.isIdentityRequirements">
                    <figure class="title">Required Fields</figure>
                    <figure class="description">{{selected.identityRequirements.join(', ')}}</figure>
                </section>


            </section>

        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import PermissionService from '../services/PermissionService'
    import PopupService from '../services/PopupService'
    import {Popup} from '../models/popups/Popup';

    export default {
        data () {return {
            origin:null,
            selected:null,
        }},
        computed:{
            ...mapState([
                'scatter',
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
            },
            permissionType(){
                if(this.selected.isIdentity) return 'Application Link';
                if(this.selected.isContractAction) return 'Action Whitelist';
            },
            isIdentity(){ return this.selected.isIdentity; },
            isAction(){ return this.selected.isContractAction; },

        },
        mounted(){
            this.origin = this.$route.params.origin;
            if(!this.origin) this.$router.push({name:'home'});
            this.selected = this.identityPermission;
        },
        methods:{
            async removeSelected(){
                if(await PermissionService.removePermission(this.selected)){
                    if(!this.perms.length) return this.$router.push({name:'home'});
                    this.selected = this.perms[0];
                }
            },
            async removeAll(){
                if(await PermissionService.removeAllPermissionsFor(this.origin)) {
                    this.$router.push({name: 'home'});
                }
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .transfer {
        flex:1;
        display:flex;
        flex-direction: row;
        background:rgba(255,255,255,0.5);

        .address-book {
            flex:1;
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
                padding:20px 30px;
                background:#fff;
                font-size: 16px;
                font-weight: 600;
                color:$medium-grey;
                border-top-right-radius:8px;
                box-shadow:10px -10px 20px rgba(0,0,0,0.01);
            }

            .search {
                flex:0 0 auto;
                padding:0 30px;
                overflow: hidden;
                height:40px;
                background:#f3f3f3;
                border-top:1px solid #e1e1e1;
                border-bottom:1px solid #e1e1e1;

                .input {

                    .icon {
                        float:left;
                        font-size: 13px;
                        line-height:40px;
                        color: #aeaeae;
                    }

                    input {
                        margin-left:10px;
                        font-size: 11px;
                        float:left;
                        outline:0;
                        border:0;
                        height:40px;
                        background:transparent;

                    }
                }

            }

            .permissions {
                display:flex;
                flex-direction: column;
                overflow-y:auto;
                overflow-x:hidden;
                background:rgba(0,0,0,0.02);

                .permission {
                    height:40px;
                    line-height:40px;
                    padding:0 10px 0 30px;
                    border-bottom:1px solid rgba(0,0,0,0.05);
                    background:rgba(0,0,0,0);
                    transition: all 0.2s ease;
                    transition-property: background, padding;
                    cursor: pointer;
                    font-size: 13px;
                    overflow: hidden;

                    &:hover {
                        background:#fff;
                        padding-left:35px;
                    }

                    .name {
                        width:calc(100% - 25px);
                        float:left;
                    }

                    .remove {
                        width:25px;
                        height:25px;
                        line-height:24px;
                        margin-top:6px;
                        float:left;
                        text-align:center;
                        border:1px solid rgba(0,0,0,0.1);
                        border-radius: 2px;
                        color:rgba(0,0,0,0.2);
                        transition: all 0.2s ease;
                        transition-property: background, border, color;

                        &:hover {
                            border:1px solid $red;
                            background:$red;
                            color:#fff;
                        }
                    }
                }
            }
        }

        .details {
            float:left;
            flex:2.5;
            display:flex;
            flex-direction: column;
            box-shadow: inset 1px 0 3px rgba(0,0,0,0.1);

            .actions {
                flex:0 0 auto;
                height:80px;
                display: flex;
                justify-content: space-between;
                background:$light-blue;
                padding:0 50px 0 30px;
                float:left;
                width:100%;

                .action {
                    margin-left:10px;
                    cursor: pointer;
                    border-radius: 2px;
                    border:1px solid #fff;
                    height:50px;
                    line-height:48px;
                    padding:0 20px;
                    text-align:center;
                    font-size: 24px;
                    color:#fff;

                    transition:all 0.2s ease;
                    transition-property: background, border, color;

                    &:hover {
                        background:#fff;
                        border:1px solid #fff;
                        color:$light-blue;
                    }
                }
            }

            .data {
                flex:1;
                padding:40px;
                overflow-y:auto;
                overflow-x:hidden;

                .keyval {
                    margin-bottom:30px;
                    border-bottom:1px solid rgba(0,0,0,0.1);
                    padding-bottom:20px;
                }

                .title {
                    font-size: 16px;
                    color:$dark-grey;
                }

                .description {
                    margin-top:5px;
                    font-size: 24px;
                    font-weight: bold;
                }
            }
        }

    }



</style>
