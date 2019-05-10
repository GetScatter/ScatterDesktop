<template>
	<section class="identities">

		<section class="identity" v-if="clone">
			<section class="scroller">
				<section class="personal greyback">

					<section class="split-inputs">
						<Input :error="nameError"
						       :label="locale(langKeys.IDENTITY.NameLabel)"
						       :placeholder="locale(langKeys.IDENTITY.NamePlaceholder)"
						       :text="clone.name" v-on:changed="x => clone.name = x" />

						<Input :label="locale(langKeys.IDENTITY.PERSONAL.NameLabel)"
						       :placeholder="locale(langKeys.IDENTITY.PERSONAL.NamePlaceholder)"
						       :text="fullname" v-on:changed="x => fullname = x" />
					</section>

					<section class="split-inputs">
						<Input :label="locale(langKeys.IDENTITY.PERSONAL.DateOfBirthLabel)"
						       type="date" placeholder="MM/DD/YYYY" style="flex:0.4"
						       :text="clone.personal.birthdate"
						       v-on:changed="x => clone.personal.birthdate = x" />

						<Input :label="locale(langKeys.IDENTITY.PERSONAL.EmailLabel)" placeholder="support@get-scatter.com"
						       style="flex:1"
						       :text="clone.personal.email"
						       v-on:changed="x => clone.personal.email = x" />
					</section>
				</section>

				<section class="locations">
					<section class="location-list">
						<section class="head">
							{{locale(langKeys.IDENTITY.LOCATION.SelectorLabel)}}
							<Button text="Add Location" small="1" @click.native="addLocation" />
						</section>

						<section class="list" v-if="selectedLocation">
							<section class="badge-item hoverable" :class="{'active':selectedLocation.id === location.id}" v-for="location in clone.locations" @click="selectedLocation = location">
								<section class="details">
									<figure class="title">{{location.name}}</figure>

									<Button @click.native="removeLocation(location)"
									        v-if="selectedLocation.id !== location.id && clone.locations.length > 1"
									        icon="icon-trash" small="1" />

									<Button v-if="selectedLocation.id === location.id" blue="1" icon="icon-pencil" small="1" />
								</section>
							</section>
						</section>
					</section>

					<section class="selected-location" v-if="selectedLocation">
						<Input :label="locale(langKeys.IDENTITY.LOCATION.NameLabel)"
						       :placeholder="locale(langKeys.IDENTITY.LOCATION.NamePlaceholder)"
						       :text="selectedLocation.name"
						       v-on:changed="x => selectedLocation.name = x" />

						<section>
							<label>{{locale(langKeys.IDENTITY.LOCATION.CountryLabel)}}</label>
							<Select bordered="1" :label="locale(langKeys.IDENTITY.LOCATION.CountryLabel)"
							        :selected="selectedLocation.country" style="flex:3;"
							        :options="[null].concat(countries)"
							        :parser="x => x ? x.name : locale(langKeys.IDENTITY.LOCATION.CountryItemNone)"
							        v-on:selected="x => selectedLocation.country = x" />
						</section>

						<br>
						<Input label="Address" :text="selectedLocation.address" v-on:changed="x => selectedLocation.address = x" />

						<section class="split-inputs">
							<Input :label="locale(langKeys.IDENTITY.LOCATION.CityLabel)"
							       :placeholder="locale(langKeys.IDENTITY.LOCATION.CityPlaceholder)"
							       :text="selectedLocation.city"
							       v-on:changed="x => selectedLocation.city = x" />
							<Input :label="locale(langKeys.IDENTITY.LOCATION.StateLabel)"
							       :placeholder="locale(langKeys.IDENTITY.LOCATION.StatePlaceholder)"
							       :text="selectedLocation.state"
							       v-on:changed="x => selectedLocation.state = x" />
						</section>

						<Input :label="locale(langKeys.IDENTITY.LOCATION.PhoneLabel)"
						       placeholder="5555555555"
						       :text="selectedLocation.phone"
						       v-on:changed="x => selectedLocation.phone = x" />

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
			selectedLocation:null,
			clone:null,
			fullname:'',
			countries:Countries,
		}},
		computed:{
			...mapState([
				'scatter',
			]),
			...mapGetters([
				'identities'
			]),
			isValidName(){
				return this.clone && Identity.nameIsValid(this.clone.name);
			},
			nameExists(){
				return this.identities.find(x => x.id !== this.clone.id && x.name.toLowerCase() === this.clone.name.toLowerCase())
			},
			nameError(){
				if(!this.isValidName) return `This name is invalid.`;
				if(this.nameExists) return `This name exists.`;
				return false;
			},
			isValidLocationName(){
				return this.selectedLocation && this.selectedLocation.name.length;
			},
		},
		mounted(){
			this.selectIdentity(this.identities[0])
		},
		methods:{
			selectIdentity(identity){
				this.clone = identity.clone();
				this.fullname = [this.clone.personal.firstname, this.clone.personal.lastname].filter(x => x && x.length).join(' ');
				this.selectedLocation = this.clone.locations[0];
			},
			addLocation(){
				const location = LocationInformation.placeholder();
				location.name = `Location - ${IdGenerator.text(10)}`;
				this.clone.locations.push(location);
				this.selectedLocation = location;
			},
			removeLocation(location){
				this.clone.locations = this.clone.locations.filter(x => x.id !== location.id);
			},
			save(){
				const original = this.identities.find(x => x.id === this.clone.id);
				if(original && JSON.stringify(original) === JSON.stringify(this.clone)) return;
				if(!this.isValidName) return;
				if(this.nameExists) return;
				if(!this.isValidLocationName) return;
				const scatter = this.scatter.clone();
				scatter.keychain.updateOrPushIdentity(this.clone);
				this[Actions.SET_SCATTER](scatter);
			},

			...mapActions([
				Actions.SET_SCATTER,
			])
		},
		watch:{
			['fullname'](){
				if(!this.fullname.trim().length){
					this.clone.personal.firstname = '';
					this.clone.personal.lastname = '';
					return false;
				}
				const names = this.fullname.trim().split(' ');
				this.clone.personal.firstname = names.slice(0, names.length > 1 ? names.length-1 : 1).join(' ').trim();
				this.clone.personal.lastname = names.length > 1 ? names[names.length-1].trim() : '';
			},
			clone:{
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

	.identities {

		.scroller {
			flex:1;
			height:calc(100vh - 40px - 135px);
			overflow:auto;

		}

		.personal {

			.split-inputs {
				&:last-child {
					.input {
						margin-bottom:0;
					}
				}
			}
		}

		.locations {
			display:flex;
			height:calc(100% - 234px);

			.location-list {
				flex:1;
				border-right:1px solid $lightgrey;

				.head {
					flex:1;
					display:flex;
					align-items: center;
					padding:0 20px;
					font-size: $medium;
					font-weight: bold;
					height:60px;
					border-bottom:1px solid $lightgrey;
					justify-content: space-between;
				}

				.list {
					padding:20px;
					height:calc(100% - 60px);
					overflow-y:auto;

					.badge-item {
						.details {
							display:flex;
							flex-direction: row;
							justify-content: space-between;
							align-items: center;
						}
					}
				}
			}

			.selected-location {
				flex:1.5;
				padding:30px;
				height:100%;
				overflow-y:auto;
			}
		}
	}
</style>