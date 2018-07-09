<template>
    <section>

        <section class="panel sub-menu">

            <section class="head">

            </section>

            <section class="items-list scrollable">
                <section class="item" :class="{'active':selectedOrigin === origin}" v-for="(count, origin) in origins" @click="selectedOrigin = origin">
                    <figure class="title">{{origin}}</figure>
                    <figure class="description">{{count}} permission{{count !== 1 ? 's':''}}</figure>
                </section>
            </section>

        </section>

        <origin-perms v-on:emptied="selectNextOrigin" :key="selectedOrigin" :origin="selectedOrigin" v-if="selectedOrigin"></origin-perms>
        <nothing-here v-if="!origins.length" :description="`
            As you start using Scatter to interact with applications and websites this will fill up and you will be able to manage your permissions for Identities and Contracts.
        `"></nothing-here>

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
            selectedOrigin:null,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'permissions'
            ]),
            origins(){
                return this.permissions.reduce((acc, p) => {
                    if(!Object.keys(acc).includes(p.origin)) acc[p.origin] = 1;
                    else acc[p.origin] += 1;
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