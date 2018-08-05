<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">

            </section>

            <section class="items-list scrollable">
                <section class="item-type-switcher">
                    <figure class="item-type" @click="subMenuType = menuType" v-for="(menuType, key) in subMenuTypes"
                            :class="{'active':subMenuType === menuType}">{{menuType}}</figure>
                </section>
                <section class="item" v-if="option.type === subMenuType"
                         :class="{'active':selectedOption && selectedOption === option.title}"
                         v-for="option in helpOptions" @click="selectOption(option)">
                    <figure class="title">{{option.title}}</figure>
                    <figure class="description">{{option.description}}</figure>
                </section>
            </section>
        </section>

        <section ref="scroller" class="panel display scrollable">
            <section class="head">

            </section>

            <section class="selected-item">
                <figure class="name">Need some help?</figure>
                <section class="description">
                    <u>Click an item from the sidebar to get a short wizard that will help you set up Scatter.</u>

                    <br><br>
                    <h2>Wizards</h2>
                    The wizards are learning experiences you can take that will fully explain various things about Scatter such as setting up and using Identities,
                    or importing and linking blockchain accounts.

                    <br><br>

                    <h2>Learn</h2>
                    This section doesn't only include wizards to set up Scatter but also
                    has some basic information about blockchains in general. It's aim is to help inform and educate users on how to make sure they
                    are as safe as possible. Knowledge of the blockchain means the ability to protect yourself. Consider your research a form of self-defense.
                </section>
            </section>


        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import AppLink from '../models/AppLink';
    import {RouteNames} from '../vue/Routing';

    const SubMenuTypes = {
        WIZARDS:'Wizards',
        LEARN:'Learn',
    };

    const HelpOptions = {

        // WIZARDS
        IDENTITY:{title:'Setup an Identity', description:'Configure and learn about Identities.', type:SubMenuTypes.WIZARDS},
        KEYPAIR:{title:'Import Keypair', description:'Learn how to import a keypair.', type:SubMenuTypes.WIZARDS},
        LINK_ACCOUNT:{title:'Link Blockchain Account', description:'Link a blockchain account to a specific network.', type:SubMenuTypes.WIZARDS},
        NETWORK:{title:'Add Blockchain Network', description:'Networks allow you to connect to various blockchains.', type:SubMenuTypes.WIZARDS},
//        WEB_EXTENSION:{title:'Web Extension', description:'Get the web extension for various browsers.', type:SubMenuTypes.WIZARDS},
//        APPLICATIONS:{title:'Add Application Link', description:'Application links allow other apps to talk to Scatter.', type:SubMenuTypes.WIZARDS},

        // LEARN
        KEYPAIRS:{title:'What are Keypairs?', description:'Let\'s learn a little about asymmetric encryption!', type:SubMenuTypes.LEARN},
        PERMISSIONS:{title:'What are Permissions?', description:'Permissions help you use the blockchain without realizing you\'re on the blockchain.', type:SubMenuTypes.LEARN},
        SAFE:{title:'Am I Safe?', description:'Let\'s talk about how you can keep your computer safe.', type:SubMenuTypes.LEARN},
    };

    export default {
        data () {return {
            subMenuTypes:SubMenuTypes,
            subMenuType:SubMenuTypes.WIZARDS,
            helpOptions:HelpOptions,
            selectedOption:null,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'linkedApps'
            ])
        },
        mounted(){

        },
        methods: {
            selectOption(option){
                if(option.title === HelpOptions.IDENTITY.title) return this.$router.push({name:RouteNames.WIZ_SETUP_ID});
                if(option.title === HelpOptions.KEYPAIR.title) return this.$router.push({name:RouteNames.WIZ_SETUP_KEYPAIR});
                if(option.title === HelpOptions.LINK_ACCOUNT.title) return this.$router.push({name:RouteNames.WIZ_LINK_BLOCKCHAIN_ACCOUNT});
                if(option.title === HelpOptions.NETWORK.title) return this.$router.push({name:RouteNames.WIZ_ADD_BLOCKCHAIN_NETWORK});
                if(option.title === HelpOptions.WEB_EXTENSION.title) return this.$router.push({name:RouteNames.WIZ_WEB_EXTENSION});
                if(option.title === HelpOptions.APPLICATIONS.title) return this.$router.push({name:RouteNames.WIZ_ADD_APPLICATION_LINK});
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";
</style>