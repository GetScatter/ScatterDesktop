<template>
    <section class="action-bar">
        <section class="back-bar">
            <section class="back" @click="emit">
                <figure class="chevron">
                    <figure></figure>
                    <figure></figure>
                </figure>
                <span>Back</span>
            </section>

            <section class="buttons" v-if="buttons">
                <btn class="button" v-for="button in buttons" :text="button.text" v-on:clicked="button.clicked"></btn>
            </section>
        </section>
    </section>
</template>

<script>
    export default {
        methods: { emit(){ this.$emit('back') } },
        props:['buttons'],
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    .back-bar {
        display:flex;
        flex-direction: row;
        font-weight: bold;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;
        width:100%;

        .back {

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