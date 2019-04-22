<template>
    <section>
        <section style="padding:30px 0 100px;" v-if="ridlCycle && account">
            <section style="display:flex; margin-top:-10px;">
                <section style="flex:1;">
                    <h4>Getting RIDL Tokens</h4>
                    <span>
					            By donating to Scatter you can get RIDL tokens as a thank you.
					            Every 12 hours 170,000 RIDL is released to all donors. Depending on the amount you
					            donated vs. the total amount donated during that 12-hour period you get a portion of the 170,000 RIDL.
				            </span>
                    <br>
                    <br>
                    <b style="font-size: 11px; line-height:13px; font-weight: bold; color:red;">
                        RIDL tokens are purely for the purposes of applying reputations to various digital entities. They are <u>NOT</u> meant to be
                        a speculative asset and do not hold any investment value.
                        <br>
                        <br>
                        <u>RIDL tokens from donations are for mainnet only and will not be reflected on the testnets.</u>
                    </b>
                </section>
                <section style="flex:1; padding-left:50px;">

                    <section class="box">
                        <section class="row clickable" @click="selectAccount()">
                            <figure class="fill">
                                <div>{{account.network().name}}</div>
                                {{account.sendable()}}
                            </figure>
                            <figure class="chevron icon-down-open-big"></figure>
                        </section>
                    </section>
                    <br>

                    <cin label="Donation Amount"
                         placeholder="0.0000 EOS"
                         :text="buyRidlAmount" v-on:changed="x => buyRidlAmount = x" />

                    <btn blue="1" big="1" @click.native="donate"
                         text="Donate to Scatter" />

                    <div style="font-size: 11px; margin-top:20px; display:block;">
                        <div>Your total contributions for this cycle: <b>{{eosContributions}}</b></div>
                        You will get <b>{{ridlContributions}}</b> at <b>{{(new Date(ridlCycle.ends*1000)).toLocaleString()}}</b>
                    </div>
                </section>
            </section>
        </section>
    </section>
</template>

<script>
    import {mapState, mapGetters} from 'vuex';
    import RIDLService from "../../services/RIDLService";
    import {Blockchains} from "../../models/Blockchains";
    import {Popup} from "../../models/popups/Popup";
    import PluginRepository from "../../plugins/PluginRepository";
    import PopupService from "../../services/PopupService";
    import Account from "../../models/Account";

    export default {
        data(){return {
	        buyRidlAmount:null,
	        ridlCycle:null,
	        account:null,
        }},
        computed:{
	        ...mapState([
		        'scatter'
	        ]),
	        ...mapGetters([
		        'accounts',
		        'contacts',
		        'identities',
		        'networks',
	        ]),
	        mainnetAccounts(){
		        const network = this.networks.find(x => x.chainId === PluginRepository.plugin(Blockchains.EOSIO).getEndorsedNetwork().chainId);
		        return this.accounts.filter(x => x.networkUnique === network.unique());
	        },
	        contributions(){
		        if(!this.ridlCycle) return null;
		        const total = parseFloat(this.ridlCycle.data.tokens.split(' ')[0]);
		        const contri = this.ridlCycle.contributions.reduce((acc, x) => {
			        x.rows.map(row => {
				        if(row.cycle === this.ridlCycle.data.cycle){
					        acc += parseFloat(row.tokens.split(' ')[0]);
				        }
			        })

			        return acc;
		        }, 0);
		        return [parseFloat(contri || 0).toFixed(4), total];
	        },
	        ridlContributions(){
		        if(!this.ridlCycle) return null;
		        return parseFloat(this.contributions[0] / this.contributions[1] * 170000).toFixed(4) + ' RIDL';
	        },
	        eosContributions(){
		        if(!this.ridlCycle) return null;
		        return parseFloat(this.contributions[0]).toFixed(4) + ' EOS';
	        },
        },
        created(){
	        this.getRidlCycleData();

	        if(this.mainnetAccounts.length){
		        this.account = this.mainnetAccounts[0];
	        }
        },
        methods:{
	        async getRidlCycleData(){
		        const cycleData = await RIDLService.getCycleData();
		        if(!cycleData) return;

		        const started = 1531720800;
		        const cycle = cycleData.cycle;
		        const now = +new Date() / 1000;
		        const lastCycleStarted = started + (cycle * (3600 * 12));
		        const cycleEndsOn = lastCycleStarted + (12 * 3600);

		        const contributions = await RIDLService.getRidlContributions();
		        this.ridlCycle = {
			        data:cycleData,
			        contributions,
			        ends:cycleEndsOn
		        }
	        },
	        selectAccount(type){
		        const network = this.networks.find(x => x.chainId === PluginRepository.plugin(Blockchains.EOSIO).getEndorsedNetwork().chainId);
		        PopupService.push(Popup.selectAccount(account => {
			        if(!account) return;
			        this.account = account;
		        }, true, this.account || Account.fromJson({networkUnique:network.unique()}), Blockchains.EOSIO, true));
	        },
	        async donate(){
		        const donated = await RIDLService.donateToScatter(this.account, this.buyRidlAmount);
		        if(donated) setTimeout(() => {
			        this.getRidlCycleData();
		        }, 1000);
	        },
        }
    }
</script>

<style scoped lang="scss">
    @import "../../styles/variables";
    @import "../../styles/transfer";


</style>