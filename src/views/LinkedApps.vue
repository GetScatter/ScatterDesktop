<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">

            </section>

            <section class="items-list scrollable">
                <!--<section class="item" :class="{'active':selectedPage === pageTypes.CONFIGURE}" @click="selectedPage = pageTypes.CONFIGURE">-->
                    <!--<figure class="title">Configure App Link</figure>-->
                    <!--<figure class="description">Configure the way Scatter Desktop interacts with web and desktop applications.</figure>-->
                <!--</section>-->

                <section class="item" :class="{'active':selectedPage === pageTypes.WHITELIST}" @click="selectedPage = pageTypes.WHITELIST">
                    <figure class="title">Whitelisted Applications</figure>
                    <figure class="description">View and moderate applications that are allowed to interact with your Scatter.</figure>
                </section>

                <section class="item" :class="{'active':selectedPage === pageTypes.BLACKLIST}" @click="selectedPage = pageTypes.BLACKLIST">
                    <figure class="title">Blacklisted Applications</figure>
                    <figure class="description">View and moderate applications that are NOT allowed to interact with your Scatter.</figure>
                </section>

                <!--<section class="item"-->
                         <!--:class="{'active':appLink && appLink.id === appLink.id}"-->
                         <!--v-for="appLink in linkedApps" @click="selectedApp = appLink">-->
                    <!--<figure class="title">{{appLink.name}}</figure>-->
                    <!--<figure class="description red" v-if="appLink.isListening"><u><b>Enabled</b></u></figure>-->
                    <!--<figure class="description" v-else>Disabled</figure>-->
                <!--</section>-->
            </section>
        </section>


        <section class="panel display">
            <transition name="slide-right">
                <app-link-apps :key="selectedPage" :app="appLink" :type="selectedPage"></app-link-apps>
            </transition>
        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import AppLink from '../models/AppLink';

    const PAGE_TYPES = {
        CONFIGURE:'configure',
        WHITELIST:'whitelist',
        BLACKLIST:'blacklist'
    }

    export default {
        name: 'Blockchains',
        data () {return {
            pageTypes:PAGE_TYPES,
            selectedPage:PAGE_TYPES.WHITELIST,
            selectedApp:null
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'linkedApps'
            ]),
            appLink(){
                return this.linkedApps[0];
            }
        },
        mounted(){

        },
        methods: {

        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";
</style>