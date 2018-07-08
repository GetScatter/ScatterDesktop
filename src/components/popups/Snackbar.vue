<template>
    <section>

        <section class="snackbar" @click="close">
            <figure class="icon" v-if="item.icon">
                <i class="fa" :class="`fa-${item.icon}`"></i>
            </figure>
            <figure class="message" :class="{'no-icon':!item.icon}">{{item.message}}</figure>
        </section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../store/constants';

    export default {
        computed:{
            item(){
                return this.popup.data.props;
            }
        },
        methods:{
            close(){
                this[Actions.RELEASE_POPUP](this.popup)
            },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        props:['popup']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../_variables";

    .snackbar {
        cursor: pointer;

        display:inline-block;

        margin-top:10px;
        background:#fff;
        padding:10px 0;
        border-radius:4px;
        box-shadow:0 2px 8px rgba(0,0,0,0.2), 0 10px 50px rgba(0,0,0,0.1), 0 0 250px rgba(0,0,0,0.1);
        border:1px solid $medium-grey;
        text-align:left;

        .icon {
            display:inline-block;
            padding:0 20px;

            i {
                display:inline-block;
                height:30px;
                width:30px;
                line-height:30px;
                text-align:center;
                background:$medium-grey;
                border-radius:50%;
                color:#fff;
                font-size:16px;
            }
        }

        .message {
            vertical-align: middle;
            display:inline-block;
            padding-right:20px;
            color:$dark-grey;
            font-size:13px;

            &.no-icon {
                padding:0 20px;
            }

        }
    }

</style>