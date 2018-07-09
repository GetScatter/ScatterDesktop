<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">
                <i class="fa fa-chevron-left" @click="$router.back()"></i>
            </section>

            <section class="items-list scrollable">
                <section class="item"
                         :class="{'active':onStep.ref === step.ref}"
                         v-for="step in steps" @click="scrollTo(step)">
                    <figure class="title">{{step.title}}</figure>
                    <figure class="description">{{step.description}}</figure>
                </section>
            </section>
        </section>


        <section class="panel display">
            <section class="head">

            </section>

            <section ref="scroller" class="selected-item scrollable" v-if="appLink">

                <section :ref="steps.NAME.ref">
                    <figure class="name">Name this Application Link</figure>
                    <section class="description">
                        Besides being just organizational, the name for this Application Link also shows up on Scatter Popups alongside a sub-origin ( such as a specific website ),
                        and allows you to further determine which application link a signature or identity request is coming from.
                    </section>

                    <cin placeholder="App Name" :text="appLink.name" v-on:changed="changed => bind(changed, 'appLink.name')"></cin>
                    <br><br>
                </section>

                <section :ref="steps.APP_KEY.ref" class="info-box">
                    <figure class="name">The App Link's Unique Key</figure>
                    <section class="description">
                        Application Keys are unique identifiers that open routes on Scatter's internal socket. <br><br>
                        For instance, Scatter uses the port <u>50005</u> for it's internal local connection
                        and if the app-key is <b>"abcd"</b> then that application link can only be reached at <u>http://localhost:50005/<b>abcd</b></u> from the local machine, and will only allow applications
                        through it which <b>you; the user,</b> have manually allowed access for.
                        <br><br>
                        You can click the <i class="fa fa-refresh"></i> button to get a new unique identifier.<br>
                        There is also a default Application Link with the identifier "scatter" which serves as a starting point and catch-all for Scatter.
                    </section>
                    <cin :placeholder="'Unique App Key'" dynamic-tooltip="Refresh App Key" dynamic-button="refresh" v-on:dynamic="appLink.nextId()" forced="true" disabled="true" :text="appLink.id"></cin>
                </section>

                <section :ref="steps.STRATEGY.ref" class="info-box">
                    <figure class="name">Setting the App Link's Startup Strategy</figure>
                    <section class="description">
                        There are two ways that an Application Link can start:
                        <ul>
                            <li>Starts <b>with</b> Scatter - This connection will open whenever Scatter is opened.</li>
                            <li>Starts <b>manually</b> only - This connection will only open when you manually tell it to.</li>
                        </ul>
                    </section>
                    <btn :red="appLink.enabledByDefault" :secondary="!appLink.enabledByDefault" v-on:clicked="appLink.enabledByDefault = !appLink.enabledByDefault"
                         :text="appLink.enabledByDefault ? 'Starts with Scatter' : 'Starts Manually Only'"></btn>
                    <br>
                    <br>

                    <section v-if="!appLink.enabledByDefault">
                        <br><br>

                        <section class="description">
                            If you have set the application link to only manually start, then you will be able to toggle it on and off as you please.<br><br>
                            <b class="red">Normally this will automatically open and close the socket, but for this tutorial this button is not functional because the Application Link isn't saved yet.</b>
                        </section>
                        <br>

                        <btn :red="listening" :secondary="!listening" :large="true"
                             v-on:clicked="listening = !listening" :text="listening ? 'Stop Listener' : 'Start Listener'"></btn>
                        <br>
                        <br>
                    </section>


                    <b>Status: {{listening || appLink.enabledByDefault ? 'Application Link Connected' : 'Application Link Disabled'}}</b>

                </section>

                <section :ref="steps.WHITELIST_BLACKLIST.ref" class="info-box">
                    <figure class="name">Moderating allowed and dis-allowed connections</figure>
                    <section class="description">
                        Each Application link has a whitelist and a hard-blacklist. By default everything is soft-blacklisted in the beginning; meaning that applications can only
                        <u>try to connect</u>, but they can't actually connect and start interacting with your Scatter.<br><br>
                        When an application tries to connect to your Scatter for the first time you will get a prompt which allows you to either:
                        <ul>
                            <li><b>Whitelist the application</b> - Allows the application to start interacting with Scatter.</li>
                            <li><b>Blacklist the application</b> - Rejects all further connection attemps from the application.</li>
                        </ul>
                        If you allow the application access, it will be able to send you identity and signature requests, if you blacklist it however, it will not be able to
                        re-prompt you for access until you remove the blacklist. This makes sure applications can't spam you with connection requests.
                        <br><br>
                        <b class="red">Go ahead and click the test button below to find out how to moderate whitelists and blacklists once they are added.</b>
                    </section>
                    <br>
                    <btn :secondary="true" v-on:clicked="testPrompt" text="Get Test Prompt"></btn>

                    <section v-if="whitelist.length || blacklist.length">
                        <br>
                        <br>
                        <section v-if="whitelist.length">
                            <figure class="header">Whitelisted Applications</figure>
                            <tags :items="whitelist"
                                  v-on:clicked="removeWhitelistOrBlacklist"></tags>
                        </section>
                        <br>

                        <section v-if="blacklist.length">
                            <figure class="header">Blacklisted Applications</figure>
                            <tags :items="blacklist"
                                  v-on:clicked="removeWhitelistOrBlacklist"></tags>
                        </section>
                    </section>
                </section>

                <section :ref="steps.SAVE.ref" class="info-box">
                    <figure class="name">Saving your Application Link</figure>
                    <section class="description">
                        Application links don't automatically save, you must manually save them, though normally the only things that are updated are the Name and the Unique Identifier,
                        in the case of this tutorial it will be doing some extra stuff like checking the Startup Strategy and actually opening the socket depending on your configurations.
                    </section>
                    <br>
                    <btn v-on:clicked="saveAppLink" text="Save Application Link"></btn>
                </section>

            </section>


        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import {RouteNames} from '../../vue/Routing';
    import * as Actions from '../../store/constants';

    import AppLink from '../../models/AppLink';
    import SocketService from '../../services/SocketService';
    import PopupService from '../../services/PopupService';
    import {Popup} from '../../models/popups/Popup'



    const WizardSteps = {
        NAME:{ref:'name', title:'Name this App Link', description:'Names help you identify which apps are connecting through which links.'},
        APP_KEY:{ref:'appkey', title:'Generate the App Key', description:'App keys are unique identifiers that applications can use to connect with Scatter.'},
        STRATEGY:{ref:'strategy', title:'Link Opening Strategy', description:'Select whether you want the link to open with Scatter, or only when you say so.'},
        WHITELIST_BLACKLIST:{ref:'whiteblack', title:'Whitelist / Blacklist', description:'Moderating the applications that are connecting to this App Link.'},
        SAVE:{ref:'save', title:'Saving your Application Link', description:'Remember, we talked about saving.'},
    };

    export default {
        data () {return {
            steps:WizardSteps,
            onStep:WizardSteps.NAME,
            appLink:AppLink.placeholder(),
            listening:false,
            acceptedTestPrompt:null,
            whitelist:[],
            blacklist:[],
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'linkedApps',
            ]),
        },
        mounted(){

        },
        methods: {
            scrollTo(step){
                this.$refs.scroller.scrollTop = this.$refs[step.ref].offsetTop-120;
                this.onStep = step;
            },
            testPrompt(){
                const app = `FakeApp-${Math.round(Math.random()*10000)}`;
                PopupService.push(Popup.prompt("App Requesting Access", `${app} is requesting access to use Scatter`, "eye", "Allow", async accepted => {
                    this[accepted ? 'whitelist' : 'blacklist'].push(app);
                }, "Blacklist"))
            },
            removeWhitelistOrBlacklist(item){
                this.whitelist = this.whitelist.filter(x => x !== item);
                this.blacklist = this.blacklist.filter(x => x !== item);
            },
            saveAppLink(){
                const scatter = this.scatter.clone();

                if(!this.appLink.name.length){
                    PopupService.push(Popup.snackbar("Application Link needs a Name", "ban"));
                }

                if(this.linkedApps.find(x => x.name.toLowerCase() === this.appLink.name.toLowerCase())){
                    PopupService.push(Popup.snackbar("An Application Link with this name already exists", "ban"));
                }

                this.appLink.isListening = this.appLink.enabledByDefault || this.listening;

                scatter.keychain.updateOrPushAppLink(this.appLink);
                this[Actions.SET_SCATTER](scatter);
                PopupService.push(Popup.snackbar("App Link Saved!", "check"));
                if(this.appLink.isListening) SocketService.open(this.appLink);
                this.$router.push({name:RouteNames.LINKED_APPS});
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";
</style>