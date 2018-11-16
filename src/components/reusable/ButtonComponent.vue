<template>
    <button :disabled="disabled" v-on:click="emit" :class="{'blue': blue, 'red':red, 'small':small}">
        <i :class="icon" v-if="icon"></i>
        <span v-else>
            <i class="icon-spin4 animate-spin" v-if="loading"></i>
            <span v-else>{{text}}</span>
        </span>
    </button>
</template>

<script>
    export default {
        methods: { emit(){ this.$emit('clicked') } },
        props:['text', 'icon', 'blue', 'red', 'disabled', 'small', 'loading']
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    button {
        cursor: pointer;
        height:44px;
        padding:0 15px;
        width:100%;
        outline:0;
        border:1px solid #dfe0e1;
        border-radius:4px;
        color:$dark-blue;
        font-size: 16px;
        font-weight: bold;
        background:#fff;
        max-width:360px;

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
            background:$dark-blue;
        }

        &.red {
            border:1px solid $red;
            color:$red;
        }

        &:hover {
            border:1px solid rgba(0,0,0,0.22);
        }

        &:active {
            border:1px solid $dark-blue;
            background:rgba(0,0,0,0.04);

            &.blue {
                background-color:darken($dark-blue, 6%);
                border-color:darken($dark-blue, 12%);
                color:#fff;
            }

            &.red {
                border:1px solid $red;
                background:$red;
                color:#fff;
            }
        }

        &:disabled {
            opacity:0.4;
            cursor: not-allowed;
        }

    }
</style>