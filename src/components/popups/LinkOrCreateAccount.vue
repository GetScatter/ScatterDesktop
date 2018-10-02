<template>
    <section class="link-or-create">
        <section class="head">
            <figure class="title">Blockchain Account</figure>
            <figure class="description">You can either link an existing account that Scatter couldn't automatically import, or create a new one on top of this Key.</figure>
        </section>
        <section class="body">
            <label>Available Blockchains</label>
            <sel :selected="blockchainName(blockchain)"
                 :options="blockchainsWithAccounts"
                 :parser="b => blockchainName(b.value)"
                 v-on:changed="b => blockchain = b.value"></sel>

            <section style="margin-top:20px;">
                <section class="button">
                    <figure class="name">Create Account</figure>
                    <figure class="description">Click here to create a new account for the {{blockchainName(blockchain)}} blockchain.</figure>
                </section>

                <section class="button">
                    <figure class="name">Import Account</figure>
                    <figure class="description">Click here to import an account that couldn't be imported automatically.</figure>
                </section>
            </section>
        </section>
    </section>
</template>

<script>
    import {mapState, mapGetters} from 'vuex';
    import {Blockchains, BlockchainsArray, blockchainName} from '../../models/Blockchains';
    import PluginRepository from '../../plugins/PluginRepository';

    export default {
        data(){return {
            blockchain:null,
            blockchains:BlockchainsArray,
        }},
        computed:{
            blockchainsWithAccounts(){
                return BlockchainsArray.filter(({value}) => {
                    return PluginRepository.plugin(value).accountsAreImported();
                })
            },
            keypair(){
                return this.nextPopIn.data.props.keypair;
            }
        },
        mounted(){
            this.blockchain = this.blockchainsWithAccounts[0].value;
        },
        methods:{
            blockchainName,
        },
        props:['nextPopIn'],
    }

</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .link-or-create {
        width:600px;
        display: flex;
        flex-direction: column;
        overflow: hidden;


        .head {
            padding:30px 60px;
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
        }

        .body {
            padding:30px;

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
        }
    }

</style>