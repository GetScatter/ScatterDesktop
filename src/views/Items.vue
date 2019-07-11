<template>
    <section class="marketplace">
        <webview class="webview" src="https://marketdemo.get-scatter.com/" />
    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from 'scatter-core/store/constants';



    export default {
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../styles/variables";

    .marketplace, .webview {
        height:$fullheight;
    }





</style>
