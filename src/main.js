import 'typeface-roboto'
import 'typeface-grand-hotel'
import './styles.scss'
import './tour.scss';

import VueInitializer from './vue/VueInitializer';
import {Routing} from './vue/Routing';
import * as Actions from './store/constants'
import {RouteNames} from './vue/Routing'
import { QrcodeReader } from 'vue-qrcode-reader'
import RadialProgressBar from 'vue-radial-progress'
import WindowService from './services/WindowService';
import ElectronHelpers from './util/ElectronHelpers';

ElectronHelpers.bindContextMenu();


// Globals
import ViewBase from './components/ViewBase.vue'
import Auth from './components/sidebars/Auth.vue'

// Panels
import Terms from './components/panels/Terms.vue'
import SettingsLanguage from './components/panels/SettingsLanguage.vue'
import SettingsExplorer from './components/panels/SettingsExplorer.vue'
import SettingsNetworks from './components/panels/SettingsNetworks.vue'
import SettingsBackup from './components/panels/SettingsBackup.vue'
import SettingsDestroy from './components/panels/SettingsDestroy.vue'
import SettingsPassword from './components/panels/SettingsPassword.vue'
import SettingsPIN from './components/panels/SettingsPIN.vue'
import SettingsNonce from './components/panels/SettingsNonce.vue'


import Overhead from './components/panels/Overhead.vue'

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
import RegisterWithRIDL from './components/popups/RegisterWithRIDL.vue'
import PopInHead from './components/popups/fragments/PopInHead.vue'
import Vault from './components/popups/Vault.vue'
import LinkOrCreateAccount from './components/popups/LinkOrCreateAccount.vue'

// POP OUTS
import GetIdentity from './views/popouts/GetIdentity.vue'
import SignatureRequest from './views/popouts/SignatureRequest.vue'
import SuggestNetwork from './views/popouts/SuggestNetwork.vue'
import LinkApp from './views/popouts/LinkApp.vue'
import GetPublicKey from './views/popouts/GetPublicKey.vue'
import LinkAccount from './views/popouts/LinkAccount.vue'
import TransferRequest from './views/popouts/TransferRequest.vue'

// Reusable components
import InputComponent from './components/reusable/InputComponent.vue'
import ButtonComponent from './components/reusable/ButtonComponent.vue'
import TagsComponent from './components/reusable/TagsComponent.vue'
import SelectComponent from './components/reusable/SelectComponent.vue'
import SubMenuHead from './components/reusable/SubMenuHead.vue'
import MenuSearch from './components/reusable/MenuSearch.vue'
import SwitchComponent from './components/reusable/SwitchComponent.vue'
import SliderComponent from './components/reusable/SliderComponent.vue'
import PercentageBarComponent from './components/reusable/PercentageBarComponent.vue'

const {remote} = window.require('electron');
const app = remote.app;
console.log(app.getPath('userData'));

// f12 to open console from anywhere.
document.addEventListener("keydown", function (e) {
    if (e.which === 123) WindowService.openTools();
});

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
            {tag:'slider', vue:SliderComponent},
            {tag:'qr-reader', vue:QrcodeReader},
            {tag:'radial-progress', vue:RadialProgressBar},

            // PANELS
            {tag:'settings-language', vue:SettingsLanguage},
            {tag:'settings-backup', vue:SettingsBackup},
            {tag:'settings-networks', vue:SettingsNetworks},
            {tag:'settings-destroy', vue:SettingsDestroy},
            {tag:'settings-explorer', vue:SettingsExplorer},
            {tag:'settings-password', vue:SettingsPassword},
            {tag:'settings-nonce', vue:SettingsNonce},
            {tag:'settings-pin', vue:SettingsPIN},
            {tag:'overhead', vue:Overhead},
            {tag:'terms', vue:Terms},

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
            {tag:'ridl-register', vue:RegisterWithRIDL},
            {tag:'pop-in-head', vue:PopInHead},
            {tag:'vault', vue:Vault},
            {tag:'link-or-create-account', vue:LinkOrCreateAccount},

            // POP OUTS
            {tag:'get-identity', vue:GetIdentity},
            {tag:'signature-request', vue:SignatureRequest},
            {tag:'suggest-network', vue:SuggestNetwork},
            {tag:'link-app', vue:LinkApp},
            {tag:'get-public-key', vue:GetPublicKey},
            {tag:'link-account', vue:LinkAccount},
            {tag:'transfer-request', vue:TransferRequest},

            // GLOBALS
            {tag:'view-base', vue:ViewBase},
            {tag:'auth', vue:Auth},
        ];

        const routes = Routing.routes();

        const middleware = (to, next, store) => {
            if(Routing.isRestricted(to.name))
                store.getters.unlocked ? next() : next({name:RouteNames.LOGIN});
            else next();
        };

        new VueInitializer(routes, components, middleware, async (router, store) => {



        });

        window.onerror = log => {
            console.log('err logged', log);
        }



        // window.eval = global.eval = () => {
        //     // throw new Error(`Sorry, this app does not support window.eval().`)
        // }
    }

}

new Main();
