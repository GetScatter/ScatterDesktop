<template>
    <section>

        <!-- IDENTITY -->
        <section class="identity">
            <!-- INFO -->
            <section class="info">
                <figure class="name">{{identity.name}}</figure>
                <figure class="description">This is your Identity.</figure>
            </section>

            <!-- ACTIONS -->
            <section class="actions">
                <router-link :to="{name:'identity'}"  class="action" v-tooltip="'Edit'">
                    <i class="fa fa-pencil"></i>
                </router-link>
            </section>
        </section>




        <!-- PERMISSIONS -->
        <section class="permissions">

            <!-- SEARCH -->
            <section class="search" v-if="Object.keys(origins).length || searchTerms.length">

                <!-- INPUT -->
                <section class="input">
                    <figure class="icon"><i class="fa fa-search"></i></figure>
                    <input placeholder="Search Permissions..." v-model="searchTerms" />
                </section>

                <!-- ACTIONS -->
                <section class="actions">
                    <figure class="action find-more" @click="openApps">Find More Apps</figure>
                    <figure class="action" @click="removeAllPermissions">Clear All</figure>
                </section>

            </section>


            <!-- PERMISSIONS LIST -->
            <section class="permissions-list">

                <section v-if="!Object.keys(origins).length && !searchTerms.length" class="no-permissions">
                    <section class="container">
                        <figure class="title">No Apps</figure>
                        <figure class="link" @click="openApps">Click here to find some</figure>
                    </section>
                </section>

                <section class="permission" v-for="(permCount, origin) in origins" :class="{'clickable':getAppData(origin).url.length}">
                    <section class="info">
                        <figure class="logo" @click="openApp(origin)">
                            <img v-if="originLogo(origin)" :src="originLogo(origin)" />
                            <figure class="no-meta" v-else>
                                <figure><i class="fa fa-ban"></i> No<br>Meta</figure>
                            </figure>
                        </figure>

                        <section class="details">
                            <figure class="name" @click="openApp(origin)">{{getAppData(origin).name}}</figure>
                            <figure class="type" v-if="getAppData(origin).type.length">{{getAppData(origin).type}}</figure>
                            <figure class="description" v-if="getAppData(origin).description.length"><b>{{getAppData(origin).description}}</b></figure>
                            <figure class="description">Link Permission
                                <span v-if="permCount - 1 > 0"> and {{permCount - 1}} Action Permission{{permCount -1 > 0 ? 's' : ''}}</span>
                                <span v-else>only</span>
                            </figure>
                        </section>
                    </section>

                    <section class="actions">
                        <router-link :to="{name:'permission', params: { origin }}" class="action" v-tooltip="'Edit'">
                            <i class="fa fa-pencil"></i>
                        </router-link>
                        <figure class="action red" v-tooltip="'Remove'" @click="removePermissions(origin)">
                            <i class="fa fa-ban"></i>
                        </figure>
                    </section>
                </section>

            </section>

        </section>



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import PermissionService from '../services/PermissionService';
    import ElectronHelpers from '../util/ElectronHelpers';
    import {BlockchainsArray, blockchainName} from '../models/Blockchains';

    let saveTimeout = null;

    export default {
        data () {return {
            searchTerms:'',
            appData:null,
            images:[],
        }},
        computed:{
            ...mapState([
                'scatter',
                'dappLogos',
                'dappData',
            ]),
            ...mapGetters([
                'identity',
                'permissions',
                'apps',
            ]),
            origins(){
                const origins = {};

                this.permissions.map(p => {
                    if(!Object.keys(origins).includes(p.origin)) origins[p.origin] = 1;
                    else origins[p.origin] += 1;
                });

                return Object.keys(origins).reduce((acc, origin) => {
                    if(origin.toString().toLowerCase().indexOf(this.searchTerms.toLowerCase()) !== -1)
                        acc[origin] = origins[origin];

                    return acc;
                }, {});
            }
        },
        mounted(){
            fetch(`https://rawgit.com/GetScatter/ScatterApps/master/apps.json?rand=${Math.random() * 10000 + 1}`).then(res => res.json()).then(res => {
                let allApps = [];
                BlockchainsArray.map(({value}) => {
                    allApps = allApps.concat(res[blockchainName(value)]);
                });
                allApps = allApps.reduce((acc,x) => {
                    acc[x.applink] = x;
                    return acc;
                })
                this[Actions.SET_DAPP_DATA](allApps);
            });
        },
        methods:{
            getAppData(origin){
                const emptyResult = {
                    type:'',
                    name:origin,
                    description:'',
                    logo:'',
                    url:'',
                };

                const found = this.dappData[origin];
                if(!found) return emptyResult;

                if(!this.dappLogos.hasOwnProperty(origin)){
                    this[Actions.SET_DAPP_LOGO]({origin, logo:null});
                    const logo = `https://rawgit.com/GetScatter/ScatterApps/master/logos/${found.applink}.svg`;
                    fetch(logo).then(res => {
                        this[Actions.SET_DAPP_LOGO]({origin, logo:res.status === 200 ? logo : null});
                        this.$forceUpdate();
                    })
                }

                return found;
            },
            originLogo(origin){
                return this.dappLogos[origin];
            },
            openApps(){
                ElectronHelpers.openLinkInBrowser('https://github.com/GetScatter/ScatterApps/')
            },
            openApp(origin){
                const data = this.getAppData(origin);
                if(data.url.length){
                    ElectronHelpers.openLinkInBrowser(data.url);
                }

            },
            removePermissions(origin){
                PermissionService.removeAllPermissionsFor(origin);
            },
            removeAllPermissions(){
                PermissionService.removeAllPermissions();
            },
            ...mapActions([
                Actions.SET_DAPP_LOGO,
                Actions.SET_DAPP_DATA,
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .identity {
        background:#fff;
        height:100px;
        padding:0 50px;
        overflow: hidden;
        display:flex;
        justify-content: center;
        align-items: center;

        .info {
            width:calc(100% - 160px);
            float:left;

            .name {
                font-size: 24px;
                font-weight: bold;
            }

            .description {
                font-size: 13px;
            }
        }

        .actions {
            width:160px;
            float:left;

            .action {
                margin-left:10px;
                cursor: pointer;
                border-radius: 2px;
                width:40px;
                height:40px;
                line-height:40px;
                text-align:center;
                font-size: 18px;
                color:#959595;
                float:right;

                transition:all 0.2s ease;
                transition-property: background, border, color;

                &.red {
                    background:$red;
                    color:#fff;
                }

                &:hover {
                    background:$light-blue;
                    color:#fff;
                }

                &.padded {
                    width:auto;
                    padding:0 10px;
                }
            }
        }
    }

    .permissions {
        width:100%;
        flex:1;
        display:flex;
        flex-direction: column;

        .search {
            padding:0 50px;
            overflow: hidden;
            height:40px;
            background:#f3f3f3;
            border-top:1px solid #e1e1e1;
            display:flex;


            .input {
                align-self: flex-start;
                flex:1 0 auto;

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

            .actions {
                align-self: flex-end;
                line-height:40px;
                text-align:right;
                flex:0 0 auto;
                display:flex;

                .action {
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 500;

                    text-decoration: none;
                    border:1px solid rgba(0,0,0,0.1);
                    border-radius:4px;
                    line-height:22px;
                    height:auto;
                    justify-content: center;
                    align-items: center;
                    display:flex;
                    margin:10px 0 7px 10px;
                    padding:0 10px;

                    transition: all 0.2s ease;
                    transition-property: background, color, border;

                    &:hover {
                        color:#fff;
                        background:rgba(0,0,0,0.3);
                        border:1px solid transparent;
                    }
                }
            }

        }

        .permissions-list {
            flex:1;
            display:flex;
            flex-direction: column;
            padding:0 40px 50px 50px;
            overflow-y:auto;
            border-top:1px solid rgba(0,0,0,0.1);

            .no-permissions {
                flex:1;
                display:flex;
                text-align:center;
                justify-content:center;
                align-items: center;
                padding:50px;

                .container {
                    max-width:500px;
                    margin:0 auto;
                }

                .title {
                    font-size: 46px;
                    font-weight: 500;
                    margin-bottom:10px;
                    color: #d6d6d6;
                    text-shadow:0 -1px 1px rgba(0,0,0,0.6), 0 1px 0 #fff;
                }

                .link {
                    font-size: 22px;
                    cursor: pointer;
                    color:$dark-blue;
                    font-weight: bold;
                    padding:10px 20px;
                    border:2px solid $dark-blue;
                    border-radius:4px;
                    transform:translateY(0px);
                    box-shadow:0 100px 50px rgba(0,0,0,0);
                    opacity:1;

                    transition: all 0.2s ease;
                    transition-property: background, color, transform, box-shadow, opacity;

                    &:hover {
                        color:#fff;
                        background:$light-blue;
                        transform:translateY(-2px);
                        box-shadow:0 3px 1px rgba(0,0,0,0.2);
                    }

                    &:active {
                        transform:scale(1.05);
                        opacity:0;
                        box-shadow:0 0 500px rgba(0,0,0,0.5);
                    }
                }
            }




            .permission {
                flex:0 0 auto;
                padding:20px 0;
                overflow: hidden;
                display:flex;
                justify-content: center;
                align-items: center;

                &:not(:last-child){
                    border-bottom:1px solid #d9d9d9;
                }

                .info {
                    width:calc(100% - 150px);
                    float:left;
                    overflow: hidden;

                    .logo {
                        width:50px;
                        height:50px;
                        float:left;
                        margin-right:20px;

                        img {
                            width:100%;
                            height:100%;
                        }

                        .no-meta {
                            width:100%;
                            height:100%;
                            background:rgba(0,0,0,0.05);
                            color:rgba(0,0,0,0.4);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            text-align:center;
                            border-radius:50%;
                            font-size: 9px;
                            font-weight: bold;
                            box-shadow:inset 0 5px 10px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,1);
                        }
                    }

                    .details {
                        float:left;

                        .type {
                            font-size: 9px;
                            font-weight: bold;
                            border:1px solid rgba(0,0,0,0.2);
                            margin-bottom:3px;
                            padding:3px 5px;
                            vertical-align: middle;
                            margin-left:5px;
                            width:auto;
                            display:inline-block;
                            border-radius:4px;
                        }

                        .name {
                            font-weight: 600;
                            font-size: 18px;
                            display: inline-block;
                            color:$black;
                            transition: all 0.2s ease;
                            transition-property: border-bottom, color;
                        }

                        .description {
                            margin-top:3px;
                            font-size: 9px;

                            &:not(:last-child){
                                padding-bottom:5px;
                                margin-bottom:5px;
                                border-bottom:1px solid rgba(0,0,0,0.1);
                            }
                        }
                    }
                }

                .actions {
                    float:left;
                    width:150px;

                    .action {
                        margin-left:10px;
                        cursor: pointer;
                        border-radius: 2px;
                        width:40px;
                        height:40px;
                        line-height:40px;
                        text-align:center;
                        font-size: 18px;
                        color:#959595;
                        float:right;

                        transition:all 0.2s ease;
                        transition-property: background, border, color;

                        &:hover {
                            background:$light-blue;
                            color:#fff;
                        }

                        &.red {
                            &:hover {
                                background:$red;
                            }
                        }
                    }
                }



                &.clickable {
                    &:hover {
                        .info {
                            .name {
                                cursor: pointer;
                                color:$dark-blue;
                                animation: pulsate 1s ease-out;
                                animation-iteration-count: infinite;
                            }

                            .logo {
                                cursor: pointer;
                            }
                        }

                    }

                    .info {
                        .details {
                            .name {
                                &:hover {
                                    color:$dark-blue;
                                }
                            }
                        }
                    }
                }
            }

        }

    }


</style>
