<template>
    <aside class="auth">
        <section>


            <section class="fader" :class="{'hide-all':leaving}">
                <section class="logo-container">
                    <figure class="grand-hotel logo">Scatter</figure>
                </section>

                <section class="inputs" v-if="isNewScatter">
                    <cin big="1" placeholder="Password" type="password" v-on:enter="create" :text="password" v-on:changed="changed => bind(changed, 'password')"></cin>
                    <cin style="margin-top:35px;" big="1" placeholder="Confirm Password" type="password" v-on:enter="create" :text="confirmPassword" v-on:changed="changed => bind(changed, 'confirmPassword')"></cin>
                    <btn class="dropped" v-on:clicked="create" text="Create new Scatter" full="true" large="true"></btn>
                    <btn text="Import from Backup" v-on:clicked="importBackup" full="true"></btn>
                </section>

                <section class="inputs" v-else>
                    <cin big="1" placeholder="Password" type="password" :text="password" v-on:enter="unlock" v-on:changed="changed => bind(changed, 'password')"></cin>
                    <btn v-on:clicked="unlock" text="Unlock Scatter" full="true" large="true"></btn>
                </section>
            </section>


        </section>
    </aside>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {RouteNames} from '../../vue/Routing'

    import SocketService from '../../services/SocketService'
    import BackupService, {getFileLocation} from '../../services/BackupService'
    import PasswordService from '../../services/PasswordService'
    import StorageService from '../../services/StorageService'
    import PopupService from "../../services/PopupService";
    import {Popup} from '../../models/popups/Popup'
    const fs = window.require('fs');

    export default {
        name: 'Auth',
        data () {return {
            password:'',
            confirmPassword:'',
            leaving:false,
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
            pushTo(route){
                this.$router.push({name:route});
            },
            async create(){
                if(!PasswordService.isValidPassword(this.password, this.confirmPassword)) return false;
                await this[Actions.CREATE_SCATTER](this.password);
                this.pushTo(RouteNames.ONBOARDING);
            },
            async unlock(){
                this.leaving = true;
                setTimeout(async () => {
                    await this[Actions.SET_SEED](this.password);
                    await this[Actions.LOAD_SCATTER]();

                    if(typeof this.scatter === 'object' && !this.scatter.isEncrypted()){
                        SocketService.initialize();
                        SocketService.open();

                        this.pushTo(RouteNames.HOME);
                    } else {
                        this.leaving = false;
                        PopupService.push(Popup.snackbar("Bad Password", "ban"))
                    }
                }, 400)
            },
            importBackup(){
                const file = getFileLocation()[0];
                if(!file) return;

                fs.readFile(file, 'utf-8', (err, data) => {
                    if(err) return alert("Could not read the backup file.");

                    const [obj, salt] = data.split('|SLT|');
                    if(!obj || !salt) return alert("Error parsing backup");

                    StorageService.setSalt(salt);
                    StorageService.setScatter(obj);
                    location.reload();
                });
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

    .fader {
        opacity:1;
        transition:opacity 0.4s ease;

        &.hide-all {
            opacity:0;
        }
    }

    .auth {
        width:100%;
        height:100vh;
        display:flex;
        justify-content: center;
        align-items: center;

        .logo-container {
            padding:0 80px 50px;
            text-align:center;

            .logo {
                font-size:140px;
                line-height:140px;
                color:$light-blue;

                animation: float 2s ease-out;
                animation-iteration-count: infinite;
            }



            .tagline {
                font-size:24px;
                color:rgba(0,0,0,0.2);
            }
        }

        .inputs {
            max-width:350px;
            margin:0 auto;

            .auth-text {
                font-size:13px;
            }

            .dropped {
                margin-top:30px;
            }
        }
    }

</style>
