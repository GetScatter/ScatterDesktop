<template>
    <section class="action-bar">
        <section class="back-bar" @click="emit">
            <figure class="chevron">
                <figure></figure>
                <figure></figure>
            </figure>
            <span>Back</span>
        </section>
    </section>
</template>

<script>
    export default {
        methods: { emit(){ this.$emit('back') } }
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    .back-bar {
        font-weight: bold;
        cursor: pointer;

        span {
            vertical-align: middle;
            display:inline-block;
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

    }

    @keyframes bounce {
        0%, 100% {
            transform:translateX(0px);
        }

        50% {
            transform:translateX(4px);

        }
    }
</style>