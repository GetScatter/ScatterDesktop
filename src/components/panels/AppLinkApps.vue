<template>
    <section>

        <section>
            <section class="head">

            </section>

            <section class="selected-item scrollable" v-if="appLink">

                <section v-if="type === 'whitelist'">
                    <figure class="name">Whitelisted Applications</figure>
                    <figure class="description">
                        Whitelisted Applications are applications that are allowed to interact with your Scatter.
                        <br><br>
                        You have full control over the applications that can contact your Scatter and can revoke their access at any point in time.
                        Any app that isn't manually linked to your Scatter can not reach it.
                        <br><br>

                        Even if an app is linked to your Scatter that does not mean it can fetch information from it without requesting it from you,
                        and it will <b>never</b> be able to fetch sensitive information such as private keys.
                        <br><br>
                    </figure>
                </section>

                <section v-if="type === 'blacklist'">
                    <figure class="name">Blacklisted Applications</figure>
                    <figure class="description">
                        Blacklisted Applications are applications that have tried to access your Scatter and you have rejected them. They can not re-prompt for access until you un-blacklist them.
                        <br><br>
                    </figure>
                </section>


                <section class="info-box" v-if="permsList.length">

                    <cin placeholder="Search..." :text="searchText" v-on:changed="changed => bind(changed, 'searchText')"></cin>
                    <br><br>

                    <section class="list-item" v-for="item in filteredPermsList">
                        <figure class="name">{{item.plugin}}</figure>
                        <figure class="date">Created At: <b>{{(new Date(item.createdAt)).toLocaleString()}}</b></figure>
                        <figure class="button" v-tooltip="'Remove'" @click="removeWhitelistOrBlacklist(item.plugin)">
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
    import * as Actions from '../../store/constants';
    import IdGenerator from '../../util/IdGenerator'

    import AppLink from '../../models/AppLink'

    import {Popup} from '../../models/popups/Popup'
    import PopupService from '../../services/PopupService';

    import SocketService from '../../services/SocketService';

    export default {
        data () {return {
            appLink:null,
            searchText:'',
        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
                'accounts',
                'linkedApps',
            ]),
            appLinkConnections(){
                return this.appLink !== null ? SocketService.getConnectionCount(this.appLink) : 0;
            },
            permsList(){
                return this.type === 'whitelist' ? this.appLink.whitelist : this.appLink.blacklist;
            },
            filteredPermsList(){
                return this.permsList.filter(x => x.plugin.toLowerCase().indexOf(this.searchText.toLowerCase()) > -1)
            }
        },
        mounted(){
            this.appLink = this.app.clone();
        },
        methods: {
            removeWhitelistOrBlacklist(plugin){
                PopupService.push(Popup.prompt("Removing App Permission", "You are about to remove either a blacklisted or a whitelisted application permission", "ban", "Accept", accepted => {
                    if(!accepted) return;

                    this.appLink.whitelist = this.appLink.whitelist.filter(x => x.plugin !== plugin);
                    this.appLink.blacklist = this.appLink.blacklist.filter(x => x !== plugin);
                    const scatter = this.scatter.clone();
                    scatter.keychain.updateOrPushAppLink(this.appLink);
                    this[Actions.SET_SCATTER](scatter);
                }, "Cancel"));
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['app', 'type'],
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";


</style>