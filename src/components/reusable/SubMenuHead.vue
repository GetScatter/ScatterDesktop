<template>
    <section>
        <section class="head">
            <i v-tooltip="tooltip" class="fa fa-plus-square-o" @click="addNew"></i>
        </section>
    </section>
</template>


<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    export default {
        data () {return {

        }},
        computed:{

        },
        methods: {
            addNew(){
                this.$emit('new');
            },
            ...mapActions([
                Actions.SET_SCATTER
            ])
        },
        props:['tooltip']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";


</style>