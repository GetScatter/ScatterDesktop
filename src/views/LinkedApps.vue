<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">
                <i class="fa fa-plus-square-o" @click="newAppLink"></i>
            </section>

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


        <app-link v-if="selectedApp" :key="selectedApp.id" :app="selectedApp"></app-link>

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
            if(this.linkedApps.length) this.selectedApp = this.linkedApps[0].clone();
            else this.selectedApp = AppLink.placeholder();
        },
        methods: {
            newAppLink(){
                this.selectedApp = AppLink.placeholder();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";
</style>