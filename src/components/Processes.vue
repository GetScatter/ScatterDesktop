<template>
    <section class="processes">
        <transition-group name="slide-right" mode="out-in">
            <section :key="process.id" class="process" v-for="process in processes">
                <figure class="title">
                    <span key="title" v-if="process.progress < 100">{{process.title}}</span>
                    <b key="done" v-else>Done!</b>
                </figure>
                <transition name="delayed-fade" mode="out-in">
                    <figure class="sub-title" v-if="process.subTitle && process.progress < 100">{{process.subTitle}}</figure>
                </transition>
                <figure class="percentage-bar">
                    <figure class="bar" :style="{'width':process.progress + '%'}"></figure>
                </figure>
            </section>
        </transition-group>
    </section>
</template>

<script>
    import {RouteNames} from '../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';

    export default {
        data(){ return {

        }},
        computed:{
            ...mapState([
                'processes'
            ]),
        },
        methods:{
            ...mapActions([

            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .processes {
        width:160px;
        position:fixed;
        bottom:5px;
        right:5px;
        z-index:99999999;
        display:flex;
        flex-direction: column;

        .process {
            background:#fff;
            padding:10px;
            border-radius:2px;
            border:1px solid $dark-blue;
            margin-top:2px;

            .title {
                font-size: 11px;
                margin-bottom:5px;
                color: $dark-blue;
                font-weight: bold;
            }

            .sub-title {
                font-size: 9px;
                width:100%;
                margin-top:5px;
                padding:5px 0;
                border-top:1px solid rgba(0,0,0,0.2);
            }

            .percentage-bar {
                margin:0;
            }
        }

        @media (min-width:1280px){

            width:260px;

            .process {
                padding:20px;

                .title {
                    font-size: 16px;
                    margin-bottom:8px;
                }

                .sub-title {
                    font-size: 13px;
                    margin-top:8px;
                    padding:8px 0;
                }
            }

        }
    }
</style>
