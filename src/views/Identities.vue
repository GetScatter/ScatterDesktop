<template>
	<section class="identities">

		<section class="identity" v-if="clone">
			<section class="scroller">
				<section class="personal greyback">

					<section class="split-inputs">
						<Input :error="nameError" placeholder="ScatterUser1234" label="Username" :text="clone.name" v-on:changed="x => clone.name = x" />
						<Input label="Full name" placeholder="Nicolaus Copernicus" :text="fullname" v-on:changed="x => fullname = x" />
					</section>

					<section class="split-inputs">
						<Input label="Birthday" placeholder="DD/MM/YYYY" style="flex:0.4" />
						<Input label="Email" placeholder="support@get-scatter.com"
						       style="flex:1"
						       :text="clone.personal.email"
						       v-on:changed="x => clone.personal.email = x" />
					</section>
				</section>

				<section class="locations">
					<section class="location-list">
						<section class="head">
							Locations
							<Button text="Add Location" small="1" @click.native="addLocation" />
						</section>

						<section class="list" v-if="selectedLocation">
							<section class="badge-item hoverable" :class="{'active':selectedLocation.id === location.id}" v-for="location in clone.locations" @click="selectedLocation = location">
								<section class="details">
									<figure class="title">{{location.name}}</figure>
									<Button @click.native="removeLocation(location)" v-if="selectedLocation.id !== location.id && clone.locations.length > 1"
									        icon="icon-trash" small="1" />
									<Button v-if="selectedLocation.id === location.id" blue="1" icon="icon-pencil" small="1" />
								</section>
							</section>
						</section>
					</section>

					<section class="selected-location" v-if="selectedLocation">
						<Input label="Location Name" :text="selectedLocation.name" v-on:changed="x => selectedLocation.name = x" />
						<Input label="Address" :text="selectedLocation.address" v-on:changed="x => selectedLocation.address = x" />
						<Input label="Phone Number" :text="selectedLocation.phone" v-on:changed="x => selectedLocation.phone = x" />
						<Input label="Country" :text="selectedLocation.country" v-on:changed="x => selectedLocation.country = x" />
					</section>
				</section>
			</section>

			<section class="tail">
				<Button blue="1" text="Save Identity" />
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

	let saveTimeout;
	export default {
		data(){return {
			selectedLocation:null,
			clone:null,
			fullname:'',
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
					console.log('saving')
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
			height:calc(100vh - 40px - 135px - 70px);
			overflow:auto;

		}

		.tail {
			flex:1;
			display:flex;
			align-items: center;
			padding:0 20px;
			height:70px;
			border-top:1px solid $lightgrey;
			justify-content: flex-end;

			button {

			}
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