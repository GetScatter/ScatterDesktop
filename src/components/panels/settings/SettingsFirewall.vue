<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.FIREWALL.ENABLED.Label)}}</label>
            <p>{{locale(langKeys.SETTINGS.FIREWALL.ENABLED.Description)}}</p>

            <Switcher :state="scatter.settings.firewall.enabled" @click.native="toggleFirewall" />
        </section>

        <section class="action-box top-pad">
            <label>Restriction Contract Actions</label>
            <p>These actions will not be allowed from external applications.</p>
            <br>
            <br>

            <label>Add a new restricted action</label>
            <section class="split-inputs">
                <Select start-left="1" bordered="1"
                        :options="blockchains"
                        :parser="x => blockchainName(x)"
                        :selected="blockchain"
                        v-on:selected="x => blockchain = x" />
                <Input placeholder="Contract" :text="newContract" v-on:changed="x => newContract = x.trim().toLowerCase()" />
                <Input placeholder="Action" :text="newAction" v-on:changed="x => newAction = x.trim().toLowerCase()" />
            </section>
            <br>
            <Button blue="1" text="Add Restriction" @click.native="addBlacklistedAction" />
            <br>
            <br>
            <hr>
            <label>Blacklisted Actions</label>
            <br>
            <section class="blacklisted-actions">
                <section class="blacklist" v-for="(actions, contract) in blacklistActions">
                    <figure class="blockchain">{{blockchainName(contract.split('::')[0])}}</figure>
                    <figure class="contract">{{contract.split('::')[1]}}</figure>
                    <figure class="actions">
                        <figure class="action" v-for="action in actions">
                            <figure class="action-name">{{action}}</figure>
                            <Button @click.native="removeBlacklist(contract, action)" class="remove" text="remove" small="1" />
                        </figure>
                    </figure>
                </section>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import {Blockchains, BlockchainsArray} from "../../../models/Blockchains";

    export default {
        data () {return {
        	newContract:'',
            newAction:'',
	        blockchains:BlockchainsArray.map(x => x.value),
            blockchain:Blockchains.EOSIO,
        }},
        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([
                'blacklistActions',
            ]),
        },
        methods: {
	        toggleFirewall(){
		        const scatter = this.scatter.clone();
		        scatter.settings.firewall.enabled = !scatter.settings.firewall.enabled;
		        this[Actions.SET_SCATTER](scatter);
            },
            addBlacklistedAction(){
                const scatter = this.scatter.clone();
                scatter.settings.blacklistAction(this.blockchain, this.newContract, this.newAction);
                this[Actions.SET_SCATTER](scatter);
            },
            removeBlacklist(blockchainAndContract, action){
	        	const [blockchain, contract] = blockchainAndContract.split('::');
	            const scatter = this.scatter.clone();
	            scatter.settings.removeBlacklistedAction(blockchain, contract, action);
	            this[Actions.SET_SCATTER](scatter);
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .split-inputs {
        .input {
            margin-bottom:0;
        }
    }

    .blacklisted-actions {
        display:flex;
        flex-direction: column;


        .blacklist {
            padding:10px;
            border:1px solid $blue;
            border-radius:$radius;
            margin-bottom:10px;

            .blockchain {
                font-size: $small;
                padding:4px 8px;
                margin-right:10px;
                background:$blue;
                color:$white;
                border-radius:30px;
                display:inline-block;
            }

            .contract {
                padding-right:20px;
                display:inline-block;
                font-size: $medium;
                font-weight: bold;
            }

            .actions {
                margin-top:20px;
                display:flex;
                flex-direction: column;

                .action {
                    display:flex;
                    justify-content: space-between;
                    align-items: center;
                    padding:10px;
                    border:1px solid $lightgrey;
                    border-radius:$radius;
                    width:100%;
                    margin-bottom:5px;

                    &:last-child {
                        margin-bottom:0;
                    }

                    .action-name {

                    }

                    .remove {
                        margin-left:20px;
                    }
                }
            }


        }
    }

</style>
