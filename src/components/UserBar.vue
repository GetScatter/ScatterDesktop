<template>
    <section class="user-bar" v-if="keypairs.length">
        <section class="actions">
            <router-link :to="{name:RouteNames.IDENTITY, query:{ridl:false}}" class="action">
                {{locale(langKeys.USER_BAR.ManageIdentity)}}
            </router-link>
            <router-link :to="{name:RouteNames.IDENTITY, query:{ridl:true}}" class="action">
                RIDL
            </router-link>

        </section>

        <section class="actions">
            <router-link :to="{name:RouteNames.SETTINGS, params:{panel:SETTINGS_OPTIONS.GENERAL}}" class="action">
                <i class="icon-cog-1"></i>
            </router-link>

            <!--<figure class="action">-->
                <!--<i class="icon-arrows-ccw"></i>-->
                <!--<section class="percentage">-->
                    <!--<figure class="bar"></figure>-->
                <!--</section>-->
            <!--</figure>-->
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
        background:$secondary;
        display:flex;
        flex-direction: row;
        justify-content: space-between;
        padding:0 30px;
        position: absolute;
        top: 80px;
        left: 0;
        right: 0;
        z-index: 2;
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