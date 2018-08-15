<template>
    <section>

        <section class="popup">

            <section class="top-section">
                <!-- HEADER -->
                <section class="head">
                    <figure class="logo">S</figure>
                    <figure class="info">
                        <figure>Link New App</figure>
                    </figure>
                    <section class="buttons">
                        <btn text="Link" v-on:clicked="returnResult(true)"></btn>
                        <btn red="true" text="Deny" v-on:clicked="returnResult(false)"></btn>
                    </section>
                </section>

            </section>

            <section class="lists">

                <section class="list">
                    <section class="breadcrumbs">
                        <figure class="breadcrumb">Application Details</figure>
                    </section>

                    <section class="item">
                        <!--{{payload}}-->
                        <figure class="title">{{app.origin}}</figure>
                        <figure class="sub-title">{{app.appkey}}</figure>
                    </section>
                </section>

            </section>
        </section>



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import AuthorizedApp from '../../models/AuthorizedApp'

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'state'
            ]),
            ...mapGetters([
                'identities',
                'accounts',
            ]),
            app(){
                return AuthorizedApp.fromJson(this.payload);
            }
        },
        mounted(){

        },
        methods: {
            returnResult(result){
                this.$emit('returned', result);
            },
        },
        props:['payload', 'pluginOrigin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";

    .popup {
        background:$very-light-blue;
        width:440px;
        height:360px;
        display: flex;
        flex-flow: column;

        .top-section {
            flex: 0 1 auto;
        }

        .head, .requirements, .search-bar {
            background:#fff;
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
                width:200px;
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
                width:calc(100% - 236px);

                button {
                    float:right;
                    margin-top:0;
                    -webkit-app-region: no-drag;
                    margin-left:10px;
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

            .list {
                padding-bottom:30px;
                overflow-y:auto;
                position: relative;
                height:100%;

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
                    }
                }


                .item {
                    cursor: pointer;
                    margin:0 20px;
                    padding:30px;
                    background:transparent;
                    color:$dark-grey;
                    border-radius:4px;
                    border:1px solid $medium-grey;
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
                }
            }

        }

    }
</style>