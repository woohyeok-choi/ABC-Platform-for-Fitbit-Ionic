class Utils {
    /**
     * @param {String} str
     * @return {Array.<number>}
     */
    static strToCharCodes (str) {
        const arr = [];
        for (let i = 0;i < str.length; i++) {
            arr.push(str.charCodeAt(i));
        }
        return arr;
    }

    /**
     * @param {Uint8Array} uInt8Arr
     * @return {Int32Array}
     */
    static uInt8ArrayToInt32Array (uInt8Arr) {
        if (uInt8Arr.length !== 4) {
            throw 'Uint8Array should be a length 4';
        }
        return new Int32Array(uInt8Arr.buffer);
    }

    /**
     * @param {String} str
     * @return {Int32Array}
     */
    static strToInt32Array (str) {
        const arr = Utils.strToCharCodes(str);
        const uInt8Arr = new Uint8Array(arr);
        return Utils.uInt8ArrayToInt32Array(uInt8Arr);
    }

    static objectAssign (target, args) {
        if(target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        let to = Object(target);

        for (let index = 1; index < arguments.length; index++) {
            let nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (let nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    }
}

export {
    Utils
};