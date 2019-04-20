<template>
    <section>

        <section class="action-box top-pad">
            <label>{{locale(langKeys.SETTINGS.FIREWALL.ENABLED.Label)}}</label>
            <p>{{locale(langKeys.SETTINGS.FIREWALL.ENABLED.Description)}}</p>

            <section class="switch bottomed" @click="toggleFirewall">
                <figure class="dot" :class="{'disabled':!scatter.settings.firewall.enabled}"></figure>
            </section>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    export default {
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter',
            ]),
            ...mapGetters([

            ]),
        },
        methods: {
	        toggleFirewall(){
		        const scatter = this.scatter.clone();
		        scatter.settings.firewall.enabled = !scatter.settings.firewall.enabled;
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


    .line {
      width:100%;
      height:1px;
      background:rgba(0,0,0,0.1);
      margin-top:30px;
    }
</style>
