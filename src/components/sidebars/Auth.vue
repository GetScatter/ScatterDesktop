<template>
    <aside class="auth">
        <section class="panel">

            <section class="logo-container">
                <figure class="grand-hotel logo">Scatter</figure>
                <figure class="tagline">Discovering infinite possibilities</figure>
            </section>

            <section class="inputs" v-if="isNewScatter">
                <cin placeholder="Password" type="password" :text="password" v-on:changed="changed => bind(changed, 'password')"></cin>
                <cin placeholder="Confirm Password" type="password" :text="confirmPassword" v-on:changed="changed => bind(changed, 'confirmPassword')"></cin>
                <btn class="dropped" v-on:clicked="create" text="Create new Scatter" full="true" large="true"></btn>
                <btn v-on:clicked="create" text="Import from Backup" full="true"></btn>
            </section>

            <section class="inputs" v-else>
                <cin placeholder="Password" type="password" :text="password" v-on:changed="changed => bind(changed, 'password')"></cin>
                <btn v-on:clicked="unlock" text="Unlock Scatter" full="true" large="true"></btn>
            </section>


        </section>
    </aside>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {RouteNames} from '../../vue/Routing'

    import SocketService from '../../services/SocketService'
    import PasswordService from '../../services/PasswordService'

    export default {
        name: 'Auth',
        data () {return {
            password:'',
            confirmPassword:'',
        }},
        computed: {
            isNewScatter(){
                return this.scatter === null;
            },
            ...mapState([
                'scatter'
            ])
        },
        mounted(){
            this.password = '';
            this.confirmPassword = '';
        },
        methods:{
            async create(){
                if(!PasswordService.isValidPassword(this.password, this.confirmPassword)) return false;
                await this[Actions.CREATE_SCATTER](this.password);
                this.$router.push({name:RouteNames.IDENTITIES});
            },
            async unlock(){
                await this[Actions.SET_SEED](this.password);
                await this[Actions.LOAD_SCATTER]();
                if(!this.scatter.isEncrypted()){
                    SocketService.initialize();
                    SocketService.openAllDefaults();
                    this.$router.push({name:RouteNames.IDENTITIES});
                }
            },
            ...mapActions([
                Actions.SET_SEED,
                Actions.CREATE_SCATTER,
                Actions.LOAD_SCATTER
            ])
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .auth {
        width:450px;
        float:left;

        .logo-container {
            padding:120px 80px;

            .logo {
                font-size:68px;
                line-height:60px;
                color:$light-blue;
            }

            .tagline {
                font-size:13px;
                color:$mid-dark-grey;
            }
        }

        .inputs {
            padding:0 80px;

            .auth-text {
                font-size:13px;
            }

            .dropped {
                margin-top:30px;
            }
        }
    }

</style>
