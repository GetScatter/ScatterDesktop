<template>
    <section class="home">

        <section class="top-bar">
            <section>
                <btn small="1" text="Nathan James"></btn>
            </section>

            <section class="actions">
                <figure class="action">
                    <font-awesome-icon icon="cog" />
                </figure>

                <figure class="action">
                    <font-awesome-icon icon="sync" />
                    <section class="percentage">
                        <figure class="bar"></figure>
                    </section>
                </figure>
            </section>
        </section>

        <section class="action-bar short" v-if="keypairs.length">
            <section>
                <btn text="Placeholder Placeholder"></btn>
                <btn text="Exchange"></btn>
            </section>
            <section>
                <btn text="Send"></btn>
                <btn text="Receive"></btn>
            </section>
        </section>

        <section class="full-panel center-fold" v-if="!keypairs.length">
            <section>
                <img src="../assets/piggy_waiting.png" /><br>
                Well, what are you waiting for?
            </section>
            <section class="action-bar short bottom centered">
                <btn blue="1" style="width:300px;" text="Add Keys"></btn>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    import PermissionService from '../services/PermissionService';
    import ElectronHelpers from '../util/ElectronHelpers';
    import {BlockchainsArray, blockchainName} from '../models/Blockchains';

    let saveTimeout = null;

    export default {
        data () {return {
            searchTerms:'',
            appData:null,
            images:[],
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

            fetch(`https://rawgit.com/GetScatter/ScatterApps/master/apps.json?rand=${Math.random() * 10000 + 1}`).then(res => res.json()).then(res => {
                let allApps = [];
                BlockchainsArray.map(({value}) => {
                    allApps = allApps.concat(res[blockchainName(value)]);
                });
                allApps = allApps.reduce((acc,x) => {
                    acc[x.applink] = x;
                    return acc;
                })
                this[Actions.SET_DAPP_DATA](allApps);
            });
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

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .home {
        height:calc(100vh - 80px);

        .top-bar {
            width:100%;
            height:50px;
            background:$light-blue;
            display:flex;
            flex-direction: row;
            justify-content: space-between;
            padding:0 30px;

            .actions {
                .action {
                    cursor: pointer;
                    background:transparent;
                    outline:0;
                    border-radius:4px;
                    transition: all 0.15s ease;
                    transition-property: background, color, border;
                    height:32px;
                    line-height: 32px;
                    font-size: 13px;
                    font-weight: bold;
                    width:auto;
                    padding:0 10px;
                    border:1px solid rgba(0,0,0,0.12);
                    color:#fff;
                    display:inline-block;

                    &:hover {
                        border:1px solid rgba(0,0,0,0.22);
                    }

                    &:active {
                        background:rgba(0,0,0,0.06);
                        border:1px solid rgba(0,0,0,0.12);
                    }

                    .percentage {
                        border:2px solid #fff;
                        border-radius:50px;
                        width:64px;
                        height:10px;
                        display:inline-block;
                        padding:1px;
                        margin-left:5px;

                        .bar {
                            height:4px;
                            width:20%;
                            background:#fff;
                            border-radius:50px;
                        }
                    }
                }
            }

            button {
                border:1px solid rgba(0,0,0,0.12);
                color:#fff;

                &:hover {
                    border:1px solid rgba(0,0,0,0.22);
                }

                &:active {
                    border:1px solid rgba(0,0,0,0.12);
                    background:rgba(0,0,0,0.22);
                }
            }
        }
    }


</style>
