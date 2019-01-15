<template>
    <section>

        <PopinHead :popin="popin" :name="popin.data.props.title" />
        <section class="panel centered">

            <SearchBar class="search"
                       :placeholder="locale(langKeys.GENERIC.Search)"
                       v-on:terms="x => searchTerms = x" />

            <FlatList class="list" :items="items"
                      :selected="selected ? selected.id : null"
                      v-on:selected="returnResult" />

        </section>

    </section>
</template>

<script>
    import {RouteNames} from '../../../vue/Routing'
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../../../store/constants';
    import {PopupDisplayTypes} from '../../../models/popups/Popup'
    import PopinHead from "./PopinHead";
    import FlatList from "../../reusable/FlatList";
    import SearchBar from "../../reusable/SearchBar";

    export default {
	    components: {FlatList, PopinHead, SearchBar},
	    data(){ return {
            selected:null,
		    searchTerms:'',
        }},
        mounted(){

        },
        computed:{
            ...mapState([
                'popups'
            ]),
            ...mapGetters([

            ]),
            items(){
            	return this.popin.data.props.items
                    .filter(x => x.title ? x.title.toLowerCase().indexOf(this.searchTerms) > -1 : true || x.description ? x.description.toLowerCase().indexOf(this.searchTerms) > -1 : true);
            }
        },
        methods:{
	        returnResult(truthy){
		        this.popin.data.callback(truthy);
		        this[Actions.RELEASE_POPUP](this.popin);
	        },
            ...mapActions([
                Actions.RELEASE_POPUP
            ])
        },
        props:['popin']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../../../styles/variables";

    .description {
        font-size: 16px;
        text-align:center;
    }

    .list {
        height:calc(60vh);
        width:100%;
        overflow: auto;
        padding:0;
        padding-right:10px;
    }

    .search {
        margin-left:-60px;
        width:100%;
    }

</style>