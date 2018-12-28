<template>
    <button :disabled="disabled" v-on:click="emit" :class="{'blue': blue, 'red':red, 'small':small, 'big':big, 'borderless':borderless, 'colorless':colorless}">
        <i :class="icon" v-if="icon && !loading"></i>
        <span v-else>
            <i class="icon-spin4 animate-spin" v-if="loading"></i>
            <span v-else>{{text}}</span>
        </span>
    </button>
</template>

<script>
    export default {
        methods: { emit(){ this.$emit('clicked') } },
        props:['text', 'icon', 'blue', 'red', 'disabled', 'small', 'big', 'loading', 'borderless', 'colorless']
    }
</script>

<style scoped lang="scss">
    @import "../../styles/variables";

    button {
        cursor: pointer;
        height:38px;
        padding:0 12px;
        width:100%;
        outline:0;
        border:1px solid #dfe0e1;
        background:#fff;
        border-radius:3px;
        color:$primary;
        font-size: 14px;
        font-weight: 500;
        max-width:360px;
		line-height:0;



        &.big {
            height:48px;
            font-size: 13px;
        }

        &.small {
            height:32px;
            font-size: 13px;
            font-weight: bold;
            width:auto;
            padding:0 10px;
        }

        &.blue {
            border:1px solid rgba(0,0,0,0);
            color:#fff;
            background:$primary;
            background-image: $blue-grad;
        }

        &.red {
            border:1px solid $red;
            color:$red;
        }

        &:hover {
            border:1px solid rgba(0,0,0,0.22);
        }

        &:not(:disabled){
            &:active {
                border:1px solid $primary;
                background:rgba(0,0,0,0.04);

                &.blue {
                    color:$primary;
                }

                &.red {
                    border:1px solid $red;
                    background:$red;
                    background-image: $red-gradient;
                    color:#fff;
                }
            }
        }

        &:disabled {
            border:1px solid #c6c7c8;
            background: #e3e3e3;
            color: #ababab;
            cursor: not-allowed;
        }

        &.borderless {
            border:0;

            &:hover {
                border:0;
            }

            &:active {
                border:0;
            }
        }

        &.colorless {
	        border:1px solid rgba(255,255,255,0.1);
	        color:#fff;
	        background: transparent;

        }

    }
</style>