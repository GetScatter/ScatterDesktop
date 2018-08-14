<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">

            </section>

            <section class="items-list scrollable">
                <section class="item" :key="key"
                         :class="{'active':selectedMenu === item.name, 'disabled':item.disabled}"
                         v-for="(item, key) in repMenu"
                         @click="item.disabled ? null : selectedMenu = item.name">
                    <figure class="title">{{item.name}}</figure>
                    <figure class="description">{{item.description}}</figure>
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
        },
        REPUTE:{
            name:'Repute Entity',
            description:'Repute entities and help define their Reputation.',
            disabled:true,
        },
        LOAD_TOKENS:{
            name:'Load Tokens',
            description:'Load some RIDL tokens into an Identity from a Blockchain Account.',
            disabled:true,
        },
        SUGGEST_TYPES:{
            name:'Suggest Types',
            description:'Suggest a new fragment type to be added to RIDL.',
            disabled:true,
        },
        IDENTITY_AUCTION:{
            name:'Identity Auction',
            description:'View the bids on your Identities and bid on other Identities.',
            disabled:true,
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
                return this.identities.filter(x => parseInt(x.ridl) > 0);
            }
        },
        mounted(){
            this.repMenu.LOAD_TOKENS.disabled = !this.ridlEnabledIdentities.length;
            this.repMenu.REPUTE.disabled = !this.ridlEnabledIdentities.length;

            this.selectedMenu = this.ridlEnabledIdentities.length
                ? REP_MENU.REPUTE.name
                : REP_MENU.ENTITY_REPUTATION.name;

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
