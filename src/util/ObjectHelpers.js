/***
 * A set of helpers for Objects/Arrays
 */
export default class ObjectHelpers {

    /***
     * Makes a single level array distinct
     * @param array
     * @returns {*}
     */
    static distinct(array){
        return array.reduce((a,b) => (a.includes(b)) ? a : a.concat(b), []);
    }

    /***
     * Flattens an array into a single dimension
     * @param array
     * @returns {*}
     */
    static flatten(array){
        if(!Array.isArray(array)) return array;
        return array.reduce(
            (a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []
        );
    }

    /***
     * Flattens an array into a single dimension
     * @param val
     * @returns {*}
     */
    static flattenObject(val){
        if(typeof val !== 'object') return this.flatten(val);
	    return this.flatten(Object.keys(val).map(key => {
		    return this.flattenObject(val[key]);
	    }));
    }

	static shuffle(a) {
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	static objectTake(obj, limit){
		let limited = {};
		if(Object.keys(obj).length < limit) return obj;
		Object.keys(obj).map(key => {
			if(Object.keys(limited).length >= limit) return;
			limited[key] = obj[key];
		});
		return limited;
	}

}