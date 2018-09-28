import * as fs from 'fs';

class BufferedReader {
    /**
     * @param {number} bufSize
     * @param {string} filePath
     */
    constructor (bufSize, filePath) {
        /**
         * @type {string}
         * @private
         */
        this._filePath = filePath;

        /**
         * @type {ArrayBuffer | Buffer}
         * @private
         */
        this._buffer = typeof process === 'undefined' ? new ArrayBuffer(bufSize) : new Buffer(bufSize);

        /**
         * @type {number}
         * @private
         */
        this._fileSize = 0;

        /**
         * @type {number}
         * @private
         */
        this._filePos = 0;

        /**
         * @type {?number}
         * @private
         */
        this._fd = null;

        /**
         * @type {boolean}
         * @private
         */
        this._isClosed = false;
    }

    get isClosed () {
        return this._isClosed;
    }

    reset () {
        this._filePos = 0;
    }

    /**
     * @return {ArrayBuffer | Buffer | null}
     */
    read () {
        this._fileSize = fs.statSync(this._filePath).size;
        if(this._fd === null || this._fd === undefined) {
            this._fd = fs.openSync(this._filePath, 'r');
        }

        const len = Math.min(this._fileSize - this._filePos, this._buffer.byteLength);
        if (len <= 0) {
            return null;
        }
        let buffer = this._buffer;
        if (len !== this._buffer.byteLength) {
            buffer = typeof process === 'undefined' ? new ArrayBuffer(len) : new Buffer(len);
        }

        fs.readSync(this._fd, buffer, 0, len, this._filePos);

        this._filePos += len;
        return buffer;
    }

    close () {
        this._isClosed = true;
        if (this._fd) {
            fs.closeSync(this._fd);
        }
        this._fd = null;
        this._filePath = null;
    }
}

export {
    BufferedReader
}