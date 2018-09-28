import {Constants} from '../../common/constants';
import {Utils} from "../../common/utils";

import { Accelerometer } from 'accelerometer';
import { Barometer } from 'barometer';
import { Gyroscope } from 'gyroscope';
import { HeartRateSensor } from 'heart-rate';
import { OrientationSensor } from 'orientation';
import { ActivitySensor } from "./activity-sensor";


class SensorManager {
    constructor () {
        this._frequencies = Constants.DEFAULT_FREQUENCIES;

        /**
         * @type {Accelerometer}
         * @private
         */
        this._accelerometer = new Accelerometer({
            frequency: this._frequencies.accelerometer
        });

        /**
         * @type {Gyroscope}
         * @private
         */
        this._gyroscope = new Gyroscope({
            frequency: this._frequencies.gyroscope
        });

        /**
         * @type {Barometer}
         * @private
         */
        this._barometer = new Barometer({
            frequency: this._frequencies.barometer
        });

        /**
         * @type {OrientationSensor}
         * @private
         */
        this._orientation = new OrientationSensor({
            frequency: this._frequencies.orientation
        });

        /**
         * @type {HeartRateSensor}
         * @private
         */
        this._hrm = new HeartRateSensor();


        /**
         * @type {ActivitySensor}
         * @private
         */
        this._activity = new ActivitySensor({
            frequency: this._frequencies.activity
        });

        /**
         * @type {function (type: number, timestamp: number, values: Array<number>)}
         * @private
         */
        this._onReading = null;

        /**
         * @type {boolean}
         * @private
         */
        this._isActivated = false;
    }

    /**
     * @param {function (type: number, timestamp: number, values: Array<number>)} onReading
     */
    set onReading (onReading) {
        this._onReading = onReading;
    }

    start () {
        if (this._isActivated) {
            return;
        }
        this._isActivated = true;

        this._accelerometer.onreading = () => {
            if (this._onReading && typeof this._onReading === 'function') {
                const timestamp = Date.now();
                const values = [this._accelerometer.x, this._accelerometer.y, this._accelerometer.z];
                this._onReading(Constants.FLAG_ACCELEROMETER, timestamp, values);
            }
        };
        this._gyroscope.onreading = () => {
            if (this._onReading && typeof this._onReading === 'function') {
                const timestamp = Date.now();
                const values = [this._gyroscope.x, this._gyroscope.y, this._gyroscope.z];
                this._onReading(Constants.FLAG_GYROSCOPE, timestamp, values);
            }
        };
        this._barometer.onreading = () => {
            if (this._onReading && typeof this._onReading === 'function') {
                const timestamp = Date.now();
                const values = [this._barometer.pressure];
                this._onReading(Constants.FLAG_BAROMETER, timestamp, values);
            }
        };

        this._orientation.onreading = () => {
            if (this._onReading && typeof this._onReading === 'function') {
                const timestamp = Date.now();
                const values = this._orientation.quaternion;
                this._onReading(Constants.FLAG_ORIENTATION, timestamp, values);
            }
        };

        this._hrm.onreading = () => {
            if (this._onReading && typeof this._onReading === 'function') {
                const timestamp = Date.now();
                const values = [this._hrm.heartRate];
                this._onReading(Constants.FLAG_HEARTRATE, timestamp, values);
            }
        };

        this._activity.onreading = () => {
            if (this._onReading && typeof this._onReading === 'function') {
                const timestamp = Date.now();
              
                const values = [this._activity.activeMinutes,
                    this._activity.calories,
                    this._activity.distance,
                    this._activity.elevationGain,
                    this._activity.steps];
                this._onReading(Constants.FLAG_ACTIVITY, timestamp, values);
            }
        };
        
        this._accelerometer.start();
        /*
        this._gyroscope.start();
        this._orientation.start();
        this._hrm.start();
        this._barometer.start();
        this._activity.start();
        */
    }

    stop () {
        if (!this._isActivated) {
            return;
        }
        this._isActivated = false;

        this._accelerometer.onreading = null;
        this._gyroscope.onreading = null;
        this._orientation.onreading = null;
        this._hrm.onreading = null;
        this._barometer.onreading = null;
        this._activity.onreading = null;

        this._accelerometer.stop();
        this._gyroscope.stop();
        this._orientation.stop();
        this._hrm.stop();
        this._barometer.stop();
        this._activity.stop();
    }
}

export {
    SensorManager
}