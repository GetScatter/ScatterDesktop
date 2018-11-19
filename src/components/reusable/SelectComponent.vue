<template>
    <section>
        <label v-if="label">{{label}}</label>

        <section class="select" :class="{'open':open, 'disabled':disabled}">
            <figure class="arrow">
                <i class="icon-down-open-big"></i>
            </figure>

            <figure class="selected-option" v-on:click="toggle">
                {{parse(selectedOption)}}
            </figure>

            <section class="options" :class="{'long':long}">
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
	    props:['placeholder', 'label', 'options', 'selected', 'prop', 'parser', 'subparser', 'disabled', 'imgParser', 'long'],

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
            parse(item){
                if(typeof item === 'string') return item;
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
    @import "../../_variables";

    label {
        font-size: 11px;
        color:#7899a6;
        font-weight: bold;
        margin-bottom:5px;
        display: block;

        &.error {
            color:$red;
            animation: blink 1s ease infinite;
        }
    }

    .select {
        cursor: pointer;
        height:44px;
        position: relative;
        width:100%;
        font-family:'Raleway',sans-serif;
        border-radius:4px;
        background:#fff;
        border:1px solid #dfe0e1;
        font-size: 16px;
        transition:background 0.1s ease;

        input {
            position: absolute;
            top:-100px;
            opacity:0;
        }

        &.disabled {
            background: #f5f5f5;
        }

        &:not(:first-child){
            margin-top:10px;
        }

        .arrow {
            position:absolute;
            right:0;
            height:44px;
            line-height:44px;
            padding:0 15px;
            color:$dark-blue;
            opacity:0.5;
            transition:opacity 0.1s ease, transform 0.1s ease;
            pointer-events: none;
        }

        .selected-option {
            height:44px;
            line-height:44px;
            width:100%;
            padding:0 35px 0 15px;
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
            top:42px;
            background:#fff;
            border:1px solid $mid-light-grey;
            border-bottom-right-radius:4px;
            border-bottom-left-radius:4px;
            left:-1px; right:-1px;
            box-shadow:0 8px 16px rgba(0,0,0,0.03);
            visibility:hidden;
            opacity:0;
            max-height:0;
            overflow:auto;
            z-index:2;

            .option {
                padding:15px;
                font-size: 16px;
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
    }
</style>