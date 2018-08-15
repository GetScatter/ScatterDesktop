<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">
                <i v-tooltip="'Delete All Permissions'" class="fa fa-trash-o" @click="clearAllPermissions"></i>
            </section>

            <section class="items-list scrollable">
                <menu-search></menu-search>
                <section class="item" :class="{'active':selectedOrigin === origin}" v-for="(count, origin) in origins" @click="selectedOrigin = origin">
                    <figure class="title">{{origin}}</figure>
                    <figure class="description">{{count}} permission{{count !== 1 ? 's':''}}</figure>
                </section>
            </section>

        </section>

        <section class="panel display">
            <transition name="slide-right">
                <origin-perms v-on:emptied="selectNextOrigin" :key="selectedOrigin" :origin="selectedOrigin" v-if="selectedOrigin"></origin-perms>
            </transition>
            <nothing-here v-if="!selectedOrigin && !origins.length" :description="`
                As you start using Scatter to interact with applications and websites this will fill up and you will be able to manage your permissions for Identities and Contracts.
            `"></nothing-here>
        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Countries} from '../data/Countries'

    import Identity from '../models/Identity'
    import {Popup} from '../models/popups/Popup'
    import PopupService from '../services/PopupService';

    export default {
        name: 'Identities',
        data () {return {
            selectedOrigin:null,
        }},
        computed: {
            ...mapState([
                'scatter',
                'searchTerms'
            ]),
            ...mapGetters([
                'permissions',
                'apps'
            ]),
            origins(){
                const origins = {};

                this.apps.map(p => {
                    if(!Object.keys(origins).includes(p.origin)) origins[p.origin] = 1;
                    else origins[p.origin] += 1;
                });

                this.permissions.map(p => {
                    if(!Object.keys(origins).includes(p.origin)) origins[p.origin] = 1;
                    else origins[p.origin] += 1;
                });

                return Object.keys(origins).reduce((acc, origin) => {
                    if(origin.toString().toLowerCase().indexOf(this.searchTerms.toLowerCase()) !== -1)
                        acc[origin] = origins[origin];

                    return acc;
                }, {});
            },
        },
        mounted(){
            this.selectNextOrigin();
        },
        methods: {
            selectNextOrigin(){
                if(Object.keys(this.origins).length) this.selectedOrigin = Object.keys(this.origins)[0];
                else this.selectedOrigin = null;
            },
            clearAllPermissions(){
                PopupService.push(Popup.prompt("Removing All Permissions", "Are you sure?", "trash-o", "Yes", async accepted => {
                    if(!accepted) return;
                    const scatter = this.scatter.clone();
                    scatter.keychain.permissions = [];
                    await this[Actions.SET_SCATTER](scatter);
                    PopupService.push(Popup.snackbar("All Permissions Removed!", "check"));
                    this.selectedOrigin = null;
                }, "Cancel"))
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        watch:{
            origins(){
                if(!this.selectedOrigin || !this.selectedOrigin.length)
                    this.selectNextOrigin();
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";


</style>
