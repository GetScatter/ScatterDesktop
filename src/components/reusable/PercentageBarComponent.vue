<template>
    <section class="p-bar">
        <figure class="full" :class="color" :style="{'width':width}"></figure>
        <figure class="text">{{lText}}</figure>
        <figure class="text right">{{rText}}</figure>
    </section>
</template>

<script>
    export default {
        computed:{
            width(){
                return (this.used * 100) / this.total + '%';
            }
        },
        props:['used', 'total', 'lText', 'rText', 'color']
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";

    .p-bar {
        width:100%;
        height:30px;
        border-radius:20px;
        position: relative;

        background:rgba(0,0,0,0.04);
        box-shadow:inset 0 0 2px rgba(0,0,0,0.2), inset 40px 0 40px rgba(0,0,0,0.1), inset 0 -1px 15px rgba(0,0,0,0.15);
        margin-top:10px;
        overflow: hidden;



        .full {
            height:30px;
            border-radius:20px;

            &.red {
                background:$red;
                box-shadow:inset 0 2px 8px 5px $red, inset 0 10px 15px rgba(255,255,255,0.5), inset 0 -5px 10px rgba(0,0,0,0.2), 30px 0 50px rgba(0,0,0,0.2), 5px 0 10px rgba(0,0,0,0.2);
            }

            &.blue {
                background:$light-blue;
                box-shadow:inset 0 2px 8px 5px $light-blue, inset 0 10px 15px rgba(255,255,255,0.5), inset 0 -5px 10px rgba(0,0,0,0.2), 30px 0 50px rgba(0,0,0,0.2), 5px 0 10px rgba(0,0,0,0.2);
            }

            &.yellow {
                background:yellow;
                box-shadow:inset 0 2px 8px 5px yellow, inset 0 10px 15px rgba(255,255,255,0.5), inset 0 -5px 10px rgba(0,0,0,0.2), 30px 0 50px rgba(0,0,0,0.2), 5px 0 10px rgba(0,0,0,0.2);
            }

            &.orange {
                background:orange;
                box-shadow:inset 0 2px 8px 5px orange, inset 0 10px 15px rgba(255,255,255,0.5), inset 0 -5px 10px rgba(0,0,0,0.2), 30px 0 50px rgba(0,0,0,0.2), 5px 0 10px rgba(0,0,0,0.2);
            }
        }

        .text {
            position: absolute;
            top:7px;
            font-size: 11px;
            font-weight: bold;


            &:not(.right){
                left:-6px;
                padding:2px 5px 1px 20px;
                background:rgba(255,255,255,1);
                box-shadow:inset 15px 0 5px -1px rgba(0,0,0,0.2), inset 10px 0 2px -1px rgba(0,0,0,0.3), 0 2px 5px rgba(0,0,0,0.2), -5px 0 10px rgba(0,0,0,0.2);
                border-radius: 4px;
            }

            &.right {
                right:10px;
                font-family: 'Open Sans', sans-serif;
                top:7px;
                font-size: 11px;
            }
        }
    }
</style>