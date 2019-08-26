<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.DESTROY.Label)}}</label>

            <p>{{locale(langKeys.SETTINGS.DESTROY.Description)}}</p>

            <br><br>
            <section class="disclaimer red" style="margin-bottom:0;">
				<b>{{locale(langKeys.SETTINGS.DESTROY.Important)}}</b>
			</section>
            <br>
            <br>
            <Button :text="locale(langKeys.SETTINGS.DESTROY.Button)" red="true" @click.native="destroy" />
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import PopupService from '../../../services/utility/PopupService';
    import {Popup} from '../../../models/popups/Popup'

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'networks',
            ])
        },
        methods: {
            destroy(){
                PopupService.push(Popup.destroyScatter());
            },
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";


</style>
