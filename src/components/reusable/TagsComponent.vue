<template>
    <section class="tags-container">

        <section class="tags">
            <figure class="tag" :class="{'adder':adder}" v-for="item in items" @click="emit(item)">
                <span>{{parse(item)}}</span>
                <i class="fa fa-times" :class="{'fa-times':!adder, 'fa-plus':adder}"></i>
            </figure>
        </section>

        <btn v-if="buttonText" v-on:clicked="buttonFunc" :text="buttonText"></btn>
    </section>
</template>

<script>
    export default {
        data(){ return {

        }},
        methods: {
            emit(item){ this.$emit('clicked', item) },
            parse(item){
                if(typeof item === 'string') return item;
                if(this.parser) return this.parser(item);

                let props = this.prop.split(".");
                const lastKey = props.pop();
                return props.reduce((obj,key)=> obj[key], item)[lastKey];
            },
        },
        props:['adder', 'items', 'parser', 'buttonText', 'buttonFunc']
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";
    .tags-container {


        .tags {
            margin-bottom:5px;
            /*overflow: hidden;*/
            clear:both;

            .tag {
                cursor: pointer;
                font-size:16px;
                font-weight: 500;
                color:$mid-dark-grey;
                background:$lighter-grey;
                border:1px solid $mid-light-grey;
                border-radius:2px;
                padding:15px;
                overflow: hidden;

                transition: all 0.2s ease;
                transition-property: background, border, color;

                &:not(:last-child){
                    margin-bottom:5px;
                }

                i {
                    float:right;
                    margin-top:1px;
                    opacity:0;
                    transition: opacity 0.2s ease;
                }

                &:hover {
                    background:$red;
                    border:1px solid $dark-red;
                    color:#fff;

                    i {
                        opacity:1;
                    }
                }

                &:active {
                    background:$red;
                    border:1px solid $dark-red;
                }

                &.adder {
                    &:hover {
                        background:$light-blue;
                        border:1px solid $dark-blue;
                    }

                    &:active {
                        background:$dark-blue;
                        border:1px solid $dark-blue;
                    }
                }

            }

        }

    }

</style>