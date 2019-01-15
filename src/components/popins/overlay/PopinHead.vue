<template>
    <section class="pop-in-head">
        <figure class="name">{{name}}</figure>
        <figure class="closer icon-cancel" @click="close"></figure>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';

    export default {
        computed:{
            ...mapGetters([
            ])
        },
        methods:{
            close(){
                this.popin.data.callback(null);
                this[Actions.RELEASE_POPUP](this.popin);
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        props:['popin', 'name']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .pop-in-head {
        width:100%;
        padding:10px;
        display:flex;
        justify-content: space-between;
        align-items: center;
        background:$primary;
        border-bottom:1px solid $primary;

        .name {
            flex:1;
            padding-left:10px;
            font-size: 14px;
            font-weight: bold;
            color:#fff;
            display:flex;
            align-items: center;
        }

        .closer {
            cursor: pointer;
            font-size: 13px;
            padding:5px 3px;
            background:rgba(255,255,255,0.3);
            box-shadow:0 2px 4px rgba(0,0,0,0.05);
            color:$primary;
            border-radius:4px;

            &:hover {
                color:$primary;
                background:rgba(255,255,255,0.8);
            }

            &:active {
                background:rgba(255,255,255,0.5);
                color:$primary;
            }
        }
    }

</style>