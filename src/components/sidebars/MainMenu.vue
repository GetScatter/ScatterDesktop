<template>
    <aside class="main-menu">
        <section class="panel">

            <section class="head">
                <section class="logo">
                    <figure class="grand-hotel">Scatter</figure>
                </section>
                <section class="window-actions">
                    <i class="fa fa-code" v-tooltip="'Open Console'" @click="openConsole"></i>
                    <i class="fa fa-arrow-down" v-tooltip="'Minimize to Tray'" @click="minimize"></i>
                </section>
            </section>

            <section class="links">

                <section v-for="(link, index) in links" :key="index">
                    <figure class="line" v-if="lines.includes(index)"></figure>

                    <router-link :to="{name:link.disabled ? '' : link.route}" class="link" :class="{'disabled':link.disabled}">

                        <figure class="text">
                            <i :class="link.icon"></i>
                            <span>{{link.name}}</span>
                        </figure>
                    </router-link>
                </section>

                <figure class="line"></figure>
                <figure class="link" @click="quit">
                    <figure class="text">
                        <i class="fa fa-power-off"></i>
                        <span>Quit</span>
                    </figure>
                </figure>

            </section>


        </section>
    </aside>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {RouteNames} from '../../vue/Routing'

    import WindowService from '../../services/WindowService'
    import RIDLService from '../../services/RIDLService'

    const { remote } = window.require('electron');


    export default {
        name: 'MainMenu',
        data () {return {
            lines:[1,5],
            links:[
                {route:RouteNames.TRANSFER, name:'Transfer', icon:'fa fa-paper-plane'},
                {route:RouteNames.IDENTITIES, name:'Identities', icon:'fa fa-address-book'},
                {route:RouteNames.BLOCKCHAINS, name:'Blockchains', icon:'fa fa-key'},
                {route:RouteNames.PERMISSIONS, name:'Permissions', icon:'fa fa-shield'},
                {route:RouteNames.HELP, name:'Help', icon:'fa fa-question-circle', disabled:false},
                {route:RouteNames.SETTINGS, name:'Settings', icon:'fa fa-gear'},
            ]
        }},
        computed:{
            ...mapState([
                'scatter'
            ])
        },
        mounted(){
            RIDLService.canConnect().then(bool => {
                if(bool) {
                    this.links.splice(2, 0, {route:RouteNames.REPUTATION, name:'Reputation', icon:'icon icon-ridl'});
                    this.lines.push(3);
                } else {
                    this.lines.push(2);
                }
            })
        },
        methods:{
            minimize(){
                remote.BrowserWindow.getFocusedWindow().hide();
            },
            quit(){
                remote.app.quit();
            },
            openConsole(){
                WindowService.openTools();
            },
            ...mapActions([

            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .icon-ridl {
      margin-left:-5px;
    }

    .main-menu {
        width:270px;
        background:#fff;
        z-index:2;

        .head {
            .logo {
                color:$mid-light-grey;
                width:80px;
                float:left;
            }

            .window-actions {
                text-align:right;
                width:calc(100% - 80px);
                float:right;
                font-size:16px;

                i {
                    padding:10px;
                }
            }
        }

        .links {
            margin-top:10px;

            .link {
                cursor: pointer;
                height:60px;
                line-height:60px;
                padding-left:0;
                box-shadow:inset 0 0 0 transparent, inset 0 0 0 transparent, inset 0 0 0 transparent, inset 0 0 0 transparent;
                font-size:16px;
                background:transparent;
                transition: background 0.9s ease, padding 0.3s ease, box-shadow 0.5s ease, color 0.5s ease, border 0.4s ease;

                &:hover, &.active, &.router-link-active {
                    &:not(.disabled){
                        padding-left:8px;
                        box-shadow:inset 8px 0 0 $light-blue, inset 0 0 0 transparent;
                        * { color:$dark-blue !important; }
                    }
                }

                &.router-link-active {
                    &:not(.disabled){
                        transition: background 0.5s ease, padding 1.8s ease, box-shadow 1.5s ease, color 0.5s ease, border 0.4s ease;
                        padding-left:0;
                        box-shadow:inset 5px 0 0 $light-blue, inset 60px 0 80px -40px $light-blue-opaque-2, inset -40px 0 150px -40px rgba(255,255,255,0.3), inset 40px 0 150px -40px rgba(0,0,0,0.12);

                        * { color:#fff !important; }
                        background:$dark-blue;
                    }
                }

                &.disabled {
                    cursor:not-allowed;
                    background:$light-grey;
                    * { color:$mid-light-grey; }
                }

                .text {
                    padding:0 30px;

                    i {
                        color:$mid-light-grey;
                        transition: color 0.3s ease;
                    }

                    span {
                        margin-left:10px;
                    }
                }
            }

            .line {
              width:100%;
              height:10px;
              background:rgba(0,0,0,0.04);
              box-shadow:inset 0 1px 1px rgba(0,0,0,0.04);
            }
        }
    }

</style>
