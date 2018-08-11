<template>
    <section class="slider">
        <input type="range" :class="{'red':red}" :step="step ? step : 1" :min="min" :max="max" v-model="val">
    </section>
</template>

<script>
    export default {
        data(){return {
            val:0,
        }},
        mounted(){
            this.val = this.value;
        },
        props:['min', 'max', 'value', 'step', 'red'],
        watch:{
            val(){
                this.$emit('changed', this.val);
            },
            value(){
                this.val = this.value;
            }
        }
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    .slider {
        width: 100%;
        margin-top:20px;

        input {
            -webkit-appearance: none;  /* Override default CSS styles */
            appearance: none;
            width: 100%;
            height: 15px;
            background: $light-grey;
            outline: none;
            border-radius: 20px;


            $slider-button:24px;
            $slider-button-w:44px;

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: $slider-button-w;
                height: $slider-button;
                background: $dark-blue;
                cursor: pointer;
                border-radius: 2px;
                transition: background 1s ease, opacity 0.4s ease;

                opacity: 0.3;
                &:hover { opacity: 1; }
            }

            &::-moz-range-thumb {
                width: $slider-button-w;
                height: $slider-button;
                background: $dark-blue;
                cursor: pointer;
                border-radius: 2px;
                transition: background 1s ease, opacity 0.4s ease;

                opacity: 0.3;
                &:hover { opacity: 1; }
            }

            &.red {
                &::-webkit-slider-thumb {
                    background: $red;
                }

                &::-moz-range-thumb {
                    background: $red;
                }
            }
        }

    }
</style>