<template>
    <section class="home">

        <section class="full-panel home" v-if="keypairs.length">
            <section class="action-bar short">
                <section>
                    <btn text="Placeholder Placeholder"></btn>
                    <!--<btn text="Exchange"></btn>-->
                </section>
                <section>
                    <btn text="Send"></btn>
                    <btn text="Receive"></btn>
                </section>
            </section>

            <section class="vertical-split">
                <VaultEntries class="half" />
                <Apps class="half" />
            </section>
        </section>

        <section class="full-panel center-fold" v-if="!keypairs.length">
            <section>
                <PiggyWaiting />
                <p>Well, what are you waiting for?</p>
            </section>
            <section class="action-bar short bottom centered">
                <btn v-on:clicked="newKeypair" blue="1" style="width:300px;" text="Add Keys"></btn>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import PiggyWaiting from '../components/svgs/PiggyWaiting'

    import Apps from '../components/panels/home/Apps';
    import VaultEntries from '../components/panels/home/VaultEntries';

    import PermissionService from '../services/PermissionService';
    import ElectronHelpers from '../util/ElectronHelpers';
    import {BlockchainsArray, blockchainName} from '../models/Blockchains';
    import {RouteNames} from "../vue/Routing";


    export default {
    	components:{
    		PiggyWaiting,
		    VaultEntries,
            Apps,
	    },
        data () {return {
            searchTerms:'',
        }},
        computed:{
            ...mapState([
                'scatter',
                'dappLogos',
                'dappData',
            ]),
            ...mapGetters([
                'identity',
                'keypairs',
                'permissions',
                'apps',
            ]),
            origins(){
                const origins = {};

                this.permissions.map(p => {
                    if(!Object.keys(origins).includes(p.origin)) origins[p.origin] = 1;
                    else origins[p.origin] += 1;
                });

                return Object.keys(origins).reduce((acc, origin) => {
                    if(origin.toString().toLowerCase().indexOf(this.searchTerms.toLowerCase()) !== -1)
                        acc[origin] = origins[origin];

                    return acc;
                }, {});
            }
        },
        mounted(){

        },
        methods:{



            getAppData(origin){
                const emptyResult = {
                    type:'',
                    name:origin,
                    description:'',
                    logo:'',
                    url:'',
                };

                const found = this.dappData[origin];
                if(!found) return emptyResult;

                if(!this.dappLogos.hasOwnProperty(origin)){
                    this[Actions.SET_DAPP_LOGO]({origin, logo:null});
                    const logo = `https://rawgit.com/GetScatter/ScatterApps/master/logos/${found.applink}.svg`;
                    fetch(logo).then(res => {
                        this[Actions.SET_DAPP_LOGO]({origin, logo:res.status === 200 ? logo : null});
                        this.$forceUpdate();
                    })
                }

                return found;
            },
            originLogo(origin){
                return this.dappLogos[origin];
            },
            openApps(){
                ElectronHelpers.openLinkInBrowser('https://get-scatter.com/Apps')
            },
            openApp(origin){
                const data = this.getAppData(origin);
                if(data.url.length){
                    ElectronHelpers.openLinkInBrowser(data.url);
                }

            },
            removePermissions(origin){
                PermissionService.removeAllPermissionsFor(origin);
            },
            removeAllPermissions(){
                PermissionService.removeAllPermissions();
            },
            ...mapActions([
                Actions.SET_DAPP_LOGO,
                Actions.SET_DAPP_DATA,
            ])
        }
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .home {
        position:relative;
        display:flex;
        flex-direction: column;

        .vertical-split {
            flex:1;
            display: flex;
            flex-direction: row;

            .half {
                &:first-child {
                    border-right:2px solid #f4f4f4;
                }
            }
        }
        
    }


</style>
