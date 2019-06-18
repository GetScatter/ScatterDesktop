<template>
	<section>
		<section class="blockchain-list-container">



			<!-------------------------->
			<!------ BLOCKCHAINS ------->
			<!-------------------------->
			<section class="blockchains" v-if="locations.length > 1">
				<section class="head with-button">
					<figure>Locations</figure>
					<Button small="1" text="Add" @click.native="addLocation" />
				</section>
				<section class="scroller">
					<section class="blockchain-list">
						<section class="badge-item hoverable" :class="{'active':location && location.id === loc.id}" v-for="loc in locations" @click="selectLocation(loc)">
							<figure class="badge iconed small icon-globe"></figure>
							<section class="details">
								<figure class="title">{{loc.name}}</figure>
							</section>
						</section>
					</section>
				</section>
			</section>

			<!-------------------------->
			<!------- NETWORKS --------->
			<!-------------------------->
			<section class="list-container">
				<section class="head with-button">
					<figure></figure>
					<Button small="1" text="Remove" v-if="location && locations.length > 1" @click.native="removeLocation" />
					<Button small="1" text="Add new Location" @click.native="addLocation" v-if="locations.length === 1" />
				</section>
				<section class="scroller location" v-if="location">
					<section class="limit-800">
						<figure class="section-title">{{locale(langKeys.IDENTITY.LOCATION.NameLabel)}}</figure>
						<Input big="1"
						       :placeholder="locale(langKeys.IDENTITY.LOCATION.NamePlaceholder)"
						       :text="location.name"
						       v-on:changed="x => location.name = x" />

						<br>
						<br>

						<figure class="section-title">{{locale(langKeys.IDENTITY.LOCATION.CountryLabel)}}</figure>
						<Select bordered="1" :label="locale(langKeys.IDENTITY.LOCATION.CountryLabel)"
						        :selected="location.country" style="flex:3;"
						        :options="[null].concat(countries)"
						        :parser="x => x ? x.name : locale(langKeys.IDENTITY.LOCATION.CountryItemNone)"
						        v-on:selected="x => location.country = x" />

						<br>
						<br>
						<br>
						<figure class="section-title">{{locale(langKeys.IDENTITY.LOCATION.AddressLabel)}}</figure>
						<Input :text="location.address" v-on:changed="x => location.address = x" />

						<section class="split-inputs">
							<Input :label="locale(langKeys.IDENTITY.LOCATION.CityLabel)"
							       :placeholder="locale(langKeys.IDENTITY.LOCATION.CityPlaceholder)"
							       :text="location.city"
							       v-on:changed="x => location.city = x" />
							<Input :label="locale(langKeys.IDENTITY.LOCATION.StateLabel)"
							       :placeholder="locale(langKeys.IDENTITY.LOCATION.StatePlaceholder)"
							       :text="location.state"
							       v-on:changed="x => location.state = x" />
						</section>

						<Input :label="locale(langKeys.IDENTITY.LOCATION.PhoneLabel)"
						       placeholder="5555555555"
						       :text="location.phone"
						       v-on:changed="x => location.phone = x" />
					</section>
				</section>
			</section>








		</section>
	</section>
</template>

<script>
	import {mapGetters, mapActions, mapState} from 'vuex';
	import * as Actions from '../store/constants'
	import {LocationInformation} from "../models/Identity";
	import IdGenerator from "../util/IdGenerator";
	import {Popup} from "../models/popups/Popup";
	import PopupService from "../services/utility/PopupService";
	import Identity from "../models/Identity";
	import {Countries} from '../data/Countries'

	let saveTimeout;
	export default {
		data(){return {
			location:null,
			countries:Countries,
		}},
		computed:{
			...mapState([
				'scatter',
			]),
			...mapGetters([
				'locations'
			]),
			isValidName(){
				return this.location.name.length;
			},
			nameExists(){
				return this.locations.find(x => x.id !== this.location.id && x.name.toLowerCase() === this.location.name.toLowerCase())
			},
		},
		mounted(){
			if(!this.locations.length) this.addLocation();
			else this.selectLocation(this.locations[0]);
		},
		methods:{
			selectLocation(location){
				this.location = location.clone();
			},
			addLocation(){
				const scatter = this.scatter.clone();
				const location = LocationInformation.placeholder();
				location.name = `New Location - ${new Date().toLocaleString()}`;
				scatter.keychain.updateOrPushLocation(location);
				this[Actions.SET_SCATTER](scatter);
				this.location = location.clone();
			},
			removeLocation(){
				const location = this.location.clone();
				this.selectLocation(this.locations.find(x => x.id !== location.id));
				const scatter = this.scatter.clone();
				scatter.keychain.removeLocation(location);
				this[Actions.SET_SCATTER](scatter);
			},
			save(){
				const original = this.locations.find(x => x.id === this.location.id);
				if(original && JSON.stringify(original) === JSON.stringify(this.location)) return;
				if(!this.isValidName) return;
				if(this.nameExists) return;
				const scatter = this.scatter.clone();
				scatter.keychain.updateOrPushLocation(this.location);
				this[Actions.SET_SCATTER](scatter);
			},
			...mapActions([
				Actions.SET_SCATTER,
			]),
		},
		watch:{
			location:{
				handler(){
					clearTimeout(saveTimeout);
					saveTimeout = setTimeout(() => {
						this.save();
					}, 500);
				},
				deep:true,
			},
		}
	}
</script>

<style scoped lang="scss">
	@import "../styles/variables";

	.location {
		padding:45px;
	}

</style>