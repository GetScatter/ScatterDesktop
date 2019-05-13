import * as Actions from '../../store/constants';

import PopupService from '../utility/PopupService';
import {Popup} from '../../models/popups/Popup'
import Permission from '../../models/Permission'
import {IdentityRequiredFields} from '../../models/Identity'
import Error from '../../models/errors/Error'
import Hasher from '../../util/Hasher'
import SocketService from "../utility/SocketService";
import StoreService from "../utility/StoreService";

export default class PermissionService {

    static identityFromPermissions(origin, formatForResult = true){

        const permissions = StoreService.get().state.scatter.keychain.permissions;
        const possibleId = permissions.find(x => x.isIdentityPermissionFor(origin));
        if(possibleId){
            let identityRequirements = IdentityRequiredFields.fromPermission(possibleId.identityRequirements);
            let identity = formatForResult ? possibleId.getIdentity().asOnlyRequiredFields(identityRequirements) : possibleId.getIdentity();
            if(!identity) return null;
            identity.accounts = possibleId.getAccounts().map(x => formatForResult ? x.asReturnable() : x);
            return identity;
        }
        return null;
    }

    static async addIdentityOriginPermission(identity, accounts, identityRequirements, origin){
        identityRequirements = IdentityRequiredFields.fromJson(identityRequirements);
        identityRequirements = identityRequirements.forPermission();

	    await this.removeIdentityPermission(origin);
        const scatter = StoreService.get().state.scatter.clone();


        const permission = Permission.fromAction(origin, identity, accounts, {
            identityRequirements,
            isIdentity:true
        });

        scatter.keychain.permissions.push(permission);
        return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static async removeIdentityPermission(origin){
        const scatter = StoreService.get().state.scatter.clone();
        // const idPermissions = scatter.keychain.permissions.find(x => x.isIdentity && x.origin === origin);
        // if(!idPermissions) return true;
        scatter.keychain.permissions = scatter.keychain.permissions.filter(x => !x.isIdentity || (x.isIdentity && x.origin !== origin));
        return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static async addIdentityRequirementsPermission(origin, identity, identityRequirements){
        identityRequirements = IdentityRequiredFields.fromJson(identityRequirements);

        // No need for a permission.
        if(identityRequirements.isEmpty()) return;

        identityRequirements = identityRequirements.forPermission();


        const scatter = StoreService.get().state.scatter.clone();

        const permission = Permission.fromJson({
            origin, identity:identity.id, identityRequirements, isIdentityRequirements:true
        });

        // Don't duplicate requirements.
        if(scatter.keychain.permissions.find(x => x.checksum() === permission.checksum())) return;

        scatter.keychain.permissions.push(permission);
        return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

    static hasIdentityRequirementsPermission(origin, identity, identityRequirements){
        identityRequirements = IdentityRequiredFields.fromJson(identityRequirements);
        identityRequirements = identityRequirements.forPermission();

        const permission = Permission.fromJson({
            origin, identity:identity.id, identityRequirements, isIdentityRequirements:true
        });

        return StoreService.get().state.scatter.keychain.permissions.find(x => x.checksum() === permission.checksum());
    }

    static createActionPermission(origin, identity, accounts, whitelistData){

        const immutableActionFields = Permission.createImmutableFieldsHash(whitelistData.fields, whitelistData.props);

        const permission = Permission.fromAction(origin, identity, accounts, {
            contract:whitelistData.code,
            contractHash:whitelistData.hash || null,
            action:whitelistData.type,
            immutableActionFields,
            mutableActionFields:whitelistData.props,
            timestamp:+new Date(),
            isContractAction:true
        });


        const scatter = StoreService.get().state.scatter.clone();
        return permission;
    }

    static async addActionPermissions(origin, identity, accounts, whitelists){
        if(!whitelists || !whitelists.length) return;

        const permissions = whitelists.map(whitelist =>
            PermissionService.createActionPermission(origin, identity, accounts, whitelist)
        ).filter(x => x);

        if(permissions.length){
            const scatter = StoreService.get().state.scatter.clone();
            permissions.map(perm => {
                // Removing all similar permissions for this action
                const similar = scatter.keychain.permissions.filter(x =>
                    x.origin === origin
                    && x.isContractAction
                    && x.contract === perm.contract
                    && x.action === perm.action
                ).map(x => x.id);

                scatter.keychain.permissions = scatter.keychain.permissions.filter(x => !similar.includes(x.id));
                scatter.keychain.permissions.push(perm)
            });
            await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
        }
    }

    static hasActionPermission(origin, identity, accounts, message){

        const contract = message.code;
        const action = message.type;
        const contractHash = null;

        const permission = Permission.fromAction(origin, identity, accounts, {
            contract,
            contractHash,
            action,
            isContractAction:true
        });

        const matchingPermissions = StoreService.get().state.scatter.keychain.permissions.filter(x => x.checksum() === permission.checksum());

        if(!matchingPermissions.length) return false;

        return matchingPermissions.some(perm => {
            const immutableActionFields = Permission.createImmutableFieldsHash(message.data, perm.mutableActionFields);
            return perm.immutableActionFields === immutableActionFields;
        });
    }

    static isWhitelistedTransaction(origin, identity, accounts, messages, requiredFields){
        requiredFields = IdentityRequiredFields.fromJson(requiredFields);

        // Checking for permissions
        const whitelistedActions = messages.every(message =>
            PermissionService.hasActionPermission(origin, identity, accounts, message)
        );


        // Not all actions are whitelisted
        if(!whitelistedActions) return false;

        // Dont need to check for required fields
        if(requiredFields.isEmpty()) return true;

        return PermissionService.hasIdentityRequirementsPermission(origin, identity, requiredFields);
    }

    static checkAppLinkPermissions(origin){
        const permissions = StoreService.get().state.scatter.keychain.permissions.filter(x => x.origin === origin);
        if(!permissions.length) SocketService.sendEvent('logout', {}, origin);
    }

    static removeAllPermissions(){
        return new Promise(resolve => {
            PopupService.push(Popup.removeApp(null, async removed => {
	            if(!removed) return resolve(false);
	            const scatter = StoreService.get().state.scatter.clone();

	            scatter.keychain.permissions = [];
	            scatter.keychain.apps.map(app => {
		            scatter.keychain.removeApp(app);
		            SocketService.sendEvent('logout', {}, app.origin);
                })

	            await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	            resolve(true);
            }))
        })
    }

    static async removeAllPermissionsFor(origin){
	    const scatter = StoreService.get().state.scatter.clone();

	    const app = scatter.keychain.apps.find(x => x.origin === origin);
	    if(app) scatter.keychain.removeApp(app);

	    scatter.keychain.permissions = scatter.keychain.permissions.filter(x => x.origin !== origin);
	    await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	    this.checkAppLinkPermissions(origin);
	    return true;
    }

    static async removePermission(permission){
	    const scatter = StoreService.get().state.scatter.clone();
	    scatter.keychain.permissions = scatter.keychain.permissions.filter(x => x.id !== permission.id);
	    await StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
	    this.checkAppLinkPermissions(permission.origin);
	    return true;
    }

    static async removeDanglingPermissions(){
	    const scatter = StoreService.get().state.scatter.clone();
	    const origins = scatter.keychain.permissions.map(x => x.origin);
	    scatter.keychain.apps = scatter.keychain.apps.filter(x => origins.includes(x.origin));
	    return StoreService.get().dispatch(Actions.SET_SCATTER, scatter);
    }

}