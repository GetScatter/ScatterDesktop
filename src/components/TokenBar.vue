<template>
    <section class="action-bar dark">
                <section class="token-buttons">
                    <section class="refresh" @click="refreshTokens" :class="{'loading':loadingBalances}">
                        <i v-if="!loadingBalances" class="icon-arrows-ccw"></i>
                        <i v-if="loadingBalances" class="icon-spin4 animate-spin"></i>
                    </section>

                    <router-link :to="{name:RouteNames.TOKENS}" class="total-balance">
                        <section class="total-details">
                            <figure class="amount">
                                <!-- {{totalBalance.symbol}}{{formatNumber(totalBalance.amount, true)}} -->
                                <!-- <div v-if="displayToken">{{formatNumber(totalTokenBalance.amount, true)}} {{totalTokenBalance.symbol}}</div> -->
                            </figure>
                            <figure class="dots">
                                <figure class="dot" v-for="i in [1,1,1]"></figure>
                            </figure>
                        </section>

                    </router-link>
                </section>
                <section class="actions" v-if="accounts.length">
                    <btn blue="1" v-on:clicked="$router.push({name:RouteNames.TRANSFER})" :text="locale(langKeys.DASHBOARD.TOOLBARS.SendButton)"></btn>
                    <btn blue="1" v-on:clicked="openExchange" :text="locale(langKeys.GENERIC.Exchange)"></btn>
                    <btn colorless="1" v-if="history.length" v-on:clicked="openHistory" :text="locale(langKeys.GENERIC.History)"></btn>
                </section>
            </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'

	export default {
		data(){return {

        }},
        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([
            	'identity',
                'keypairs'
            ])
        },
        methods:{

        },
	}
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import '../styles/variables';

    .user-bar {
        width:100%;
        height:50px;
        background:$blue;
        display:flex;
        flex-direction: row;
        justify-content: space-between;
        padding:0 30px;
        background: $primary;

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
                    margin-left:8px;

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
</style>