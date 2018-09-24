<template>
    <section>

        <section class="selector" :class="{'warning':!ridlAccounts.length}" @click="!ridlAccounts.length ? returnResult(null) : null">
            <section class="pop-in-head">
                <section>
                    <figure class="bubble-icon red">
                        <i class="icon icon-ridl" style="font-size: 20px;"></i>
                    </figure>
                </section>
                <section class="no-third">
                    <figure class="title">Register Identity with RIDL</figure>
                    <figure class="description">
                        RIDL is Scatter's Reputation and Identity Layer. It is a <b>premium</b> paid add-on which allows your Identities to become unique across all applications and get reputation.
                        <br><br>
                        For more information about RIDL check out <u @click="openLinkToRIDL">https://ridl.get-scatter.com</u>.
                    </figure>
                </section>
            </section>

            <section class="list" v-if="ridlAccounts.length">
                <section class="item" v-for="item in ridlAccounts" @click="returnResult(item)">
                    <!--<figure class="fa" :class="`fa-${nextPopIn.data.props.icon}`"></figure>-->
                    <figure>{{parse(item)}}</figure>
                </section>
            </section>

            <section class="list" v-else>
                <section class="item" style="text-align:center;">
                    <figure>You don't have any Blockchain Accounts on the RIDL network.</figure>
                </section>
            </section>

        </section>

    </section>
</template>

<script>
    import {RouteNames} from '../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {PopupDisplayTypes} from '../../models/popups/Popup'
    import ElectronHelpers from '../../util/ElectronHelpers'
    import RIDLService from '../../services/RIDLService'

    export default {
        data(){ return {

        }},
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([
                'nextPopIn',
                'accounts',
                'networks',
            ]),
            ridlNetwork(){
                return RIDLService.getNetwork();
            },
            ridlAccounts(){
                return this.accounts.filter(x => x.networkUnique === this.ridlNetwork.unique())
            }
        },
        mounted(){

        },
        methods:{
            returnResult(truthy){
                this.nextPopIn.data.callback(truthy);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            parse(account){
                return account.formatted();
            },
            openLinkToRIDL(){
                ElectronHelpers.openLinkInBrowser('https://ridl.get-scatter.com')
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .selector {

        .list {
            border-top:1px solid $light-grey;
            max-height:280px;
            overflow-y:auto;

            .item {
                cursor: pointer;
                background:#fff;
                transition: all 0.3s ease;
                transition-property: background;

                figure {
                    display:inline-block;
                    padding:20px;
                    font-size:16px !important;
                    font-family: 'Roboto', sans-serif;
                }

                &:not(:first-child){
                    border-top:1px solid $light-grey;
                }

                &:hover {
                    background:$light-grey;
                }

                &:active {
                    background:#fff;
                }
            }
        }

        &.warning {
            cursor: pointer;

            .item {
                background: $red;
                color:#fff;

                &:not(:first-child){
                    border-top:1px solid rgba(0,0,0,0.1);
                }

                &:hover, &:active {
                    background: $red;
                    color:#fff;
                }
            }
        }

    }


</style>