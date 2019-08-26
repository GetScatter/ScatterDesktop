<template>
    <section>

        <section class="snackbar" @click="close">
            <figure class="icon" v-if="item.icon">
                <i :class="`icon-${item.icon}`"></i>
            </figure>
            <figure class="message" :class="{'no-icon':!item.icon}">{{item.message}}</figure>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as UIActions from "../../../store/ui_actions";

    export default {
        computed:{
            item(){
                return this.popup.data.props;
            }
        },
        methods:{
            close(){
                this[UIActions.RELEASE_POPUP](this.popup)
            },
            ...mapActions([
	            UIActions.RELEASE_POPUP
            ])
        },
        props:['popup']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .snackbar {
        cursor: pointer;

        display:inline-block;

        margin-top:10px;

        background:$blue;

        color:white;
        padding:10px 0;
        border-radius:40px;
        border:1px solid $blue;
        text-align:left;

        .icon {
            display:inline-block;
            padding:0 10px;

            i {
                display:inline-block;
                height:30px;
                width:30px;
                line-height:30px;
                text-align:center;
                background:white;
                border-radius:50%;
                color:$dark-grey;
                font-size:16px;
                box-shadow:0 2px 3px rgba(0,0,0,0.2);
            }
        }

        .message {
            vertical-align: middle;
            display:inline-block;
            padding-right:20px;
            padding-bottom:3px;
            color:white;
            font-size:13px;
            font-weight: bold;

            &.no-icon {
                padding:0 20px;
            }

        }
    }

</style>