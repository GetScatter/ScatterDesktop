<template>
	<section class="center-panel">
		<h2>Select Backup Location</h2>
		<p>
			Scatter will create backups for your local data on your machine to make sure you always have an encrypted backup.
			Please select a location for these backups.
		</p>

		<br>

		<section style="display:flex; justify-content: center;">
			<LoginButton @click.native="setBackupLocation" on-white="1" primary="1" title="Select a Folder" description="Don't use external drives." />
		</section>

		<ActionBar :buttons-left="[{text:'Back', click:() => $emit('back')}]" />
	</section>
</template>

<script>
	import LoginButton from "./LoginButton";
	import BackupService from "../../services/utility/BackupService";

	export default {
		components: {LoginButton},
		methods:{
			async setBackupLocation(){
				if(await BackupService.setBackupLocation()) {
					this.$emit('next');
				}
			},
		}
	}
</script>

<style scoped lang="scss">

</style>