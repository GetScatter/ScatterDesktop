<template>
    <section class="input" :class="{'big':big}">

        <label v-if="error || label" :class="{'error':error}">{{error ? error : label}}</label>

        <input ref="focuser"
               :placeholder="placeholder"
               @keyup.enter="enter"
               @blur="blur"
               :class="{'pad-right':dynamicButton}"
               :maxlength="maxlength || -1"
               :disabled="disabled || false"
               :type="type || 'text'"
               v-model="input" />

        <figure class="dynamic-button" v-if="dynamicButton" v-tooltip="dynamicTooltip" :class="{'labeled':label}" @click="emitDynamicButton">
            <i v-if="!loaderOnDynamic" :class="`${dynamicButton}`"></i>
            <i class="icon-spin4 animate-spin" v-if="loaderOnDynamic"></i>
        </figure>
        <!--<figure class="copy" v-if="copy" :class="{'unforced':!forced}">-->
            <!--<i class="fa fa-copy" v-tooltip="'Copy'" @click="copyText"></i>-->
        <!--</figure>-->
    </section>
</template>

<script>
    import ElectronHelpers from '../../util/ElectronHelpers'

    export default {
        data(){ return { input:this.text || '' }},
        methods: {
            enter(){ this.$emit('enter') },
            emit(){ this.$emit('changed', this.input) },
            blur(){ this.$emit('blur') },
            emitDynamicButton(){ this.$emit('dynamic') },
            copyText(){ ElectronHelpers.copy(this.text); }
        },
        created(){
            if(this.focus) {
                this.$nextTick(() => {
                    this.$refs.focuser.focus();
                })
            }
        },
        props:['placeholder', 'label', 'error', 'type', 'maxlength', 'text', 'disabled', 'copy', 'dynamicButton', 'dynamicTooltip', 'big', 'focus', 'loaderOnDynamic'],
        watch:{
            input:function(){ this.emit(); },
            text:function(){ this.input = this.text; },
        }
    }
</script>

<style scoped lang="scss">
    @import "../../_variables";
    .input {
        text-align:left;
        position: relative;
        width:100%;
        margin-bottom:20px;

        label {
            font-size: 11px;
            color:#7899a6;
            font-weight: bold;
            margin-bottom:8px;
            display: block;

            &.error {
                color:$red;
                animation: blink 1s ease infinite;
            }
        }

        .copy, .dynamic-button {
            cursor: pointer;
            position: absolute;
            right:20px;
            bottom:0;
            top:0;
            display:flex;
            justify-content: center;
            align-items: center;
            font-size:20px;
            z-index:2;
            color:$light-blue;

            &.labeled {
                bottom:-15px;
            }

            transition: all 0.2s ease;
            transition-property: color;

            &:hover {
                color:$dark-blue;
            }
        }
        .dynamic-button + .copy {
            right:30px;
        }

        input {
            outline:0;
            height:44px;
            width:100%;
            border:1px solid #dfe0e1;
            border-radius:4px;
            padding:0 15px;
            font-size: 18px;
            cursor: text;

            transition: all 0.15s ease;
            transition-property: line-height, height, padding, border;

            &::-webkit-input-placeholder {
                font-size: 18px;
                color:$placeholder-color;
            }
            &::-moz-placeholder {
                font-size: 18px;
                color:$placeholder-color;
            }
            &:-ms-input-placeholder {
                font-size: 18px;
                color:$placeholder-color;
            }
            &:-moz-placeholder {
                font-size: 18px;
                color:$placeholder-color;
            }

            &.pad-right {
                padding-right:30px;
            }

            &:disabled {
                cursor: not-allowed;
                opacity:0.5;
            }

            &:focus {
                border:1px solid rgba(0,0,0,0.22);
            }
        }

        &.big {

            input {
                line-height:68px;
                height:68px;
                padding:0 20px;

                &::-webkit-input-placeholder {
                    font-size: 18px;
                    color:$placeholder-color;
                }
                &::-moz-placeholder {
                    font-size: 18px;
                    color:$placeholder-color;
                }
                &:-ms-input-placeholder {
                    font-size: 18px;
                    color:$placeholder-color;
                }
                &:-moz-placeholder {
                    font-size: 18px;
                    color:$placeholder-color;
                }

                &.pad-right {
                    padding-right:50px;
                }
            }

            .dynamic-button {
                font-size: 26px;
                bottom:0;

                &.labeled {
                    bottom:-15px;
                }
            }


        }

    }
</style>
