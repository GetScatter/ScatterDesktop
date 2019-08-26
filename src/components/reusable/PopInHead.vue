<template>
    <section class="pop-in-head">
        <figure class="popin-title">{{title}}</figure>
        <figure class="popin-close" @click="$emit('close')">
            <i class="icon-cancel"></i>
        </figure>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as UIActions from "../../store/ui_actions";

    export default {
    	props:['title'],
        computed:{
            ...mapGetters([

            ])
        },
        methods:{
            returnResult(truthy){
                this.nextPopIn.data.callback(truthy);
                this[UIActions.RELEASE_POPUP](this.nextPopIn);
            },
            ...mapActions([
	            UIActions.RELEASE_POPUP
            ])
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../styles/variables";

    .pop-in-head {
        display:flex;
        width:100%;
        height:40px;
        justify-content: space-between;
        align-items: center;
        padding:0 10px 0 20px;
        border-bottom:1px solid $lightgrey;

        .popin-title {
            font-size: $small;
            font-weight: bold;
            color:$silver;
        }

        .popin-close {
            padding:5px 10px;
            cursor: pointer;
            color:$silver;
            border-radius:$radius;

            &:hover {
                background:$lightergrey;
            }
        }
    }

</style>