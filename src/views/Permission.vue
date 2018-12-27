<template>
    <section>
        <back-bar v-on:back="back" :buttons="buttons"></back-bar>
        <section v-if="origin" class="panel-container limited">
            <section class="app-details">
                <section class="icon-wrapper">
                    <figure class="icon">
                        <img v-if="getAppData(origin).hasOwnProperty('img')" :src="getAppData(origin).img" />
                    </figure>
                </section>

                <section>
                    <h1>{{getAppData(origin).name}}</h1>
                    <p v-if="getAppData(origin).description">{{getAppData(origin).description}}</p>
                </section>
            </section>

            <section class="split-panel dynamic no-divider">
                <FlatList class="panel"
                            style="flex:1;"
                            :label="locale(langKeys.PERMISSIONS.ListLabel)"
                            :items="permissionsList"
                            selected-icon="icon-check"
                            :selected="selected.id"
                            v-on:selected="selectPermission" />

                <section class="panel" style="flex:2;">
                    <section v-if="selected">
                        <section class="permission-type">
                            <section v-if="selected.isIdentity">{{locale(langKeys.PERMISSIONS.LoginPermission)}}</section>
                            <section class="spanned" v-if="selected.isContractAction">
                                {{selected.contract}} <span>{{selected.action}}</span>
                            </section>
                        </section>



                        <section class="key-val" v-if="isIdentity && selected.accounts.length">
                            <figure>{{locale(langKeys.PERMISSIONS.AccountsLabel)}}</figure>
                            <figure>{{selected.getAccounts().map(x => x.formatted()).join(', ')}}</figure>
                        </section>

                        <section class="key-val" v-if="selected.isIdentityRequirements">
                            <figure>{{locale(langKeys.PERMISSIONS.RequiredFieldsLabel)}}</figure>
                            <figure>{{selected.identityRequirements.join(', ')}}</figure>
                        </section>

                        <section class="key-val" v-if="isAction">
                            <figure>{{locale(langKeys.PERMISSIONS.MutableFieldsLabel)}}</figure>
                            <figure>{{selected.mutableActionFields.join(', ')}}</figure>
                        </section>


                        <section class="action-box">
                            <section class="key-val">
                                <figure>{{locale(langKeys.PERMISSIONS.RemoveLabel)}}</figure>
                                <figure v-if="isIdentity">{{locale(langKeys.PERMISSIONS.RemoveIdentityText)}}</figure>
                                <figure v-if="isAction">{{locale(langKeys.PERMISSIONS.RemoveWhitelistLabel)}}</figure>

                                <btn style="width:200px; float:right;"
                                     :text="locale(langKeys.GENERIC.Remove)" red="1"
                                     v-on:clicked="removeSelected" />
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
    import * as Actions from '../store/constants';
    import PermissionService from "../services/PermissionService";
    import AppsService from "../services/AppsService";
    import FlatList from '../components/reusable/FlatList';

    export default {
    	components:{
		    FlatList
        },
        data () {return {
	        origin:null,
            selected:null,
            buttons:[],
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
	        isIdentity(){ return this.selected.isIdentity; },
	        isAction(){ return this.selected.isContractAction; },
	        permissionsList(){
                return [this.identityPermission].concat(this.contractPermissions).map(permission => ({
	                id:permission.id,
	                title:this.permissionTitle(permission),
	                description:this.permissionDescription(permission),
                }));
            }
        },
        mounted(){
        	this.buttons = [
		        {text:this.locale(this.langKeys.GENERIC.RemoveAll), clicked:this.removeAll, red:true}
            ];

	        this.origin = this.$route.params.origin;
	        if(!this.origin) return this.back();
	        this.selected = this.identityPermission;
        },
        methods:{
        	back(){
		        this.$router.push({name:this.RouteNames.HOME});
            },
            selectPermission(item){
        	    this.selected = this.permissions.find(x => x.id === item.id);
            },
            permissionTitle(permission){
        	    return permission.isIdentity
                    ? this.locale(this.langKeys.PERMISSIONS.LoginPermission) :
                    `${permission.action}`;
            },
	        permissionDescription(permission){
		        return permission.isContractAction ? `${this.locale(this.langKeys.PERMISSIONS.ActionWhitelist)} - ${permission.contract}` : '';
	        },
	        getAppData:AppsService.getAppData,
	        async removeSelected(){
		        if(await PermissionService.removePermission(this.selected)){
			        if(!this.perms.length) return this.back();
			        this.selected = this.perms[0];
		        }
	        },
	        async removeAll(){
		        if(await PermissionService.removeAllPermissionsFor(this.origin))
			        this.back();
	        }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .panel {
        flex:1;
        position: relative;
        display:flex;
        flex-direction: column;
    }

    .permission-type {
        margin-top:20px;
        display:table;
        border-radius:24px;
        font-size: 12px;
        font-weight:bold;
        background:$primary;
        color:#fff;
        overflow: hidden;
        margin-bottom:30px;

        span {
            background:rgba(0,0,0,0.05);
            padding:10px 20px;
            margin-left:10px;
        }

        section {
            padding:10px 20px;

            &.spanned {
                padding-right:0;
            }
        }
    }


    .app-details {
        display:flex;
        align-items: center;

        $icon-bounds:70px;
        .icon-wrapper {
            width:$icon-bounds;
            height:$icon-bounds;
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            cursor: pointer;
            margin-right:20px;


            .icon {
                width:$icon-bounds;
                height:$icon-bounds;
                background-image: url(../assets/no_logo.png);
                background-repeat: no-repeat;
                background-size: contain;
                background-position: 50%;
                background-color: #f7f7f7;
                overflow: hidden;

                img {
                    width:100%;
                    height:100%;
                    border-radius:22px;
                }
            }
        }

        h1 {
            margin-bottom:0;
            flex:1;
        }

        p {
            flex:1;
        }

    }

    .split-panel {
        margin-top:30px;
        .container {
            padding:0 30px 0 0;
        }
    }


</style>
