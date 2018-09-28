import * as fs from 'fs';

const INT32 = 1;
const FLOAT32 = 2;
const FLOAT64 = 3;


class BufferedWriter {
    /**
     * @param {number} bufSize
     * @param {string} filePath
     */
    constructor (bufSize, filePath) {
        /**
         * @type {ArrayBuffer}
         * @private
         */
        this._buffer = new ArrayBuffer(bufSize);

        /**
         * @type {number}
         * @private
         */
        this._filePos = 0;

        /**
         * @type {number}
         * @private
         */
        this._bufferPos = 0;

        /**
         * @type {string}
         * @private
         */
        this._filePath = filePath;

        /**
         * @type {?number}
         * @private
         */
        this._fd = null;
    }

    /**
     * @private
     */
    _ensureOpen () {
        if (this._fd === null || this._fd === undefined) {
            this._fd = fs.openSync(this._filePath, 'w+');
        }
    }

    /**
     * @return {number}
     */
    get pos () {
        return this._filePos + this._bufferPos;
    }

    /**
     * @param {Array<number> | number} values
     */
    writeInt32 (values) {
        this._write(INT32, values);
    }

    /**
     * @param {Array<number> | number} values
     */
    writeFloat32 (values) {
        this._write(FLOAT32, values);
    }

    /**
     * @param {Array<number> | number} values
     */
    writeFloat64 (values) {
        this._write(FLOAT64, values);
    }

    /**
     * @param {number} type
     * @param {Array<number> | number} values
     * @private
     */
    _write (type, values) {
        let bytes, len, data;
        this._ensureOpen();
        const v = Array.isArray(values) ? [...values] : [values];
        switch (type) {
            case INT32:
                bytes = Int32Array.BYTES_PER_ELEMENT;
                break;
            case FLOAT32:
                bytes = Float32Array.BYTES_PER_ELEMENT;
                break;
            case FLOAT64:
                bytes = Float64Array.BYTES_PER_ELEMENT;
                break;
        }
      
        len = bytes * v.length;
        
        if (len + this._bufferPos >= this._buffer.byteLength || this._bufferPos % bytes !== 0) {
            this._flush();
        }

        switch (type) {
            case INT32:
                data = new Int32Array(this._buffer, this._bufferPos, v.length);
                break;
            case FLOAT32:
                data = new Float32Array(this._buffer, this._bufferPos, v.length);
                break;
            case FLOAT64:
                data = new Float64Array(this._buffer, this._bufferPos, v.length);
                break;
        }
        data.set(v);
        this._bufferPos += len;
    }

    /**
     * @private
     */
    _flush () {
        this._ensureOpen();
        if (this._bufferPos === 0) {
            return;
        }
        if (typeof process === 'undefined') {
            fs.writeSync(this._fd, this._buffer, 0, this._bufferPos, this._filePos);
        } else {
            fs.writeSync(this._fd, Buffer.from(this._buffer), 0, this._bufferPos, this._filePos);
        }

        this._filePos += this._bufferPos;
        this._bufferPos = 0;
    }

    close () {
        this._flush();
        fs.closeSync(this._fd);
        this._fd = null;
        this._buffer = null;
    }
}

export {
    BufferedWriter
}