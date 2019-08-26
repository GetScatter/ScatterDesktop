<template>
    <section>

        <section class="account" v-if="account">
            <section class="manage">
                <div class="wrapper">

                    <!--------------------------->
                    <!-------- DETAILS ---------->
                    <!--------------------------->
                    <section class="details">
                        <figure class="blockchain" :class="`token-${account.blockchain()}-${account.blockchain()}`"></figure>
                        <figure class="name selectable">{{account.sendable()}}</figure>
                        <figure class="network">{{account.network().name}}</figure>
                        <figure class="permissions">
                            <figure class="permission" @click="copyAuthKey(acc)"
                                    :class="{'red':acc.authority === 'owner'}"
                                    v-for="acc in account.authorities()">
                                {{acc.authority}}
                            </figure>
                        </figure>
                    </section>


                    <!--------------------------->
                    <!-------- RESOURCES -------->
                    <!--------------------------->
                    <section class="resources" v-if="usesResources">
                        <section class="loading" v-if="!accountResources">
                            <figure class="spinner icon-spin4 animate-spin"></figure>
                        </section>
                        <section class="resource" v-for="resource in accountResources">
                            <figure class="icon" :class="{
                            'icon-check':resource.percentage <= 50,
                            'icon-attention red':resource.percentage > 50
                        }"></figure>
                            <figure class="type">{{resource.name}}</figure>
                            <figure class="percentage">{{resource.text ? resource.text : parseFloat(resource.percentage).toFixed(2) + '%'}}</figure>
                            <figure class="action"> <!--  v-if="resource.actionable" -->
                                <Button small="1" :disabled="!resource.actionable" @click.native="moderateResource(resource)" :text="resource.actionText" />
                            </figure>
                        </section>
                    </section>


                    <!--------------------------->
                    <!-------- ACTIONS ---------->
                    <!--------------------------->
                    <section class="actions" v-if="accountActions">
                        <section class="action" :key="action.id" v-for="action in accountActions">
                            <figure class="icon" :class="`${action.icon} ${action.isDangerous ? ' red' : ''}`"></figure>
                            <figure class="name">{{action.title}}</figure>
                            <Button small="1" :red="action.isDangerous" :text="action.buttonText" @click.native="commitAction(action)" />
                        </section>
                    </section>
                </div>
            </section>




            <section class="assets">
                <TokenGraph :balances="filteredBalances || account.tokens()" />
                <TokenList :balances="account.tokens()" v-on:balances="x => filteredBalances = x" />
            </section>
        </section>



    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '@walletpack/core/store/constants';
    import PanelTabs from "../components/reusable/PanelTabs";
    import ResourceService from "@walletpack/core/services/blockchain/ResourceService";
    import BalanceService from "@walletpack/core/services/blockchain/BalanceService";
    import PluginRepository from '@walletpack/core/plugins/PluginRepository'
    import TokenGraph from "../components/tokens/TokenGraph";
    import TokenList from "../components/tokens/TokenList";

    export default {
	    components: {TokenList, TokenGraph, PanelTabs},
        data(){return {
            filteredBalances:null,
        }},
	    computed:{
            ...mapState([
                'resources',
                'balances',
            ]),
            ...mapGetters([
            	'accounts',
            ]),
            tabs(){
	            return [
		            {name:this.account.sendable(), state:this.account.sendable()},
	            ];
            },
            account(){
            	return this.accounts.find(x => x.unique() === this.$route.params.unique);
            },
            usesResources(){
            	return ResourceService.usesResources(this.account);
            },
		    accountResources(){
			    const resource = this.resources[this.account.identifiable()];
			    return resource ? resource : null;
		    },
		    accountActions(){
			    const plugin = PluginRepository.plugin(this.account.blockchain());
			    const hasActions = plugin.hasAccountActions();
			    if(!hasActions) return null;
			    return plugin.accountActions(this.account);
		    },
        },
        mounted(){
	    	setTimeout(() => {
			    ResourceService.cacheResourceFor(this.account)
			    BalanceService.loadBalancesFor(this.account)
            }, 250);
        },
        methods:{
	        async moderateResource(resource){
		        if(await ResourceService.moderateResource(resource, this.account)){
		            this[Actions.ADD_RESOURCES]({acc:this.account.identifiable(), res:await ResourceService.getResourcesFor(this.account)});
		            await BalanceService.loadBalancesFor(this.account);
		        }
	        },
	        copyAuthKey(account){
	            this.copyText(account.publicKey);
            },
            async commitAction(action){
	            const result = await action.onclick();
	            if(result && !this.account){
                    this.$router.back();
                }
            },

            ...mapActions([
            	Actions.ADD_RESOURCES,
            ])
        }

    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";
    $panelheight:180px;

    .account {
        height:$quickheightnobuffer;
        display:flex;
        background:$blue;

        .manage {
            min-width:380px;
            max-width:30%;
            width:100%;
            padding:$padding-med 0 $padding-med $padding-med;
            height:calc(#{$quickheightnobuffer});

            .wrapper {
                background:white;
                border-radius:$radius-big;
                height:100%;

                .details {
                    padding:0 30px 0;
                    display:flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    height:$panelheight - 40px;

                    .blockchain {
                        font-size: 48px;
                    }

                    .name {
                        font-size: $large;
                        font-weight: bold;
                        text-align:center;
                        max-width:80%;
                    }

                    .network {
                        font-size: $small;
                        margin-top:5px;
                    }

                    .permissions {
                        display:flex;
                        margin-top:15px;

                        .permission {
                            cursor: pointer;
                            font-size: $tiny;
                            padding:3px 8px;
                            border-radius:50px;
                            background:$blue;
                            color:$white;
                            margin:0 3px;

                            &.red {
                                background:$red;
                            }
                        }
                    }
                }
            }

            .resources {
                height:$panelheight;
                padding:30px;
                border-bottom:1px solid $lightgrey;
                display:flex;
                justify-content: space-between;

                .loading {
                    font-size: 36px;
                    color: $lightgrey;
                    display:flex;
                    align-items: center;
                    justify-content: center;
                    width:100%;
                }

                .resource {
                    display:flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;

                    .icon {
                        display:flex;
                        justify-content: center;
                        align-items: center;
                        border-radius:50%;
                        width:32px;
                        height:32px;
                        border:2px solid $blue;
                        color:$blue;
                        font-size: 16px;



                        &.red {
                            color:$red;
                            border-color: $red;
                            font-size: 18px;
                        }
                    }

                    .type {
                        font-size: $small;
                        font-weight: bold;
                        margin-top:10px;
                    }

                    .percentage {
                        font-size: $tiny;
                        margin-top:2px;
                    }

                    .action {
                        margin-top:10px;
                    }
                }
            }

            .actions {
                padding:30px;
                height:calc(#{$quickheightnobuffer} - #{$panelheight * 2});
                overflow-y:auto;

                .action {
                    display:flex;
                    margin-bottom:10px;
                    align-items: center;

                    .icon {
                        height:35px;
                        width:35px;
                        border-radius:50%;
                        background:$blue;
                        color:$white;
                        display:flex;
                        justify-content: center;
                        align-items: center;

                        &.red {
                            background:$red;
                        }
                    }

                    .name {
                        padding:0 10px;
                        flex:1;
                        font-size: $small;
                        font-weight: bold;
                    }

                    button {
                        min-width:80px;
                    }
                }
            }
        }

        .assets {
            flex:1;

            .token-list {
                height:calc(#{$quickheightnobuffer} - #{$panelheight});
                padding: $padding-med;
            }
        }


    }


</style>
