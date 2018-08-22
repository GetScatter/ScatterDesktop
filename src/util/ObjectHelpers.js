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
        return array.reduce(
            (a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), []
        );
    }

}