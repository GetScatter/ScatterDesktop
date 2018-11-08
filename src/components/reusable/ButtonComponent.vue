<template>
    <button :disabled="disabled" v-on:click="emit" :class="{'blue': blue, 'small':small}">
        <i class="fal " :class="'fa-'+icon" v-if="icon"></i>
        <span v-else>
            <i class="fal fa-spinner fa-spin" v-if="loading"></i>
            <span v-else>{{text}}</span>
        </span>
    </button>
</template>

<script>
    export default {
        methods: { emit(){ this.$emit('clicked') } },
        props:['text', 'icon', 'blue', 'disabled', 'small', 'loading']
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    button {
        cursor: pointer;
        height:44px;
        padding:0 15px;
        width:100%;
        background:transparent;
        outline:0;
        border:1px solid #dfe0e1;
        border-radius:4px;
        color:$dark-blue;
        font-size: 16px;
        font-weight: 500;
        transition: all 0.15s ease;
        transition-property: background, color, border;

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
            background:$light-blue;
        }

        &:hover {
            border:1px solid rgba(0,0,0,0.22);
        }

        &:active {
            border:1px solid $dark-blue;
            background:rgba(0,0,0,0.04);
        }

        &:disabled {
            opacity:0.4;
            cursor: not-allowed;
        }

    }
</style>