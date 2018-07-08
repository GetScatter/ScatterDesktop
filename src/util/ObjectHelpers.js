/***
 * A set of helpers for Objects/Arrays
 */
export default class ObjectHelpers {

    /***
     * Groups an array by key
     * @param array
     * @param key
     * @returns {*}
     */
    static groupBy(array, key){
        return array.reduce((acc, item) => {
            (acc[item[key]] = acc[item[key]] || []).push(item);
            return acc;
        }, {});
    }

    /***
     * Makes a single level array distinct
     * @param array
     * @returns {*}
     */
    static distinct(array){
        return array.reduce((a,b) => (a.includes(b)) ? a : a.concat(b), []);
    }

    /***
     * Makes an object array distinct ( uses deep checking )
     * @param array
     * @returns {*}
     */
    static distinctObjectArray(array){
        return array.reduce((a,b) => (!!a.find(x => this.deepEqual(x, b))) ? a : a.concat(b), []);
    }

    /***
     * Checks deep equality for objects
     * @param objA
     * @param objB
     * @returns {boolean}
     */
    static deepEqual(objA, objB) {
        const keys = Object.keys, typeA = typeof objA, typeB = typeof objB;
        return objA && objB && typeA === 'object' && typeA === typeB ? (
            keys(objA).length === keys(objB).length &&
            keys(objA).every(key => this.deepEqual(objA[key], objB[key]))
        ) : (objA === objB);
    }

    /***
     * Flattens an array into a single dimension
     * @param array
     * @returns {*}
     */
    static flatten(array){
        return array.reduce(
            (a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []
        );
    }

    /***
     * Flattens an objects keys into a single dimension
     * @param object
     * @returns {*}
     */
    static objectToFlatKeys(object){
        return this.flatten(Object.keys(object).map(key => {
            if(object[key] !== null && typeof object[key] === 'object') return this.objectToFlatKeys(object[key])
            else return key;
        }))
    }

    /***
     * Gets a field from an object by string dot notation, such as `location.country.code`
     * @param object
     * @param dotNotation
     * @returns {*}
     */
    static getFieldFromObjectByDotNotation(object, dotNotation){
        let props = dotNotation.split(".");
        return props.reduce((obj,key)=> obj[key], object)
    }

}