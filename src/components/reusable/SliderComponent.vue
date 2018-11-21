<template>
    <section class="percentage-bar">
        <figure class="bar instant" :class="{'red':val > max - max/6}" :style="{'width':(val/max)*100 + '%'}"></figure>
        <input type="range" :class="{'red':val > max - max/6}" :step="step ? step : 1" :min="min" :max="max" v-model="val">
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

    .percentage-bar {
        width: 100%;
        margin:20px 0 0;
        position: relative;


        input {
            -webkit-appearance: none;  /* Override default CSS styles */
            appearance: none;
            cursor: pointer;
            width: 100%;
            background: transparent;
            height:14px;
            outline: none;
            border-radius:50px;
            position:absolute;
            top:0;
            bottom:0;
            left:0;
            right:0;


            $slider-button:24px;

            &::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: $slider-button;
                height: $slider-button;
                background: $light-blue;
                cursor: pointer;
                margin-top:-2px;

                border:3px solid #fff;
                box-shadow:0 2px 10px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.2);
                border-radius:50px;
                padding:3px;

                transition:all 0.2s ease;
                transition-property: background;

            }

            &::-moz-range-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: $slider-button;
                height: $slider-button;
                background: $light-blue;
                cursor: pointer;
                margin-top:-2px;

                border:3px solid #fff;
                box-shadow:0 2px 10px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.2);
                border-radius:50px;
                padding:3px;

                transition:all 0.2s ease;
                transition-property: background;
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