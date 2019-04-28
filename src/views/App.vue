<template>
    <section class="app">
        <PanelTabs :tabs="tabs" :state="applink" v-on:selected="$router.back()" />

        <section class="scroller">
            <figure class="blue-bg"></figure>
            <section class="padder">
                <section class="featured">
                    <Carousel :no-info="true" :slides="[getAppData(applink)]" />
                </section>

                <section class="info">

                    <section class="actions">
                        <section v-if="canOpenApp(applink)">
                            <Button @click.native="openApp(applink)" text="Open" :blue="true" />
                        </section>
                        <section v-if="appPermissions.length">
                            <Button text="Revoke access" />
                        </section>
                    </section>

                    <figure class="category">{{getAppData(applink).type}}</figure>
                    <p>{{getAppData(applink).description}}</p>

                </section>
            </section>
        </section>


    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import SingletonService from "../services/utility/SingletonService";
    import PanelTabs from "../components/reusable/PanelTabs";
    import ObjectHelpers from "../util/ObjectHelpers";
    import AppsService from "../services/apps/AppsService";
    import Carousel from "../components/reusable/Carousel";


    export default {
	    components: {Carousel, PanelTabs},
	    data () {return {

        }},
        computed:{
            ...mapState([
            	'scatter',
	            'dappLogos',
	            'dappData',
            ]),
            ...mapGetters([
            	'permissions',
            ]),
	        applink(){
                return this.$route.params.applink;
            },
	        tabs(){
		        return [
			        {name:this.getAppData(this.applink).name, state:this.applink},
		        ]
	        },
	        appPermissions(){
                return this.permissions.filter(x => x.origin === this.applink);
	        }
        },
	    mounted(){
            this.setQuickActionsBack(true);
	    },
        methods:{
	        getAppData:AppsService.getAppData,

        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .app {
        .scroller {
            position: relative;
            height:calc(100vh - 220px);
            overflow-y:auto;

            .blue-bg {
                position: absolute;
                top:0;
                left:0;
                right:0;
                height:70px;
                background:$blue-gradient-completer;
                z-index:1;
            }

            .padder {
                padding:0 40px;
                position: relative;
                z-index:2;
            }

            .featured {

            }

            .info {
                margin-top:20px;

                .actions {
                    display:flex;
                    justify-content: space-between;
                }

                .category {
                    margin:20px 0 10px 0;
                    font-size: $small;
                    color:$silver;
                }

                p {
                    font-size: $medium;
                }


            }
        }
    }


</style>
