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
            <section class="search" v-if="Object.keys(origins).length">

                <!-- INPUT -->
                <section class="input">
                    <figure class="icon"><i class="fa fa-search"></i></figure>
                    <input placeholder="Search Permissions..." />
                </section>

                <!-- ACTIONS -->
                <section class="actions">
                    <figure class="action" @click="removeAllPermissions">Clear All</figure>
                </section>

            </section>


            <!-- PERMISSIONS LIST -->
            <section class="permissions-list">

                <section v-if="!Object.keys(origins).length" class="no-permissions">
                    <section class="container">
                        <figure class="title">No Permissions</figure>
                        <figure class="description">
                            You haven't interacted with any Applications yet. Once you do you will
                            see your permissions here and be able to remove or modify them.
                        </figure>
                    </section>
                </section>

                <section class="permission" v-for="(permCount, origin) in origins">
                    <section class="info">
                        <figure class="name">{{origin}}</figure>
                        <figure class="description"><b>Link Permission</b>
                            <span v-if="permCount - 2 > 0"> and <b>{{permCount - 2}} Action Permission</b></span>
                            <span v-else>only</span>
                        </figure>
                    </section>

                    <section class="actions">
                        <figure class="action" v-tooltip="'Edit'">
                            <i class="fa fa-pencil"></i>
                        </figure>
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

    let saveTimeout = null;

    export default {
        data () {return {
            searchTerms:'',
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'identity',
                'permissions',
                'apps',
            ]),
            origins(){
                const origins = {};

//                this.apps.map(p => {
//                    if(!Object.keys(origins).includes(p.origin)) origins[p.origin] = 1;
//                    else origins[p.origin] += 1;
//                });

                this.permissions.map(p => {
                    if(!Object.keys(origins).includes(p.origin)) origins[p.origin] = 1;
                    else origins[p.origin] += 1;
                });

                return Object.keys(origins).reduce((acc, origin) => {
                    if(origin.toString().toLowerCase().indexOf(this.searchTerms.toLowerCase()) !== -1)
                        acc[origin] = origins[origin];

                    return acc;
                }, {});
            },
        },
        methods:{

            removePermissions(origin){
                PermissionService.removeAllPermissionsFor(origin);
            },
            removeAllPermissions(){
                PermissionService.removeAllPermissions();
            }
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
                border:1px solid #d9d9d9;
                width:40px;
                height:40px;
                line-height:38px;
                text-align:center;
                font-size: 18px;
                color:#959595;
                float:right;

                transition:all 0.2s ease;
                transition-property: background, border, color;

                &.red {
                    background:$red;
                    border:1px solid $red;
                    color:#fff;
                }

                &:hover {
                    background:$light-blue;
                    border:1px solid $light-blue;
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
            border-bottom:1px solid #e1e1e1;

            .input {
                float:left;
                width:calc(100% - 100px);

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
                float:left;
                width:100px;
                line-height:40px;
                text-align:right;

                .action {
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 500;
                    text-decoration: underline;
                }
            }

        }

        .permissions-list {
            flex:1;
            display:flex;
            flex-direction: column;
            padding:0 40px 50px 50px;
            overflow-y:auto;

            .no-permissions {
                flex:1;
                display:flex;
                text-align:center;
                justify-content:center;
                align-items: center;
                padding:50px;
                border-top:1px solid rgba(0,0,0,0.1);

                .container {
                    max-width:500px;
                    margin:0 auto;
                }

                .title {
                    font-size: 24px;
                    font-weight: 500;
                    margin-bottom:10px;
                }

                .description {
                    font-size: 16px;
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
                    width:calc(100% - 100px);
                    float:left;

                    .name {
                        font-weight: 600;
                        font-size: 18px;
                    }

                    .description {
                        margin-top:3px;
                        font-size: 13px;
                    }
                }

                .actions {
                    float:left;
                    width:100px;

                    .action {
                        margin-left:10px;
                        cursor: pointer;
                        border-radius: 2px;
                        border:1px solid #d9d9d9;
                        width:30px;
                        height:30px;
                        line-height:28px;
                        text-align:center;
                        font-size: 14px;
                        color:#959595;
                        float:right;

                        transition:all 0.2s ease;
                        transition-property: background, border, color;

                        &:hover {
                            background:$light-blue;
                            border:1px solid $light-blue;
                            color:#fff;
                        }

                        &.red {
                            &:hover {
                                background:$red;
                                border:1px solid $red;
                            }
                        }
                    }
                }
            }

        }

    }


</style>
