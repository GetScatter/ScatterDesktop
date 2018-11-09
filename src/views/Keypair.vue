<template>
    <section>
        <back-bar v-on:back="back" :buttons="buttons"></back-bar>
        <section v-if="keypair">

            <!-- MAIN KEYPAIR DASHBOARD -->
            <section class="panel-container">
                <cin big="1" label="Wallet Name" placeholder="Give this wallet a name to remember." :text="keypair.name" v-on:changed="x => keypair.name = x"  />

                <section class="dash-switch">
                    <figure class="button" :class="{'active':dashState === DASH_STATES.ACCOUNTS}" @click="dashState = DASH_STATES.ACCOUNTS">Accounts</figure>
                    <figure class="button" :class="{'active':dashState === DASH_STATES.PUBLIC_KEYS}" @click="dashState = DASH_STATES.PUBLIC_KEYS">Keys and Blockchains</figure>
                </section>

                <section class="list-container">
                    <transition name="slide-left" mode="out-in">

                        <!-- ACCOUNTS -->
                        <section key="accounts" v-if="dashState === DASH_STATES.ACCOUNTS">
                            <SearchBar class="search" placeholder="Search Accounts" v-on:terms="x => searchTerms = x" />
                            <section class="list">
                                <section class="item" v-for="account in filteredAccounts">
                                    <section class="basics">
                                        <section class="info">
                                            <figure class="network">{{blockchainName(account.blockchain())}} on {{account.network().name}}</figure>
                                            <figure class="identifier">{{account.sendable()}}</figure>
                                        </section>
                                        <section class="tokens">
                                            View 4 tokens <i class="icon-right-open-big"></i>
                                        </section>
                                    </section>

                                    <section class="moderations">
                                        <section class="moderation" v-for="percentage in [2, 50, 88]">
                                            <figure class="name">CPU</figure>
                                            <figure class="percentage-bar">
                                                <figure class="bar" :style="{'width':percentage + '%'}"></figure>
                                            </figure>
                                            <figure class="action">
                                                <btn small="1" text="Manage"></btn>
                                            </figure>
                                        </section>
                                    </section>
                                </section>
                            </section>
                        </section>



                        <!-- KEYS AND BLOCKCHAINS -->
                        <section key="keys" v-if="dashState === DASH_STATES.PUBLIC_KEYS"></section>
                    </transition>
                </section>
            </section>


        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'

    import SearchBar from '../components/panels/home/SearchBar';

    import KeyPairService from "../services/KeyPairService";
    import PopupService from "../services/PopupService";
    import {Popup} from "../models/popups/Popup";
    import PriceService from "../services/PriceService";


    const DASH_STATES = {
        ACCOUNTS:'accounts',
        PUBLIC_KEYS:'publicKeys',
    };

    export default {
        data () {return {
        	dashState:DASH_STATES.ACCOUNTS,
	        DASH_STATES,

	        buttons:[],
	        searchTerms:'',

	        keypair:null,
        }},
        components:{
	        SearchBar
        },
        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([
                'keypairs',
            ]),
            filteredAccounts(){
            	return this.keypair.accounts()

                    .filter(x => x.name.toLowerCase().match(this.searchTerms))
            }
        },
        mounted(){
        	this.buttons = [
                {text:'Export', clicked:() => {}},
                {text:'Refresh', clicked:() => {}},
                {text:'Remove', clicked:this.remove},
            ];

        	this.keypair = this.keypairs.find(x => x.id === this.$route.params.id);
        	if(!this.keypair) this.$router.push({name:RouteNames.HOME});
        },
        methods:{
	        back(){
	            this.$router.push({name:RouteNames.HOME});
            },
            async remove(){
	            PopupService.promptGuard(Popup.prompt(
		            "Deleting Vault Entry", "Before you do this make sure you have a backup of this Vault Entry's Private Key.",
		            "trash", "Delete"
	            ), async accepted => {
		            if(accepted) {
			            await KeyPairService.removeKeyPair(this.keypair);
			            PriceService.getBalances();
			            this.$router.push({name:RouteNames.HOME});
		            }
	            });
            },

            ...mapActions([

            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .search {
        margin-left:-30px;
    }

    .dash-switch {
        height:80px;
        position: relative;
        margin-top:-20px;
        display:flex;
        justify-content: center;
        align-items: center;

        .button {
            height:60px;
            line-height:60px;
            font-weight: bold;
            color:$mid-dark-grey;
            font-size: 14px;
            position: relative;
            cursor: pointer;
            transition:all 0.2s ease;
            transition-property: color;

            &:last-child {
                margin-left:40px;
            }

            &:after {
                content:'';
                display:block;
                position:absolute;
                bottom:-10px;
                left:0;
                right:0;
                background:$dark-blue;
                height:2px;
                z-index:2;
                opacity:0;
                transition:all 0.2s ease;
                transition-property: opacity;
            }

            &:hover {
                color:$dark-grey;
            }

            &.active {
                color:$dark-blue;

                &:after {
                    opacity:1;
                }

                &:last-child {
                    &:after {
                        animation: in-left 0.3s forwards;
                    }
                }

                &:first-child {
                    &:after {
                        animation: in-right 0.3s forwards;
                    }
                }

            }

            @keyframes in-left {
                0% {
                    transform:translateX(-120px);
                    width:120%;
                }
                100% {
                    transform:translateX(0px);
                    width:100%;
                }
            }

            @keyframes in-right {
                0% {
                    transform:translateX(280px);
                    width:30%;
                }
                100% {
                    transform:translateX(0px);
                    width:100%;
                }
            }
        }

        &:after {
            content:'';
            display:block;
            position:absolute;
            left:-70px;
            right:-70px;
            bottom:0;
            border-bottom:2px solid #f4f4f4;
        }
    }

    .list-container {
    }

    .list {
        flex:1;
        display:flex;
        flex-direction: column;
        overflow-y:auto;
        /*height:0;*/

        .item {
            flex:1;
            border:1px solid #dfe0e1;
            margin-bottom:20px;
            border-radius:2px;

            .basics {
                padding:20px;
                display:flex;
                flex-direction: row;
                justify-content: space-between;

                .info {
                    flex:1;

                    .network {
                        font-size: 11px;
                        color: $mid-dark-grey;
                    }

                    .identifier {
                        margin-top:5px;
                        font-size: 22px;
                        font-weight: 300;
                    }
                }

                .tokens {
                    display:flex;
                    align-items: center;
                    color:$dark-blue;
                    font-weight: bold;
                    cursor: pointer;

                    i {
                        margin-left:5px;
                    }

                    &:hover {
                        i {
                            animation: bounce 0.7s infinite;
                        }
                    }

                    @keyframes bounce {
                        0%, 100% {
                            transform:translateX(0px);
                        }

                        50% {
                            transform:translateX(4px);

                        }
                    }
                }

            }

            .moderations {
                padding:20px;
                background:#f4f5f5;

                .moderation {
                    display:flex;
                    flex-direction: row;
                    align-items: center;

                    &:not(:last-child){
                        margin-bottom:5px;
                    }

                    .name {
                        font-size: 14px;
                    }

                    .percentage-bar {
                        flex:1;
                        margin:0 10px;
                        height:14px;
                        border:1px solid #dfe0e1;
                        border-radius:50px;
                        width:100%;
                        background:#fff;
                        padding:3px;

                        .bar {
                            height:100%;
                            background:$light-blue;
                            border-radius:50px;
                        }
                    }

                    .action {

                    }
                }
            }
        }
    }

</style>
