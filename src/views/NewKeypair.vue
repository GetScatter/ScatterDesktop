<template>
    <section>

        <back-bar v-on:back="back"></back-bar>

        <transition name="slide-left" mode="out-in">
            <section key="select" v-if="state === STATES.SELECT" class="panel-container">
                <h1>Add Keys</h1>

                <br>

                <section class="key-row" v-for="keyType in newKeyTypes">
                    <figure class="icon">
                        <span style="font-size: 9px;">icon</span>
                    </figure>

                    <section class="details">
                        <figure class="title">{{keyType.title}}</figure>
                        <p>{{keyType.description}}</p>
                    </section>

                    <figure class="action">
                        <btn :text="keyType.action" v-on:clicked="keyType.handler"></btn>
                    </figure>
                </section>
            </section>
        </transition>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames, Routing} from '../vue/Routing'

    const STATES = {
    	SELECT:'select',
    	CREATE:'create',
        CREATE_EOS:'createEos',
        IMPORT:'import',
    };

    export default {
        data () {return {
            newKeyTypes:[],
            state:STATES.SELECT,
	        STATES,
        }},
        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([
                'keypairs',
            ]),
        },
        mounted(){
	        this.newKeyTypes = [
		        {icon:'', title:'Create a new key', description:`We'll create a set of keys that you can use on any blockchain.`, action:'Create a Key', handler:() => this.state = STATES.CREATE},
		        {icon:'', title:'Import an existing key', description:'If you already have a key and want to import it into Scatter', action:'Import a Key', handler:() => this.state = STATES.IMPORT},
		        {icon:'', title:'Create a new EOS account', description:`We'll quickly generate two keys for you`, action:'Create account', handler:() => {
		            this.state = STATES.CREATE;
		            this.keyCount = 2;
                }},
	        ];

        },
        methods:{
	        back(){
	        	if(this.state !== STATES.SELECT) return this.state = STATES.SELECT;
	            this.$router.push({name:RouteNames.HOME});
            },
            ...mapActions([

            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables";

    .key-row {
        $icon-width:40px;
        $action-width:150px;
        display:flex;
        flex-direction: row;
        width:100%;
        position: relative;
        padding:25px 0;

        &:first-child { padding-top:0; }
        &:last-child { padding-bottom:0; }

        .icon {
            width:40px;
        }

        .details {
            width:calc(100% - 40px - 150px);

            .title {
                color:$light-blue;
                font-weight: bold;
            }

            p {
                font-size:11px;
            }
        }

        .action {
            width:150px;
        }

        &:not(:last-child){
            &:after {
                content:'';
                display:block;
                position:absolute;
                left:-70px;
                right:-70px;
                bottom:0;
                height:1px;
                background:rgba(0,0,0,0.1);
            }
        }
    }

</style>
