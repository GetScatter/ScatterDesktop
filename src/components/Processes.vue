<template>
    <section class="processes">
        <transition-group name="slide-right" mode="out-in">
            <section :key="process.id" class="process" v-for="process in processes.filter(x => x.display)">
                <figure class="kill icon-cancel" @click="process.kill()"></figure>
                <figure class="title">
                    <span key="title">{{process.title}}</span>
                    <b key="done" v-if="process.progress === 100">Done!</b>
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
    @import "../styles/variables";

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
            border:1px solid $blue;
            margin-top:2px;
            position: relative;

            .kill {
                cursor: pointer;
                position:absolute;
                top:-6px;
                right:-3px;
                width:15px;
                height:15px;
                border-radius:50%;
                background:$red;
                color:#fff;
                font-size: 11px;
                display:flex;
                justify-content: center;
                align-items: center;
            }

            .title {
                font-size: 11px;
                margin-bottom:5px;
                color: $blue;
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
