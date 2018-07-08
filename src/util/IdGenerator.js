

export default class IdGenerator {

    static rand(){
        const arr = new Uint32Array(1);
        window.crypto.getRandomValues(arr);
        return arr[0]/(0xffffffff + 1);
    }

    /***
     * Generates a random string of specified size
     * @param size - The length of the string to generate
     * @returns {string} - The generated random string
     */
    static text(size){
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(let i=0; i<size; i++) text += possible.charAt(Math.floor(IdGenerator.rand() * possible.length));
        return text;
    }

    /***
     * Generates a random number of specified size
     * @param size - The length of the number to generate
     * @returns {string} - The generated random number ( as a string )
     */
    static numeric(size){
        const add = 1;
        let max = 12 - add;

        if ( size > max ) return IdGenerator.numeric(max) + IdGenerator.numeric(size - max);

        max = Math.pow(10, size+add);
        const min = max / 10,
              number = Math.floor(IdGenerator.rand() * (max - min + 1)) + min;

        return ("" + number).substring(add);
    }

}