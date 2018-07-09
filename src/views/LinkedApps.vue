<template>
    <section>

        <section class="panel sub-menu">

            <sub-menu-head v-on:new="newAppLink" tooltip="New Application Link"></sub-menu-head>

            <section class="items-list scrollable">
                <section class="item"
                         :class="{'active':selectedApp && selectedApp.id === appLink.id}"
                         v-for="appLink in linkedApps" @click="selectedApp = appLink">
                    <figure class="title">{{appLink.name}}</figure>
                    <figure class="description red" v-if="appLink.isListening"><u><b>Enabled</b></u></figure>
                    <figure class="description" v-else>Disabled</figure>
                </section>
            </section>
        </section>


        <app-link v-if="selectedApp" :key="selectedApp.id" v-on:deleted="nextAppLink" :app="selectedApp"></app-link>
        <nothing-here v-if="!linkedApps.length" :description="`
            You have no Application Links, and without them no applications can use your Scatter.
        `" button-text="Create Application Link" button-fn="newAppLink"></nothing-here>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import AppLink from '../models/AppLink';

    export default {
        name: 'Blockchains',
        data () {return {
            selectedApp:null
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
            this.nextAppLink();
        },
        methods: {
            nextAppLink(){
                if(this.linkedApps.length) this.selectedApp =  this.linkedApps[0].clone();
                else this.newAppLink();
            },
            newAppLink(){
                this.selectedApp = this.linkedApps.find(x => x.isDefault())
                    ? AppLink.placeholder()
                    : AppLink.defaultAppLink();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";
</style>