<template>
    <button :disabled="disabled" v-on:click="emit" :class="{'secondary':secondary, 'large':large, 'full':full, 'red':red}">
        {{text}}
    </button>
</template>

<script>
    export default {
        methods: { emit(){ this.$emit('clicked') } },
        props:['text', 'red', 'disabled', 'full', 'large', 'secondary']
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    button {
        cursor: pointer;
        padding:0 20px;
        height:40px;
        line-height:39px;
        border:1px solid $dark-blue;
        outline:0;
        background:$light-blue;
        border-radius:2px;
        color:#fff;
        font-size:13px;
        font-weight: bold;
        margin-top:10px;

        transition: all 0.15s ease;
        transition-property: background, color, border;

        &:disabled {
            opacity:0.4;
            cursor: not-allowed;
        }

        &.head {
            width:100%;
        }

        &.full {
            width:100%;
        }

        &.large {
            height:50px;
            line-height:49px;
            font-size:16px;
        }

        &:not(:disabled){

            &:hover {
                background:transparent;
                border:1px solid $dark-blue;
                color:$dark-blue;
            }

            &:active {
                background:$dark-blue;
                border:1px solid transparent;
                color:#fff;
            }

        }

        &.red {
            background:$red;
            border:1px solid transparent;
            color:#fff;

            &:not(:disabled){

                &:hover {
                    background:transparent;
                    border:1px solid $red;
                    color:$red;
                }

                &:active {
                    background:$dark-red;
                    border:1px solid transparent;
                    color:#fff;
                }

            }
        }

        &.secondary {
            background:transparent;
            border:1px solid $dark-blue;
            color:$dark-blue;

            &:not(:disabled) {
                &:hover {
                    background: $light-blue;
                    border: 1px solid transparent;
                    color: #fff;
                }

                &:active {
                    background: $dark-blue;
                    border: 1px solid transparent;
                    color: #fff;
                }
            }
        }
    }
</style>