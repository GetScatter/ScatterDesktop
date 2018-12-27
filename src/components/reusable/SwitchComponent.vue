<template>
    <section class="switcher">
        <button :disabled="disabled" v-on:click="toggle" :class="{'secondary':selected === first}">
            {{first}}
        </button>
        <button :disabled="disabled" v-on:click="toggle" :class="{'secondary':selected === second}">
            {{second}}
        </button>
    </section>
</template>

<script>
    export default {
        methods: {
            toggle(){
                this.$emit('switched', this.selected === this.first ? this.second : this.first);
            }
        },
        props:['first', 'second', 'selected', 'disabled']
    }
</script>

<style scoped lang="scss">
    @import "../../styles/variables";

    .switcher {
        width:100%;
    }

    button {
        cursor: pointer;
        width:50%;
        padding:0 20px;
        height:40px;
        line-height:39px;
        border:1px solid $primary;
        border-radius:5px;
        outline:0;
        background:$secondary;
        color:#fff;
        font-size:13px;
        font-weight: bold;
        margin-top:10px;
        display:inline-block;

        transition: all 0.15s ease;
        transition-property: background, color, border;

        &:disabled {
            opacity:0.2;
        }

        &.secondary {
            background:transparent;
            border:1px solid rgba(0,0,0,0.2);
            color:rgba(0,0,0,0.2);

            &:hover {
                border:1px solid $primary;
                color: $primary;
            }

            &:active {
                background: $primary;
                border: 1px solid transparent;
                color: #fff;
            }
        }



        &:first-child {
            border-top-right-radius:0;
            border-bottom-right-radius:0;
            border-right:0 !important;
        }

        &:last-child {
            border-top-left-radius:0;
            border-bottom-left-radius:0;
            border-left:0 !important;
            margin-left:-5px;
        }
    }
</style>