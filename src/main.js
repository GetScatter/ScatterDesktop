import 'typeface-roboto'
import 'typeface-grand-hotel'
import './styles.scss'

import VueInitializer from './vue/VueInitializer';
import {Routing} from './vue/Routing';
import * as Actions from './store/constants'
import {RouteNames} from './vue/Routing'




// Globals
import ViewBase from './components/ViewBase.vue'
import MainMenu from './components/sidebars/MainMenu.vue'
import Auth from './components/sidebars/Auth.vue'

// Panels
import Identity from './components/panels/Identity.vue'
import Keypair from './components/panels/Keypair.vue'
import Network from './components/panels/Network.vue'
import Transfer from './components/panels/Transfer.vue'
import NothingHere from './components/panels/NothingHere.vue'
import Terms from './components/panels/Terms.vue'
import OriginPermissions from './components/panels/OriginPermissions.vue'
import SettingsLanguage from './components/panels/SettingsLanguage.vue'
import SettingsExplorer from './components/panels/SettingsExplorer.vue'
import SettingsBackup from './components/panels/SettingsBackup.vue'
import SettingsDestroy from './components/panels/SettingsDestroy.vue'
import SettingsPassword from './components/panels/SettingsPassword.vue'

// POPUPS
import Popups from './components/Popups.vue'
import Mnemonic from './components/popups/Mnemonic.vue'
import TransactionSuccess from './components/popups/TransactionSuccess.vue'
import Prompt from './components/popups/Prompt.vue'
import Selector from './components/popups/Selector.vue'
import Snackbar from './components/popups/Snackbar.vue'
import TextPrompt from './components/popups/TextPrompt.vue'
import DelegateResources from './components/popups/DelegateResources.vue'
import BuySellRAM from './components/popups/BuySellRAM.vue'
import PopInHead from './components/popups/fragments/PopInHead.vue'

// POP OUTS
import GetIdentity from './views/popouts/GetIdentity.vue'
import SignatureRequest from './views/popouts/SignatureRequest.vue'
import SuggestNetwork from './views/popouts/SuggestNetwork.vue'

// Reusable components
import InputComponent from './components/reusable/InputComponent.vue'
import ButtonComponent from './components/reusable/ButtonComponent.vue'
import TagsComponent from './components/reusable/TagsComponent.vue'
import SelectComponent from './components/reusable/SelectComponent.vue'
import SubMenuHead from './components/reusable/SubMenuHead.vue'
import MenuSearch from './components/reusable/MenuSearch.vue'
import SwitchComponent from './components/reusable/SwitchComponent.vue'
import PercentageBarComponent from './components/reusable/PercentageBarComponent.vue'


import SocketService from './services/SocketService'
import {Popup} from './models/popups/Popup';
import PopupService from './services/PopupService';
import MnemonicUtil from './util/Mnemonic'

const {remote, BrowserWindow} = window.require('electron');
const app = remote.app;
console.log(app.getPath('userData'));

class Main {

    constructor(){


        const components = [
            // REUSABLE
            {tag:'cin', vue:InputComponent},
            {tag:'btn', vue:ButtonComponent},
            {tag:'tags', vue:TagsComponent},
            {tag:'sel', vue:SelectComponent},
            {tag:'sub-menu-head', vue:SubMenuHead},
            {tag:'menu-search', vue:MenuSearch},
            {tag:'swch', vue:SwitchComponent},
            {tag:'p-bar', vue:PercentageBarComponent},

            // PANELS
            {tag:'identity', vue:Identity},
            {tag:'keypair', vue:Keypair},
            {tag:'network', vue:Network},
            {tag:'transfer', vue:Transfer},
            {tag:'terms', vue:Terms},
            {tag:'nothing-here', vue:NothingHere},
            {tag:'origin-perms', vue:OriginPermissions},
            {tag:'settings-language', vue:SettingsLanguage},
            {tag:'settings-backup', vue:SettingsBackup},
            {tag:'settings-destroy', vue:SettingsDestroy},
            {tag:'settings-explorer', vue:SettingsExplorer},
            {tag:'settings-password', vue:SettingsPassword},

            // POPUPS
            {tag:'popups', vue:Popups},
            {tag:'prompt', vue:Prompt},
            {tag:'mnemonic', vue:Mnemonic},
            {tag:'text-prompt', vue:TextPrompt},
            {tag:'selector', vue:Selector},
            {tag:'snackbar', vue:Snackbar},
            {tag:'tx-success', vue:TransactionSuccess},
            {tag:'buy-sell-ram', vue:BuySellRAM},
            {tag:'delegate-resources', vue:DelegateResources},
            {tag:'pop-in-head', vue:PopInHead},

            // POP OUTS
            {tag:'get-identity', vue:GetIdentity},
            {tag:'signature-request', vue:SignatureRequest},
            {tag:'suggest-network', vue:SuggestNetwork},

            // GLOBALS
            {tag:'view-base', vue:ViewBase},
            {tag:'auth', vue:Auth},
            {tag:'main-menu', vue:MainMenu},
        ];

        const routes = Routing.routes();

        const middleware = (to, next, store) => {
            if(Routing.isRestricted(to.name))
                store.getters.unlocked ? next() : next({name:RouteNames.LOGIN});
            else next();
        };

        new VueInitializer(routes, components, middleware, async (router, store) => {



        });



        // window.eval = global.eval = () => {
        //     // throw new Error(`Sorry, this app does not support window.eval().`)
        // }
    }

}

new Main();
