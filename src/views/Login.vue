<template>
    <section class="login">
        <figure class="bg"></figure>
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'

    import {Popup, PopupDisplayTypes, PopupData, PopupTypes} from '../models/popups/Popup'
    import PopupService from '../services/PopupService';
    import SocketService from '../services/SocketService';

    import Account from '../models/Account'
    import AppLink from '../models/AppLink'

    export default {
        name: 'Login',
        data () {return {

        }},
        computed:{
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'accounts',
                'networks',
            ])
        },
        mounted(){

//            SocketService.open(new AppLink('Browser', 12345))


//            setTimeout(() => {
//                const popup = Popup.popout({hi:'bye'}, res => console.log('Pop out callback'));
//                PopupService.push(popup)
//            }, 2000)

//            setTimeout(() => {
//                const popup = Popup.selector("Select Account", "Select a blockchain account that you wish to link to this Identity.",
//                    "link", this.accounts, account => account.formattedWithNetwork(this.networks), result => {
//                        console.log(result);
//                    });
//                PopupService.push(popup)
//            }, 2000)

//            setTimeout(() => {
//                const popup = Popup.prompt("Select Account", "Select a blockchain account that you wish to link to this Identity.",
//                    "link", "Press Me", result => {
//                        console.log(result);
//                    });
//                PopupService.push(popup)
//            }, 2000)
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../_variables.scss";

    .login {
        position: relative;
        height:100vh;
        width:100%;
        -webkit-app-region: drag;

        .bg {
            position:absolute;
            top:0; bottom:0; left:0; right:0;
            background:url(https://images.unsplash.com/photo-1478515463067-d20f52aace26?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=899a8459cffc394ab9d49544618503ff&auto=format&fit=crop&w=968&q=80);
            background-size:cover;
        }
    }

</style>
