<template>
    <section>
        <back-bar v-on:back="back"></back-bar>
        <section v-if="keypair">

            <section class="panel-container">
                <h1>Export "{{keypair.name}}"</h1>

                <section class="types">

                    <!-- EXPORT KEY -->
                    <section class="type">
                        <figure class="badge icon-attention"></figure>
                        <figure class="name">Key</figure>
                        <p>Export this Private Key as text</p>
                    </section>

                    <!-- EXPORT QR -->
                    <section class="type">
                        <figure class="badge icon-attention"></figure>
                        <figure class="name">QR</figure>
                        <p>Export this Private Key as an encrypted QR code</p>
                    </section>

                </section>
            </section>

        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'

    export default {
        data () {return {
	        keypair:null,
        }},

	    mounted(){
		    this.keypair = this.keypairs.find(x => x.id === this.$route.params.id);
		    if(!this.keypair) this.$router.push({name:RouteNames.HOME});
	    },

        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([
                'keypairs',
            ]),
        },

        methods:{
	        back(){
	            this.$router.push({name:RouteNames.KEYPAIR, params:{id:this.keypair.id}});
            },
            ...mapActions([

            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .panel-container {
        text-align: center;
        padding-top:70px;
    }

    .types {
        margin-top:100px;
        display:flex;
        flex-direction: row;
        justify-content: space-between;

        .type {
            width:calc(50% - 10px);
            background:#fff;
            border:1px solid #e8e8e8;
            border-radius:10px;
            padding:36px;
            position: relative;
            padding-top:65px;
            text-align: center;
            cursor: pointer;

            transition: all 0.15s ease;
            transition-property: background;

            &:last-child {
                margin-left:20px;
            }

            .badge {
                width:100px;
                height:100px;
                border-radius:50%;
                background:#fff;
                border:1px solid #e8e8e8;
                color:$dark-grey;
                font-size: 48px;
                display:flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                top:-50px;
                left:0;
                right:0;
                margin:0 auto;

                transition: all 0.15s ease;
                transition-property: background, color, border;
            }

            .name {
                font-size: 24px;
                color:$dark-blue;
                margin-bottom:5px;
            }

            p {
                font-size: 11px;
            }

            &:hover {
                background:rgba(0,0,0,0.02);

                .badge {
                    background:$dark-blue;
                    border:1px solid $dark-blue;
                    color:#fff;
                }
            }
        }
    }

</style>
