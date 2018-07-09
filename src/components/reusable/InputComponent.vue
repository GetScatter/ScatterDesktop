<template>
    <section class="input" :class="{'forced':forced}">
        <input @blur="blur" :maxlength="maxlength || -1" :class="{'hide-date':type === 'date' && !input.length}" :disabled="disabled || false" :type="type || 'text'" v-model="input" />
        <label :class="{'hidden':input.toString().length, 'for-disabled':disabled || false}">{{placeholder}}</label>
        <label v-if="forced" class="forced">{{placeholder}}</label>
        <figure class="dynamic-button" v-if="dynamicButton" :class="{'not-disabled':!disabled}" @click="emitDynamicButton">
            <i class="fa " :class="`fa-${dynamicButton}`"></i>
        </figure>
        <figure class="copy" v-if="copy">
            <i class="fa fa-copy"></i>
        </figure>
    </section>
</template>

<script>
    export default {
        data(){ return { input:this.text || '' }},
        methods: {
            emit(){ this.$emit('changed', this.input) },
            blur(){ this.$emit('blur') },
            emitDynamicButton(){ this.$emit('dynamic') },
        },
        props:['placeholder', 'type', 'maxlength', 'text', 'disabled', 'forced', 'copy', 'dynamicButton'],
        watch:{
            input:function(){ this.emit(); },
            text:function(){ this.input = this.text; },
        }
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";
    .input {
        height:32px;
        position: relative;
        width:100%;
        margin-top:20px;

        &.forced {
            height:40px;
            margin-bottom:10px;

            input {
                margin-top:15px;
            }
        }

        label {
            position:absolute;
            bottom:9px;
            font-size:13px;
            color:$mid-dark-grey;
            /*font-weight: bold;*/
            z-index:0;
            opacity:1;

            transition:bottom 0.2s ease, opacity 0.2s ease;

            &.for-disabled {
                padding-left:10px;
            }

            &.hidden {
                opacity:0;
            }

            &.forced {
                bottom:28px;
            }
        }

        .copy, .dynamic-button {
            cursor: pointer;
            position: absolute;
            right:10px;
            bottom:2px;
            font-size:13px;
            z-index:2;

            &:hover {
                color:$dark-blue;
            }

            &.not-disabled {
                bottom:10px;
            }
        }

        .dynamic-button + .copy {
            right:30px;
        }

        input {
            outline:0;
            border:0;
            height:30px;
            width:100%;
            border-bottom:1px solid rgba(0,0,0,0.08);
            position: relative;
            background:transparent;
            z-index:1;
            font-size:15px;

            &:disabled {
                cursor:not-allowed;
                background:rgba(0,0,0,0.03);
                padding:0 10px;
                clear:both;
            }

            &.hide-date {
                color:transparent;
            }

            &:focus {
                color:inherit;
                ~ label {
                    bottom:28px;
                }
            }
        }
    }
</style>