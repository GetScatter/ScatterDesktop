<template>
    <button :disabled="disabled" v-on:click="emit" :class="{'blue': blue, 'red':red, 'small':small}">
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
        props:['text', 'icon', 'blue', 'red', 'disabled', 'small', 'loading']
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    button {
        cursor: pointer;
        height:38px;
        padding:0 12px;
        width:100%;
        outline:0;
        border:1px solid #dfe0e1;
        background:#fff;
        border-radius:3px;
        color:$dark-blue;
        font-size: 14px;
        font-weight: 500;
        max-width:360px;
		line-height:0;



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
            background-image: linear-gradient(-180deg, #62D0FD -20%, #39ADFF 100%);
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
                border:1px solid $dark-blue;
                background:rgba(0,0,0,0.04);

                &.blue {
                    color:$dark-blue;
                }

                &.red {
                    border:1px solid $red;
                    background:$red;
                    background-image: linear-gradient(-180deg, $red -20%, #e23b3b 100%);
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

    }
</style>