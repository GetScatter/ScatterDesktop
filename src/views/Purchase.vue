<template>
    <section class="purchase">

        <figure class="back" v-if="canShowBack" @click="back">
            <i class="icon-left-small"></i>
        </figure>

        <section v-if="state === STATES.AMOUNT">
            <figure class="title">How much do you want to buy?</figure>
            <figure class="subtitle">You can purchase up to $150 without having to go through KYC.</figure>

            <section class="amount">
                <Input :text="amount" v-on:changed="x => amount = x" centered="1" type="number" big="1" placeholder="$0.00" />
            </section>

            <Button @click.native="state = STATES.SELECT_CARD" text="Select a Card" big="1" blue="1" />
        </section>

        <section v-if="state === STATES.SELECT_CARD">
            <figure class="title">Select a Card</figure>
            <figure class="subtitle">You can purchase up to $150 without having to go through KYC.</figure>

            <section class="select-card" v-if="card">
                <Card as-selector="1" :card="card" />
            </section>

            <Button @click.native="state = STATES.SELECT_ACCOUNT" :text="`Use ${card.name}`" big="1" blue="1" />
        </section>

        <section v-if="state === STATES.SELECT_ACCOUNT && account && token">
            <figure class="title">Select a Token and Account</figure>
            <figure class="subtitle">This is the token you will get for your fiat currency.</figure>

            <section class="select-recipient">
                <section class="boxes">
                    <section class="box account-selector" @click="selectTokenAndAccount">
                        <section>
                            <figure class="name">{{account.sendable()}}</figure>
                            <figure class="network">{{account.network().name}}</figure>
                            <figure class="token">{{token.symbol}}</figure>
                            <figure class="price">{{token.fiatPrice()}}</figure>
                        </section>
                        <figure class="chevron icon-dot-3"></figure>
                    </section>
                </section>
            </section>

            <figure class="estimated-tokens">
                Estimated {{token.symbol}}: {{parseFloat(amount/token.fiatPrice(false)).toFixed(token.decimals)}}
            </figure>
            <br>
            <Button @click.native="purchase" :text="`Buy $${amount} of ${this.token.symbol}`" big="1" blue="1" />
        </section>

        <section v-if="state === STATES.WORKING">
            <figure class="title">Please Wait</figure>
            <figure class="subtitle">This can take a few minutes.</figure>

            <section class="spinner">
                <i class="icon-spin4 animate-spin"></i>
            </section>
        </section>

        <section v-if="state === STATES.COMPLETE">
            <figure class="icon font">
                <i class="icon-check"></i>
            </figure>
            <figure class="title">Success!</figure>
            <figure class="subtitle">You have purchased ${{amount}} worth of {{token.symbol}} for {{account.sendable()}}!</figure>

            <Button @click.native="state = STATES.AMOUNT" text="Buy Again" big="1" blue="1" />
        </section>

        <!--<section class="inputs">-->
            <!--<Input type="number" placehold="4444" label="Card Number" />-->
            <!--<section class="split-inputs">-->
                <!--<Input label="Expiration" />-->
                <!--<Input label="CVV" />-->
            <!--</section>-->
        <!--</section>-->

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '@walletpack/core/store/constants';
    import CreditCard from "@walletpack/core/models/CreditCard";
    import Card from "../components/misc/Card";
    import PopupService from "../services/utility/PopupService";
    import {Popup} from "../models/popups/Popup";
    // import PurchasingService from "../services/creditcards/PurchasingService";
    require('../styles/transfers.scss');

    const STATES = {
    	AMOUNT:'amount',
	    SELECT_CARD:'selectCard',
	    SELECT_ACCOUNT:'selectAccount',
	    WORKING:'working',
	    COMPLETE:'complete',
    };

    export default {
	    components: {Card},
	    data(){return {
		    STATES,
            state:STATES.AMOUNT,
            card:null,
		    account:null,
		    token:null,
		    amount:10,
        }},
        computed:{
            ...mapGetters([
            	'identities',
                'accounts',

            ]),
	        purchasableToken(){
		        return this.account.network().systemToken();
	        },
            canShowBack(){
            	return (this.state === STATES.SELECT_CARD || this.state === STATES.SELECT_ACCOUNT);

            }
        },
        mounted(){
	    	this.card = CreditCard.fromJson({
			    identityId:this.identities[0].id,
			    name:'Test Card',
			    lastFour:'1234',
			    expiration:'12/20',
			    cardHash:'asdljkfasjklhdfhaskljdfhjksalhfdjlhasljfhlhaksdflkj',
			    secure:{
			    	// Dummy Moonpay card
				    number:'4012001037490014',
				    cvx:'123',
                    authTokens:{},
                }
		    })
	        this.account = this.accounts.filter(x => x.tokens().length)
		        .sort((a,b) => b.totalFiatBalance() - a.totalFiatBalance())[0];
	        this.token = this.purchasableToken;
        },
        methods:{
	        back(){
                this.state = (() => {
	                switch(this.state){
		                case STATES.SELECT_CARD: return STATES.AMOUNT;
		                case STATES.SELECT_ACCOUNT: return STATES.SELECT_CARD;
                        default: return STATES.AMOUNT;
	                }
                })();
            },
	        selectTokenAndAccount(){
		        PopupService.push(Popup.selectAccount(account => {
			        if(!account) return;
			        this.account = account;
			        this.token = this.purchasableToken;
		        }))
	        },
            async purchase(){
	        	this.state = STATES.WORKING;

	        	// await PurchasingService.init();
                // const result = await PurchasingService.purchase(this.amount, this.token, this.account, this.card);
                // console.log('res', result);

	        	setTimeout(() => {
	        		this.state = STATES.SELECT_ACCOUNT;
                }, 2000);
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .purchase {
        display:flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height:$fullheight;
        text-align:center;
        width:100%;
        position: relative;

        .back {
            position:absolute;
            top:30px;
            left:30px;
            font-size: 48px;
            color:$grey;
            cursor: pointer;

            &:hover {
                color:$black;
            }
        }

        .icon {
            width:120px;
            height:120px;
            margin:0 auto;
            margin-bottom:30px;
            margin-top:-50px;

            &.font {
                width:90px;
                height:90px;
                font-size: 48px;
                box-shadow:0 1px 2px $blue-shadow, 0 8px 20px $blue-shadow;
                border-radius:50%;
                display:flex;
                justify-content: center;
                align-items: center;
                color:$blue;
                margin-bottom:20px;
            }
        }

        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom:10px;
        }

        .subtitle {
            font-size: $small;
            color:$silver;
            margin-bottom:30px;
        }

        .amount {
        }

        .select-card {
            width:400px;
            text-align:left;

            .card {
                width:100%;
            }
        }

        .select-recipient {
            width:500px;
            text-align:left;

            .box {
                width:100%;
            }
        }

        .estimated-tokens {
            font-size: $small;
            margin-top:10px;
            font-weight: bold;
            color:$blue;
        }

        .spinner {
            padding:30px;
            font-size: 64px;
        }
    }





</style>
