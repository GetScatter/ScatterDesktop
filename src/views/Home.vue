<template>
    <section>

        <!-- IDENTITY -->
        <section class="identity">

            <!-- INFO -->
            <section class="info">

                <figure class="name">{{identity.name}}</figure>
                <figure class="description">Your Identity is <b>{{identity.ridl >0 ? '' : 'not'}}</b> RIDL Enabled</figure>

            </section>

            <!-- ACTIONS -->
            <section class="actions">

                <!-- EDIT -->
                <figure class="action" v-tooltip="'Edit'">
                    <i class="fa fa-pencil"></i>
                </figure>

            </section>

        </section>

        <!-- PERMISSIONS -->
        <section class="permissions">

            <!-- SEARCH -->
            <section class="search">

                <!-- INPUT -->
                <section class="input">
                    <figure class="icon"><i class="fa fa-search"></i></figure>
                    <input placeholder="Search Permissions..." />
                </section>

                <!-- ACTIONS -->
                <section class="actions">
                    <figure class="action">Clear All</figure>
                </section>

            </section>


            <!-- PERMISSIONS LIST -->
            <section class="permissions-list">

                <section class="permission" v-for="i in [1,1,1,1,1,1,1,1]">
                    <section class="info">
                        <figure class="name">Bloks.io</figure>
                        <figure class="description"><b>Link Permission</b> and <b>1 Action Permission</b></figure>
                    </section>

                    <section class="actions">
                        <figure class="action" v-tooltip="'Edit'">
                            <i class="fa fa-pencil"></i>
                        </figure>
                        <figure class="action red" v-tooltip="'Remove'">
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

    let saveTimeout = null;

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'identity',
            ]),
        },
        methods:{

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
            width:calc(100% - 110px);
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
            width:110px;
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

                &:hover {
                    background:$light-blue;
                    border:1px solid $light-blue;
                    color:#fff;
                }
            }
        }
    }

    .permissions {

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
                    font-size: 13px;
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
            padding:0 40px 50px 50px;
            overflow-y:scroll;
            max-height:calc(100vh - 380px);




            .permission {
                padding:30px 0;
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
