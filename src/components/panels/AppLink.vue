<template>
    <section>

        <section class="panel display">
            <section class="head">
                <i class="fa fa-trash-o" @click="deleteAppLink"></i>
            </section>

            <section class="selected-item scrollable" v-if="appLink">

                <figure class="name" :class="{'bad-name':badAppLinkName()}">{{appLink.name.length ? appLink.name : 'Application Name Required'}} ( {{appLinkConnections}} )</figure>
                <figure class="description">
                    Linked apps have the ability to interact with your Scatter.
                    Any app that isn't manually linked to your Scatter can not reach it.<br><br>
                    Even if an app is linked to your Scatter that does not mean it can fetch information from it without requesting it from you,
                    and it will <b>never</b> be able to fetch sensitive information such as private keys.
                    <br><br>
                </figure>

                <section class="split-panels left">
                    <section class="info-box">
                        <figure class="header">Application Link Information</figure>
                        <cin placeholder="App Name" :text="appLink.name" v-on:changed="changed => bind(changed, 'appLink.name')"></cin>
                        <cin :placeholder="'Unique App Key'" :dynamic-button="canChangeId ? 'refresh' : null" v-on:dynamic="appLink.nextId()" forced="true" disabled="true" :text="appLink.id"></cin>

                        <br>
                        <btn :red="appLink.enabledByDefault" :secondary="!appLink.enabledByDefault" v-on:clicked="toggleEnableByDefault"
                             :text="appLink.enabledByDefault ? 'Starts with Scatter' : 'Starts Manually Only'"></btn>
                        <btn v-on:clicked="saveAppLink" :text="isNew() ? 'Save Application Link' : 'Update Application Link'" style="float:right;"></btn>
                    </section>


                </section>

                <section class="split-panels">

                    <section class="info-box" v-if="!appLink.enabledByDefault">
                        <figure class="header">Application Link Status</figure>
                        <btn :red="appLink.isListening" :secondary="!appLink.isListening" :large="true"
                             v-on:clicked="toggleSocketListener" :text="appLink.isListening ? 'Stop Listener' : 'Start Listener'"></btn>
                    </section>
                </section>



                <!-- BLACKLIST / WHITELIST -->

                <section class="info-box" v-if="appLink.whitelist.length">
                    <figure class="header">Whitelisted Applications</figure>
                    <tags :items="appLink.whitelist"
                          :parser="item => item.plugin"
                          v-on:clicked="item => removeWhitelistOrBlacklist(item.plugin)"></tags>
                </section>

                <section class="info-box" v-if="appLink.blacklist.length">
                    <figure class="header">Blacklisted Applications</figure>
                    <tags :items="appLink.blacklist"
                          v-on:clicked="removeWhitelistOrBlacklist"></tags>
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
            canChangeId(){
                return !this.appLink.isDefault() || !this.linkedApps.find(x => x.id === this.appLink.id);
            }
        },
        mounted(){
            this.appLink = this.app.clone();
        },
        methods: {
            removeWhitelistOrBlacklist(plugin){
                PopupService.push(Popup.prompt("Removing App Permission", "You are about to remove either a blacklisted or a whitelisted application permission", "ban", "Accept", accepted => {
                    if(!accepted) return;

//                    const removingFromWhitelist = this.appLink.whitelist.find(x => x.plugin === plugin);
//                    if(removingFromWhitelist) SocketService.close(this.appLink);


                    this.appLink.whitelist = this.appLink.whitelist.filter(x => x.plugin !== plugin);
                    this.appLink.blacklist = this.appLink.blacklist.filter(x => x !== plugin);
                    const scatter = this.scatter.clone();
                    scatter.keychain.updateOrPushAppLink(this.appLink);
                    this[Actions.SET_SCATTER](scatter);
                }));
            },
            badAppLinkName(){
                return !this.appLink.name.length
            },
            isNew(){
                return !this.linkedApps.find(x => x.id === this.appLink.id);
            },
            saveAppLink(snackbar = true){
                const appLinkClone = this.appLink.clone();
                const scatter = this.scatter.clone();

                // Setting the old name on to prevent errors
                // with changing socket listeners.
                if(!appLinkClone.name.length) {
                    if(!this.app.name.length) return false;
                    appLinkClone.name = this.app.name;
                }

                scatter.keychain.updateOrPushAppLink(appLinkClone);
                this[Actions.SET_SCATTER](scatter);
                if(snackbar) PopupService.push(Popup.snackbar("App Link Saved!", "check"));
            },
            toggleEnableByDefault(){
                this.appLink.enabledByDefault = !this.appLink.enabledByDefault;
                this.appLink.isListening = this.appLink.enabledByDefault;

                if(this.appLink.enabledByDefault) SocketService.open(this.appLink);
                else SocketService.close(this.appLink);

                this.saveAppLink(false);
            },
            toggleSocketListener(){
                if(this.appLink.isListening) SocketService.close(this.appLink);
                else SocketService.open(this.appLink);

                this.appLink.isListening = !this.appLink.isListening;
                this.saveAppLink(false);
            },
            deleteAppLink(){

                PopupService.promptGuard(Popup.prompt(
                    "Deleting Application Link", "This will delete this Application Link. It will also disconnect all linked applications.",
                    "unlink", "Delete Link"
                ), async accepted => {
                    if(accepted) {
                        SocketService.close(this.appLink);
                        const scatter = this.scatter.clone();
                        scatter.keychain.removeAppLink(this.appLink);
                        await this[Actions.SET_SCATTER](scatter);
                        this.$emit('deleted');
                        PopupService.push(Popup.snackbar("App Link Deleted!", "check"));
                    }
                });

            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['app'],
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";


</style>