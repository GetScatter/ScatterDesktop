
let data = {};
const stores = {
	get:k => data[k],
	set:(k,v) => data[k] = v,
	clear:() => data = {}
};


const getScatter = () => stores.get('scatter');
const setScatter = (scatter) => stores.set('scatter', scatter);
const removeScatter = () => {
	stores.clear();
	return true;
}

const getSalt = () => stores.get('salt') || 'SALT_ME';
const setSalt = (salt) => stores.set('salt', salt);







/***********************************/
/**            EXTRAS             **/
/***********************************/

let getSeed;
const getSeedSetter = (seeder) => getSeed = seeder;



module.exports = {
	getScatter,
	setScatter,
	removeScatter,
	getSalt,
	setSalt,

	getSeedSetter,
	getSeed,
}