import {DeviceUUID} from 'device-uuid';
const du = new DeviceUUID().parse();
console.log(du);
const dua = [
	du.language,
	du.platform,
	du.os,
	du.cpuCores,
	du.colorDepth,
];
const device = du.hashMD5(dua.join(':'));
export default device;