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
        padding:0 15px 0;
        display:inline-block;
        outline:0;
        width:100%;
        background:rgba(252,252,255,0.88);
        border-radius:4px;
        color:$link;
        font-size: 16px;
        font-weight: normal;
        max-width:360px;
		line-height:0;
        transition:all 0.12s ease-in-out;
        border:1px solid $link-border;

        &.big {
            height:60px;
            font-size: 18px;
            padding:0 24px;
        }

        &.small {
            height:32px;
            font-size: 14px;
            font-weight: normal;
            width:auto;
            padding:0 10px;
        }

        &.blue {
            color:#fff;
            background:$link;
            font-weight: normal;
            border:0px;

            &:hover {
                background-color:darken($link,5%);
            }
        }

        &.red {
            background:rgba( $red, .22 );
            color:$red;
            border:0px;

            &:hover {
                background:rgba( $red, .92 );
                color:white;
            }
        }

        &:hover {
            background-color:darken(rgba(252,252,255,0.88),2%);
        }

        &:not(:disabled){
            &:active {
                outline:1px;

                &.blue {
                    color:white;
                }

                &.red {
                    background:rgba( $red, .82 );
                    color:#fff;
                }
            }
        }

        &:disabled {
            background: darken($lighter-grey, 2%) !important;
            color: #ababab;
            opacity:0.6;
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

            &:hover {
                background-color:rgba(0,0,0,0.08);
            }

        }

    }
</style>