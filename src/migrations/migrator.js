import * as migrators from './versions/version';

export const mathematicalVersion = version => {
    if(!version || version === '0') return 0;
    const parts = version.replace(/[.]/g,'_').replace(/[m]/g, '').split('_');
    if(parts.length !== 3) throw new Error("Migration error, invalid version");

    let total = 0;
    parts.map((v, i) => {
        const multiplier = i === 0 ? 100 : i === 1 ? 10 : 1;
        total += parseFloat(v) * multiplier;
    });

    return total;
};

const fnToVersion = fnName => fnName.replace(/[m]/g, '').replace(/[_]/g,'.');

export default async scatter => {
    scatter.meta.regenerateVersion();
    if(scatter.isEncrypted())           return false;
    if(!scatter.meta.needsUpdating())   return false;

    const lastVersion = mathematicalVersion(scatter.meta.lastVersion);
    const nextVersions = Object.keys(migrators).filter(v => mathematicalVersion(v) > lastVersion)
        .sort((a,b) => mathematicalVersion(a) - mathematicalVersion(b));

    if(nextVersions.length) {
        for(let i = 0; i < nextVersions.length; i++){
	        await migrators[nextVersions[i]](scatter)
        }
        scatter.meta.lastVersion = fnToVersion(nextVersions[nextVersions.length-1]);
    }

    return nextVersions.length > 0;
}