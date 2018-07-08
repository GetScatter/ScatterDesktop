<template>
    <section>

        <section class="panel display">
            <section class="head">
                <i class="fa fa-trash-o" @click="removeAllPermissions"></i>
            </section>

            <section class="selected-item scrollable" v-if="perms.length">

                <figure class="name">{{origin}}</figure>
                <figure class="description">
                    Permissions are blah blah blah
                </figure>



                <section class="split-panels left" v-if="identityPermission">
                    <section class="info-box">
                        <figure class="header">Identity / Account Permission</figure>

                        <tags :items="[identityPermission.getIdentity()]"
                              :parser="id => id.name"
                              v-on:clicked="removePermission(identityPermission)"></tags>

                        <tags :items="identityPermission.getAccounts()"
                              :parser="account => account.formatted()"
                              v-on:clicked="removePermission(identityPermission)"></tags>

                        <tags :items="identityRequirementPermissions"
                              :parser="x => JSON.stringify(x)"
                              v-on:clicked="removePermission"></tags>


                    </section>
                </section>

                <section class="split-panels">
                    <section class="info-box">
                        <figure class="header">Contract Permissions</figure>
                        <tags :items="contractPermissions" :parser="x => JSON.stringify(x)" v-on:clicked="removePermission"></tags>

                    </section>
                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    import Network from '../../models/Network'

    import {Popup} from '../../models/popups/Popup'
    import PopupService from '../../services/PopupService';

    import PluginRepository from '../../plugins/PluginRepository';

    let saveTimeout = null;

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'permissions',
            ]),
            identityPermission(){
                return this.perms.find(x => x.isIdentity);
            },
            contractPermissions(){
                return this.perms.filter(x => x.isContractAction);
            },
            identityRequirementPermissions(){
                return this.perms.filter(x => x.isIdentityRequirements);
            },
            perms(){
                return this.permissions.filter(x => x.origin === this.origin);
            }
        },
        mounted(){

        },
        methods: {
            async removeAllPermissions(){
                const scatter = this.scatter.clone();
                scatter.keychain.permissions = scatter.keychain.permissions.filter(x => x.origin !== this.origin);
                await this[Actions.SET_SCATTER](scatter);
                this.backToMenu();
            },
            async removePermission(permission){
                const scatter = this.scatter.clone();
                scatter.keychain.permissions = scatter.keychain.permissions.filter(x => x.checksum() !== permission.checksum());
                await this[Actions.SET_SCATTER](scatter);
                this.backToMenu();
            },
            backToMenu(){
                if(!this.perms.length) this.$emit('emptied');
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['origin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";


</style>