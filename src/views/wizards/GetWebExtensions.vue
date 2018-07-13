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

            <section ref="scroller" class="selected-item scrollable">

                <section :ref="steps.WEB_EXTENSIONS.ref">
                    <figure class="name">Getting the Web Browser Extensions</figure>
                    <section class="description">
                        Besides being just organizational, the name for this Application Link also shows up on Scatter Popups alongside a sub-origin ( such as a specific website ),
                        and allows you to further determine which application link a signature or identity request is coming from.
                    </section>

                    <section class="extensions">

                        <section class="extension" @click="openInBrowser('https://chrome.google.com/webstore/detail/scatter-web-connector/kgikkekbjibkhhmjchblangiiphleodk?hl=en')">
                            <figure class="icon"><i class="fa fa-chrome"></i></figure>
                            <figure class="text">Chrome</figure>
                        </section>

                        <section class="extension disabled">
                            <figure class="icon"><i class="fa fa-firefox"></i></figure>
                            <figure class="text">Firefox</figure>
                        </section>

                        <section class="extension disabled">
                            <figure class="icon"><i class="fa fa-safari"></i></figure>
                            <figure class="text">Safari</figure>
                        </section>

                    </section>

                    <section class="info-box">
                        <figure class="header">Extension IDs</figure>
                        <section class="description">
                            Extension IDs are used to validate extensions. They are unique for each extension and are not changed when the extension is update so you can be
                            sure that the extension is always the Official Scatter Extension.
                        </section>
                        <br>
                        <section class="description">
                            <ul>
                                <li>Chrome: <b>kgikkekbjibkhhmjchblangiiphleodk</b></li>
                                <li>Firefox: <b>NOT AVAILABLE</b></li>
                                <li>Safari: <b>NOT AVAILABLE</b></li>
                            </ul>
                        </section>
                    </section>
                </section>

                <section :ref="steps.SETUP.ref" class="info-box">
                    <figure class="name">Setting up a Web Extension</figure>
                    <section class="description">
                        Scatter web extensions are <b>very</b> simple to set up once you have them installed. <br>
                        All you need to do is:

                        <ul>
                            <li>Click the Scatter icon on the top right of your browser window</li>
                            <li>Enter the Application Link's app-key you wish to connect to ( "scatter" for the default one )</li>
                            <li>Click <b>Link With Scatter</b></li>
                            <li>A prompt will show up on your Scatter Desktop app which allows you to approve the connection.</li>
                        </ul>

                        That's it!
                    </section>
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
        WEB_EXTENSIONS:{ref:'webext', title:'Getting the Extensions', description:'Install the web extension for your desired browser.'},
        SETUP:{ref:'setup', title:'Setup Web Extensions', description:'Learn how to set up the web extension to interact with Scatter Desktop.'},
    };

    export default {
        data () {return {
            steps:WizardSteps,
            onStep:WizardSteps.WEB_EXTENSIONS
        }},
        computed: {
            ...mapState([
            ]),
            ...mapGetters([
            ]),
        },
        mounted(){

        },
        methods: {
            ...mapActions([
                Actions.SET_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables.scss";


</style>