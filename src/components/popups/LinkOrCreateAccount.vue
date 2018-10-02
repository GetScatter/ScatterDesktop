<template>
    <section class="link-or-create">
        <section class="head">
            <figure class="go-back" :class="{'hide':state === STATES.SELECTION}" v-tooltip="'Go Back'" @click="goBack">
                <i class="fa fa-times"></i>
            </figure>

            <figure class="title">Blockchain Account</figure>
            <figure class="description">You can either link an existing account that Scatter couldn't automatically import, or create a new one on top of this Key.</figure>
        </section>
        <section class="body">

            <transition name="slide-left" mode="out-in">
                <section key="selection" v-if="state === STATES.SELECTION">
                    <label>Available Blockchains</label>
                    <sel :selected="blockchainName(blockchain)"
                         :options="blockchainsWithAccounts"
                         :parser="b => blockchainName(b.value)"
                         v-on:changed="b => blockchain = b.value"></sel>

                    <section style="margin-top:20px;">
                        <section class="button" @click="state = STATES.CREATE">
                            <figure class="name">Create Account</figure>
                            <figure class="description">Click here to create a new account for the {{blockchainName(blockchain)}} blockchain.</figure>
                        </section>

                        <section class="button" @click="state = STATES.IMPORT">
                            <figure class="name">Import Account</figure>
                            <figure class="description">Click here to import an account that couldn't be imported automatically.</figure>
                        </section>
                    </section>
                </section>

                <!-- CREATE ACCOUNT -->
                <section key="create" v-if="state === STATES.CREATE">

                    <section style="margin-top:20px;">
                        <section class="button" @click="state = STATES.CREATE">
                            <figure class="name">Create Account</figure>
                            <figure class="description">Click here to create a new account for the {{blockchainName(blockchain)}} blockchain.</figure>
                        </section>

                        <section class="button" @click="state = STATES.IMPORT">
                            <figure class="name">Import Account</figure>
                            <figure class="description">Click here to import an account that couldn't be imported automatically.</figure>
                        </section>
                    </section>
                </section>

                <!-- IMPORT ACCOUNT -->
                <section key="create" v-if="state === STATES.IMPORT">

                    <section class="inputs">
                        <label>Account Name</label>
                        <input placeholder="What is the 12 character account name?" />
                    </section>

                    <br><br>

                    <label>Is it linked to an account instead of a Key?</label>
                    <sel :selected="subLinkedAccount"
                         :options="[null].concat(alreadyLinkedAccounts)"
                         :parser="x => x ? x.formatted() : 'Not linked to parent account.'"
                         v-on:changed="x => subLinkedAccount = x"></sel>
                </section>


            </transition>

        </section>
    </section>
</template>

<script>
    import {mapState, mapGetters} from 'vuex';
    import {Blockchains, BlockchainsArray, blockchainName} from '../../models/Blockchains';
    import PluginRepository from '../../plugins/PluginRepository';

    const STATES = {
        SELECTION:'selection',
        CREATE:'create',
        IMPORT:'import',
    };

    export default {
        data(){return {
            blockchain:null,
            blockchains:BlockchainsArray,
            state:STATES.SELECTION,
            STATES,

            subLinkedAccount:null,
        }},
        computed:{
            blockchainsWithAccounts(){
                return BlockchainsArray.filter(({value}) => {
                    return PluginRepository.plugin(value).accountsAreImported();
                })
            },
            keypair(){
                return this.nextPopIn.data.props.keypair;
            },
            alreadyLinkedAccounts(){
                return this.keypair.accounts().filter(x => x.blockchain() === Blockchains.EOSIO);
            },
        },
        mounted(){
            this.blockchain = this.blockchainsWithAccounts[0].value;
        },
        methods:{
            blockchainName,
            goBack(){

                if(this.state === STATES.CREATE) return this.state = STATES.SELECTION;
                if(this.state === STATES.IMPORT) return this.state = STATES.SELECTION;

            },
        },
        props:['nextPopIn'],
    }

</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .link-or-create {
        width:600px;
        height:calc(100vh - 100px);
        display: flex;
        flex-direction: column;
        overflow: hidden;


        .head {
            padding:60px 80px;
            text-align:center;
            position: relative;
            border-bottom:1px solid rgba(0,0,0,0.1);

            .title {
                font-size: 24px;
                margin-bottom:10px;
                font-weight: 800;
                color:$dark-grey;
            }

            .description {
                font-size: 14px;
                color:$dark-grey;
            }

            .go-back {
                position: absolute;
                opacity:1;
                left:20px;
                top:20px;
                visibility: visible;
                cursor: pointer;
                height:40px;
                padding:0 12px;
                display:flex;
                justify-content:center;
                align-items: center;
                border-radius:2px;
                font-size: 16px;

                background:transparent;
                border:1px solid rgba(0,0,0,0.2);
                color:rgba(0,0,0,0.3);

                transition: all 0.2s ease;
                transition-property: background, color, border, opacity, top, visibility;

                &:hover {
                    border:1px solid $light-blue;
                    background:$light-blue;
                    color:#fff;
                }

                i {
                    transition:transform 0.5s ease;
                    transition-delay: 0s;
                }

                &.hide {
                    opacity:0;
                    top:-20px;
                    visibility: hidden;
                }
            }
        }

        .body {
            width:100%;
            height:100%;
            padding:30px;
            display:flex;
            overflow-y:auto;
            overflow-x:hidden;

            > section {
                width:100%;
            }

            label {
                font-size: 11px;
                font-weight: bold;
                color:$mid-dark-grey;
            }

            .button {
                float:left;
                cursor: pointer;
                width:calc(50% - 10px);
                padding:20px 30px;
                background:#fff;
                text-align:center;
                border:1px solid rgba(0,0,0,0.1);
                box-shadow:0 1px 3px rgba(0,0,0,0.2), 0 4px 9px rgba(0,0,0,0.1);
                border-radius:4px;
                height:150px;
                display:flex;
                flex-direction: column;
                justify-content: center;
                align-items:center;

                transition:all 0.15s ease;
                transition-property: transform, box-shadow;

                &.wide {
                    width:100%;
                    margin-top:10px;
                    height:auto;
                }

                &:not(:last-child){
                    margin-bottom:20px;
                    margin-right:20px;
                }

                .name {
                    font-weight: bold;
                    color:$black;
                    font-size: 18px;
                    padding-bottom:10px;
                    border-bottom:1px solid rgba(0,0,0,0.1);
                    margin-bottom:10px;
                }

                .description {
                    font-size: 13px;
                    color:$dark-grey;
                }

                &:hover {
                    transform:translateY(-3px);
                    box-shadow:0 5px 8px rgba(0,0,0,0.1), 0 20px 8px -5px rgba(0,0,0,0.1);
                }

                &:active {
                    transform:translateY(0px);
                    box-shadow:0 1px 3px rgba(0,0,0,0.2), 0 4px 9px rgba(0,0,0,0.1);
                }
            }

            .inputs {
                width:100%;

                label {
                    font-size: 13px;
                    color:$dark-grey;
                }

                input {
                    width:100%;
                    border:0;
                    outline:0;
                    background:transparent;
                    border-bottom:1px dashed rgba(0,0,0,0.2);
                    font-size: 18px;
                    margin-top:10px;
                }
            }
        }
    }

</style>