<template>
    <section>

        <section class="panel sub-menu">

            <sub-menu-head v-on:new="newIdentity" tooltip="New Identity"></sub-menu-head>

            <section class="items-list scrollable">
                <section class="item" v-if="selectedIdentity" :class="{'active':selectedIdentity.publicKey === identity.publicKey}" v-for="identity in identities" @click="selectedIdentity = identity">
                    <figure class="title">{{identity.name}}</figure>
                    <figure class="description">{{connectedApps(identity)}} connected apps</figure>
                </section>
            </section>

        </section>

        <identity v-on:deleted="nextIdentity" :key="selectedIdentity.publicKey" :id="selectedIdentity" v-if="selectedIdentity"></identity>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {Countries} from '../data/Countries'

    import Identity from '../models/Identity'

    export default {
        name: 'Identities',
        data () {return {
            selectedIdentity:null,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'identities',
                'permissions',
            ])
        },
        mounted(){
            this.nextIdentity();
        },
        methods: {
            async newIdentity(){
                const id = Identity.placeholder();
                await id.initialize(this.scatter.hash);
                this.selectedIdentity = id;
            },
            async nextIdentity(){
                if(this.identities.length) this.selectedIdentity = this.identities[0].clone();
                else this.newIdentity();
            },
            connectedApps(identity){
                return this.permissions.filter(x => x.isIdentity && x.identity === identity.publicKey).length
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";


</style>