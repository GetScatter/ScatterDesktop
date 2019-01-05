<template>
    <section>
        <label v-if="label">{{label}}</label>

        <section class="select" :class="{'open':open, 'disabled':disabled, 'short':short}">
            <figure class="arrow">
                <i class="icon-down-open-big"></i>
            </figure>

            <figure class="selected-option" v-on:click="toggle">
                {{parse(selectedOption, true)}}
            </figure>

            <section class="options" :class="{'long':long}" v-if="!asButton">
                <input ref="terms" placeholder="Search..." v-model="optionsTerms" />
                <figure class="option" v-for="item in filteredOptions" v-on:click="select(item)">
                    <img v-if="imgParser" :src="imgParser(item)" />
                    {{parse(item)}}
                    <span class="subtitle" v-if="subparser">{{subparser(item)}}</span>
                </figure>
            </section>
        </section>
    </section>
</template>

<script>
    let documentListener;
    export default {
	    props:['placeholder', 'label', 'options', 'selected', 'prop', 'parser', 'subparser', 'disabled', 'imgParser', 'long', 'asButton', 'short'],

        data(){ return {
            optionsTerms:'',
            selectedOption:this.selected || this.placeholder || this.options[0],
            open:false,
        }},
        mounted(){ document.addEventListener('click', this.handleDocumentClick) },
        destroyed(){ document.removeEventListener('click', this.handleDocumentClick) },
        computed:{
            filteredOptions(){
                return this.options.filter(x => {
                    const parsed = this.parse(x);
                    return !parsed || parsed.toLowerCase().indexOf(this.optionsTerms.toLowerCase()) > -1
                });
            }
        },
        methods: {
	    	handleDocumentClick(e){
                if(this.open) this.open = false;
            },
            toggle(){
	    		if(this.asButton) return this.$emit('clicked', true);
	    		if(this.open) return;
                this.$nextTick(() => {
	                if(this.disabled) return false;
	                this.open = !this.open;

	                if(this.open){
		                this.optionsTerms = '';
		                setTimeout(() => {
			                this.$refs.terms.focus()
		                }, 50);
	                }
                })
            },
            parse(item, selected = false){
	    		if(this.asButton && !selected) return;
	            if(typeof item === 'string' && !this.parser) return item;
	            if(this.parser) return this.parser(item);

                let props = this.prop.split(".");
                const lastKey = props.pop();
                return props.reduce((obj,key)=> obj[key], item)[lastKey];
            },
            select(item){
                this.selectedOption = item;
                this.open = false;
                this.$emit('changed', this.selectedOption)
            }
        },
        watch:{
            input(){ this.emit(); },
            text(){ this.input = this.text; },
            disabled(isDisabled){ if(isDisabled) this.open = false; },
            selected(){ this.selectedOption = this.selected; },
        }
    }
</script>

<style scoped lang="scss">
    @import "../../styles/variables";

    label {
        font-size: 14px;
        color:#7899a6;
        font-weight: bold;
        margin-bottom:5px;
        display: block;
        text-align:left;

        &.error {
            color:$red;
            animation: blink 1s ease infinite;
        }
    }

    .select {
        text-align:left;
        cursor: pointer;
        height:38px;
        position: relative;
        width:100%;
        border-radius:3px;
        background:#fff;
        border:1px solid #dfe0e1;
        font-size: 14px;
        transition:background 0.1s ease;

        input {
            position: absolute;
            top:-100px;
            opacity:0;
        }

        &.disabled {
            background: #f5f5f5;
            cursor: not-allowed;
        }

        &:not(:first-child){
            margin-top:8px;
        }

        .arrow {
            position:absolute;
            right:0;
            height:38px;
            line-height:38px;
            padding:0 12px;
            color:$primary;
            opacity:0.5;
            transition:opacity 0.1s ease, transform 0.1s ease;
            pointer-events: none;
        }

        .selected-option {
            height:38px;
            line-height:38px;
            width:100%;
            padding:0 35px 0 12px;
            overflow: hidden;
            word-break: break-all;
        }

        .group-title {
            padding:4px 10px;
            background:rgba(0,0,0,0.03);
            border-bottom:1px solid rgba(0,0,0,0.1);
            color:rgba(0,0,0,0.5);
            font-size:11px;
            font-weight: bold;
        }

        .options {
            position:absolute;
            top:36px;
            background:#fff;
            border:1px solid $mid-light-grey;
            border-bottom-right-radius:4px;
            border-bottom-left-radius:4px;
            left:-1px; right:-1px;
            box-shadow:0 8px 16px rgba(0,0,0,0.12);
            visibility:hidden;
            opacity:0;
            max-height:0;
            overflow:auto;
            z-index:2;

            .option {
                padding:12px;
                background:transparent;
                word-break: break-all;

                .subtitle {
                    display:block;
                    font-size: 9px;
                    color: $dark-grey;
                }

                img {
                    width:16px;
                    height:16px;
                    vertical-align: middle;
                    margin-right:5px;
                }

                &:not(:last-child){
                    border-bottom:1px solid $light-grey;
                }

                &:hover {
                    background:rgba(0,0,0,0.02);
                }
            }
        }

        &.open {
            border-bottom-right-radius:0;
            border-bottom-left-radius:0;
            border:1px solid rgba(0,0,0,0.22);

            .options {
                box-shadow:0 8px 8px rgba(0,0,0,0.08);
                visibility:visible;
                opacity:1;
                max-height:180px;

                &.long {
                    max-height:300px;
                }
            }

            .arrow {
                opacity:1;
                transform:rotateZ(-180deg) translateY(2px);
            }
        }

        &:hover {

            .arrow {
                opacity:1;
            }
        }

        $short-height:32px;
        &.short {
            height:$short-height;

            .arrow {
                height:$short-height;
                line-height:$short-height;
            }

            .selected-option {
                height:$short-height;
                line-height:$short-height;
                font-size:13px;
            }

            .options {
                top:30px;
            }
        }
    }
</style>