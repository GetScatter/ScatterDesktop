<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">

            </section>

            <section class="items-list scrollable">
                <section class="item" v-if="value.alwaysVisible || ridlEnabledIdentities.length" :class="{'active':selectedMenu === value.name}" v-for="(value, key) in repMenu" @click="selectedMenu = value.name">
                    <figure class="title">{{value.name}}</figure>
                    <figure class="description">{{value.description}}</figure>
                </section>
            </section>

        </section>

        <section class="panel display">
            <transition name="slide-right">
                <rep-repute v-if="ridlEnabledIdentities.length && selectedMenu === repMenu.REPUTE.name"></rep-repute>
                <rep-entity v-if="selectedMenu === repMenu.ENTITY_REPUTATION.name"></rep-entity>
                <rep-load-tokens v-if="selectedMenu === repMenu.LOAD_TOKENS.name"></rep-load-tokens>
            </transition>
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

    const REP_MENU = {
        ENTITY_REPUTATION:{
            name:'Entity Reputation',
            description:'View the reputation an Entity has right now.',
            alwaysVisible:true,
        },
        REPUTE:{
            name:'Repute Entity',
            description:'Repute entities and help define their Reputation.'
        },
        LOAD_TOKENS:{
            name:'Load Tokens',
            description:'Load some RIDL tokens into an Identity from a Blockchain Account.'
        },
        SUGGEST_TYPES:{
            name:'Suggest Types',
            description:'Suggest a new fragment type to be added to RIDL.'
        }
    };

    export default {
        name: 'Identities',
        data () {return {
            repMenu:REP_MENU,
            selectedMenu:REP_MENU.ENTITY_REPUTATION.name,
        }},
        computed: {
            ...mapState([
                'scatter',
                'searchTerms'
            ]),
            ...mapGetters([
                'permissions',
                'identities',
            ]),
            ridlEnabledIdentities(){
                return this.identities.filter(x => x.ridl > 0);
            }
        },
        mounted(){
            if(this.ridlEnabledIdentities.length) this.selectedMenu = REP_MENU.REPUTE.name;
        },
        methods: {

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
