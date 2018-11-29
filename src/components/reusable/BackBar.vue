<template>
    <section class="action-bar">
        <section class="back-bar">
            <transition name="slide-left" mode="out-in">
                <section key="back" class="back" @click="emit" v-if="!hideBackButton">
                    <figure class="chevron">
                        <figure></figure>
                        <figure></figure>
                    </figure>
                    <section>
                        <figure>{{text ? text : locale(langKeys.GENERIC.Back)}}</figure>
                        <figure class="subtext" v-if="subtext">{{subtext}}</figure>
                    </section>
                </section>
            </transition>

            <transition name="slide-right" mode="out-in">
                <section key="buttons" class="buttons" v-if="buttons && buttons.length">
                    <btn :key="button.text" class="button" v-for="button in buttons" :red="button.hasOwnProperty('red')"
                         :disabled="disabled(button)" :text="button.text" v-on:clicked="button.clicked"></btn>
                </section>
            </transition>
        </section>
    </section>
</template>

<script>
	import { mapActions, mapGetters, mapState } from 'vuex'
    import Process from "../../models/Process";

    export default {
	    props:['buttons', 'text', 'subtext', 'short'],
        computed:{
            ...mapState([
            	'hideBackButton'
            ])
        },
        methods: {
        	emit(){ this.$emit('back') },
	        disabled(button){
		        if(!button.hasOwnProperty('process')) return false;
		        return Process.isProcessRunning(button.process)
	        }
        },
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    .back-bar {
        display:flex;
        flex-direction: row;
        font-weight: bold;
        justify-content: space-between;
        align-items: center;
        width:100%;

        .back {
            padding: 30px 30px 30px 0;
            cursor: pointer;

            > section {
                vertical-align: middle;
                display:inline-block;

                .subtext {
                    font-size: 11px;
                    color:$dark-blue;
                }
            }

            .chevron {
                width:20px;
                display:inline-block;
                vertical-align: middle;
                padding-top:6px;
                margin-right:10px;

                figure {
                    width:14px;
                    height:2px;
                    background:$light-blue;

                    &:first-child {
                        transform:rotate(45deg);
                    }

                    &:last-child {
                        transform:rotate(-45deg);
                        margin-top:-12px;
                    }
                }
            }

            &:hover {
                animation: bounce 0.7s infinite;
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

        .buttons {
            .button {
                margin-left:5px;
            }
        }

    }
</style>