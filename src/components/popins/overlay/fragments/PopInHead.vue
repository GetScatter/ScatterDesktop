<template>
    <section class="pop-in-head">
        <section>
            <figure class="bubble-icon" :class="{'red':nextPopIn.data.props.icon === 'attention'}">
                <i :class="`icon-${nextPopIn.data.props.icon}`"></i>
            </figure>
        </section>
        <section :class="{'no-third':!nextPopIn.data.props.hasOwnProperty('buttonText')}">
            <figure class="title">{{nextPopIn.data.props.title}}</figure>
            <figure class="description">{{nextPopIn.data.props.description}}</figure>
        </section>
        <section v-if="nextPopIn.data.props.hasOwnProperty('buttonText')">
            <btn small="1" v-if="nextPopIn.data.props.hasOwnProperty('denyButtonText')" :text="nextPopIn.data.props.denyButtonText" red="1" v-on:clicked="returnResult(false)"></btn>
            <btn small="1" v-if="nextPopIn.data.props.buttonText.length" :text="nextPopIn.data.props.buttonText" :red="!nextPopIn.data.props.hasOwnProperty('denyButtonText')" v-on:clicked="returnResult(true)"></btn>
        </section>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../../store/constants';

    export default {
        computed:{
            ...mapGetters([
            ])
        },
        methods:{
            returnResult(truthy){
                this.nextPopIn.data.callback(truthy);
                this[Actions.RELEASE_POPUP](this.nextPopIn);
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        props:['nextPopIn']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../../styles/variables";

</style>