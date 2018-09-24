<template>
    <section class="select" :class="{'open':open, 'disabled':disabled}">
        <figure class="arrow">
            <i class="fa fa-chevron-down"></i>
        </figure>

        <figure class="selected-option" v-on:click="toggle">
            {{parse(selectedOption)}}
        </figure>

        <section class="options">
            <input ref="terms" placeholder="Search..." v-model="optionsTerms" />
            <figure :class="isGrouped(item) ? 'group-title' : 'option'" v-for="item in filteredOptions" v-on:click="isGrouped(item) ? null : select(item)">
                <figure v-if="isGrouped(item) && !optionsTerms.length">{{item}}</figure>
                <section v-else>
                    <img v-if="imgParser" :src="imgParser(item)" />
                    {{parse(item)}}
                </section>

            </figure>
        </section>
    </section>
</template>

<script>
    export default {
        data(){ return {
            optionsTerms:'',
            selectedOption:this.selected || this.placeholder || this.options[0],
            open:false,
            groups:[],
        }},
        computed:{
            groupedOptions(){
                if(!this.grouper) return this.options;
                else {
                    this.groups = [];
                    let options = [];
                    this.options.map(x => {
                        const group = this.grouper(x);
                        if(!this.groups.includes(group)){
                            this.groups.push(group)
                            options.push(group);
                        }

                        options.push(x);
                    })
                    return options;
                }
            },
            filteredOptions(){
                return this.groupedOptions.filter(x => {
                    const parsed = this.parse(x);
                    return !parsed || parsed.toLowerCase().indexOf(this.optionsTerms.toLowerCase()) > -1
                });
            }
        },
        methods: {
            isGrouped(item){
                if(!item) return false;
                return this.groups.includes(item);
            },
            toggle(){
                if(this.disabled) return false;
                this.open = !this.open;

                if(this.open){
                    this.optionsTerms = '';
                    setTimeout(() => {
                        this.$refs.terms.focus()
                    }, 50);
                }
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
        props:['placeholder', 'options', 'selected', 'prop', 'parser', 'disabled', 'imgParser', 'grouper'],
        watch:{
            input(){ this.emit(); },
            text(){ this.input = this.text; },
            disabled(isDisabled){ if(isDisabled) this.open = false; },
            selected(){ this.selectedOption = this.selected; },
        }
    }
</script>

<style lang="scss">
    @import "../../_variables";
    .select {
        cursor: pointer;
        height:50px;
        position: relative;
        width:100%;
        font-family:'Raleway',sans-serif;
        font-size:14px;
        border:1px solid $mid-light-grey;
        border-radius:4px;
        background:#fff;
        transition:background 0.2s ease;

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
            height:50px;
            line-height:50px;
            padding:0 15px;
            color:$mid-dark-grey;
            opacity:0.3;
            transition:opacity 0.2s ease;
            pointer-events: none;
        }

        .selected-option {
            height:50px;
            line-height:50px;
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
            top:48px;
            background:#fff;
            border:1px solid $mid-light-grey;
            border-bottom-right-radius:4px;
            border-bottom-left-radius:4px;
            left:-1px; right:-1px;
            box-shadow:0 8px 16px $light-grey;
            visibility:hidden;
            opacity:0;
            max-height:0;
            overflow:auto;
            transition:all 0.2s ease, max-height 0.5s ease;
            transition-property: visibility, box-shadow, opacity, max-height;
            z-index:2;

            .option {
                padding:15px 10px;
                font-size:14px;
                background:transparent;
                transition:background 0.2s ease, padding 0.3s ease;
                word-break: break-all;

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
                    background:rgba(0,0,0,0.05);
                    padding-left:15px;
                }
            }
        }

        &.open {
            border-bottom-right-radius:0;
            border-bottom-left-radius:0;
            background:$light-grey;

            .options {
                box-shadow:0 8px 16px rgba(0,0,0,0.15);
                visibility:visible;
                opacity:1;
                max-height:180px;
            }

            .arrow {
                opacity:1;
            }
        }

        &:hover {

            .arrow {
                opacity:1;
            }
        }
    }
</style>