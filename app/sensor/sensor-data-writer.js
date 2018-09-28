import {Constants} from "../../common/constants";
import {BufferedWriter} from "../io/buffered-writer";

class SensorDataWriter {
    /**
     * @param {number} bufferSize
     * @param {string} filePath
     */
    constructor (bufferSize, filePath) {
        /**
         * @type {BufferedWriter}
         * @private
         */
        this._writer = new BufferedWriter(bufferSize, filePath);
    }

    get pos () {
        return this._writer.pos;
    }

    /**
     * @param {number} type
     * @param {number} timestamp
     * @param {number | Array<number>} values
     */
    writeSensorData(type, timestamp, values) {
        this._writer.writeInt32(type);
        this._writer.writeFloat64(timestamp);
        const v = Array.isArray(values) ? values.map(value => Math.fround(value)) : [Math.fround(values)];
        this._writer.writeFloat32(v);
    }

    /**
     * @param {number | Array<number>}values
     * @return {number}
     */
    expectedFileSize (values) {
        return this._writer.pos +
            Int32Array.BYTES_PER_ELEMENT + Float64Array.BYTES_PER_ELEMENT +
            (Array.isArray(values) ?
                values.length * Float32Array.BYTES_PER_ELEMENT :
                Float32Array.BYTES_PER_ELEMENT
            );
    }

    close () {
        if(this._writer) {
            this._writer.close();
        }
    }
}

export {
    SensorDataWriter
}