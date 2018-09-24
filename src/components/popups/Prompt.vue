<template>
    <section>

        <section class="prompt" v-if="nextPopIn">
            <pop-in-head :next-pop-in="nextPopIn"></pop-in-head>
        </section>

    </section>
</template>

<script>
    import {RouteNames} from '../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';
    import {PopupDisplayTypes} from '../../models/popups/Popup'

    export default {
        data(){ return {

        }},
        mounted(){

        },
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([

            ])
        },
        methods:{
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        props:['nextPopIn']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .prompt {



    }

</style>