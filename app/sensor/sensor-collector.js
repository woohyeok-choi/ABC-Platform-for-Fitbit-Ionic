import {SensorManager} from "./sensor-manager";
import {SensorDataWriter} from "./sensor-data-writer";
import {Constants} from "../../common/constants";
import {Utils} from "../../common/utils";
import storage from "../storage-manager";
import * as fs from 'fs';

class SensorCollector {
    /**
     * @param {number} bufferSize
     * @param {number} maxFileSize
     */
    constructor (bufferSize, maxFileSize) {
        /**
         * @type {number}
         * @private
         */
        this._bufferSize = bufferSize;

        /**
         * @type {number}
         * @private
         */
        this._maxFileSize = maxFileSize;

        /**
         * @type {?SensorDataWriter}
         * @private
         */
        this._writer = null;

        /**
         * @type {?SensorManager}
         * @private
         */
        this._sensor = new SensorManager();

        /**
         * @type {boolean}
         * @private
         */
        this._isActivated = false;


        this._onReading = this._onReading.bind(this);
    }

    /**
     * @param {number} type
     * @param {number} timestamp
     * @param {Array<number>} values
     * @private
     */
    _onReading (type, timestamp, values) {
        const expLen = this._writer.expectedFileSize(values);
        if(expLen < this._maxFileSize) {
            try {
                this._writer.writeSensorData(type, timestamp, values);    
            } catch (e) {
                console.log(`[App][Err] SensorCollector._onReading(): ${e}`);
                this._stop();
                this.start();
            }
        } else {
            this.stop();
            this.start();
        }
    }

    start () {
        if (this._isActivated) {
            return;
        }
        this._isActivated = true;
        console.log('[App] SensorCollector.start()');

        this._writer = new SensorDataWriter(this._bufferSize, Constants.PATH_TEMP_DATA);
        this._sensor.onReading = this._onReading;
        this._sensor.start();
    }

    stop () {
        console.log('[App] SensorCollector.stop()');
        this._stop();
      
        if(storage.exists(Constants.PATH_TEMP_DATA)) {
          const filePath = `${Constants.PATH_SENSOR_DATA}-${Date.now()}.dat`;
          storage.archive(Constants.PATH_TEMP_DATA, filePath);  
        }
    }

    _stop () {
        if(!this._isActivated) {
            return;
        }
        this._isActivated = false;
        console.log('[App] SensorCollector._stop()');

        this._sensor.onReading = null;
        this._sensor.stop();

        try {
            if (this._writer != null) {
                this._writer.close();
            }
        } catch (e) {
            console.log(`[App][ERR] SensorCollector._stop(): ${e}`);
        }
        this._writer = null;
    }
}

export {
    SensorCollector
}