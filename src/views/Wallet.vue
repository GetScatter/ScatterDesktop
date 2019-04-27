<template>
    <section class="wallet">
        <PanelTabs :tabs="tabs" :state="state" v-on:selected="x => state = x" />




        <section class="accounts-list" v-if="state === STATES.ACCOUNTS">
            <section class="account" v-for="account in accounts">
                <section class="head">
                    <figure class="network">{{account.network().name}}</figure>
                    <figure class="danger">Dangerous authority</figure>
                </section>

                <section class="info">
                    <figure class="symbol token-eos-eos"></figure>
                    <figure class="account-name">{{account.sendable()}}</figure>
                </section>

                <section class="tail">
                    <section class="resources">
                        <section class="resource" v-for="i in [1,1,1]">
                            <figure class="icon icon-check"></figure>
                            <figure class="type">CPU</figure>
                        </section>
                    </section>
                    <section class="tokens">
                        <figure class="balance">$1,234.34</figure>
                        <figure class="count">in 33 tokens</figure>
                    </section>
                </section>
            </section>
        </section>








        <section class="wallet-actions">
            <section class="left">
                <section class="info">
                    <figure class="keys">{{keypairs.length}} keys</figure>
                    <figure class="accounts">{{accounts.length}} accounts</figure>
                </section>
            </section>
            <section class="right">
                <Button text="Import key" />
                <Button text="Generate new key" />
            </section>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import PanelTabs from '../components/reusable/PanelTabs';

    const STATES = {
    	ACCOUNTS:'accounts',
        KEYS:'keys',
    }

    export default {
    	components:{
    	    PanelTabs
        },
        data () {return {
        	state:STATES.ACCOUNTS,
	        STATES,

            tab:null,
        }},
        computed:{
            ...mapState([
            	'scatter',
            ]),
            ...mapGetters([
            	'keypairs',
            	'accounts',
            ]),
            tabs(){
            	return [
                    {name:'Accounts', state:STATES.ACCOUNTS},
                    {name:'Keys', state:STATES.KEYS},
                ]
            }
        },

        methods:{
        },
        created(){

        },

        mounted(){

        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .wallet {
        position: relative;
        height:calc(100vh - 180px);
        padding-bottom:50px;




        .accounts-list {
            padding:40px;
            display:flex;
            flex-wrap: wrap;
            justify-content: space-between;
            overflow-y: auto;
            height:calc(100% - 40px);

            .account {
                cursor: pointer;
                width:calc(50% - 10px);
                border-radius:10px;
                box-shadow:0 1px 3px $blue-shadow;
                border:1px solid rgba(0,0,0,0.05);
                padding:15px;
                margin-bottom:20px;
                height:177px;

                transition:all 0.2s ease;
                transition-property: box-shadow;

                .head {
                    font-size: $small;
                    display:flex;
                    justify-content: space-between;

                    .danger {
                        color:$red;
                    }
                }

                .info {
                    display:flex;
                    flex-direction: column;
                    justify-content: center;
                    text-align:center;
                    height:100px;

                    .symbol {
                        font-size: 48px;
                    }

                    .account-name {
                        font-size: $medium;
                        font-weight: bold;
                    }
                }

                .tail {
                    display:flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    height:36px;

                    .resources {
                        display:flex;

                        .resource {
                            padding-right:10px;

                            .icon {
                                color:$blue;
                                margin-bottom:2px;
                            }

                            .type {
                                font-size: $small;
                            }
                        }
                    }

                    .tokens {
                        text-align:right;

                        .balance {
                            font-size: $medium;
                            font-weight: bold;
                            margin-bottom:2px;
                        }

                        .count {
                            font-size: $small;
                        }
                    }
                }

                &:hover {
                    box-shadow:0 8px 18px $blue-shadow;
                }
            }

        }



        .wallet-actions {
            position:absolute;
            bottom:0;
            left:0;
            right:0;
            border-top:1px solid $border;
            height:70px;
            background:$white;

            display:flex;
            align-items: center;
            padding:0 20px;

            .left { flex:1; }
            .right { flex:0 0 auto; }

            .info {
                .keys {
                    font-size: $medium;
                    font-weight: bold;
                }

                .accounts {
                    font-size: $small;
                }
            }
        }
    }




</style>
