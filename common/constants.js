import {Utils} from "./utils";

const
    URL_ENDPOINT = 'https://579b516a.ngrok.io',
    CONN_CHECK_INTERVAL = 1000 * 30 * 1;

const
    MAX_ARCHIVE_SIZE = 1024 * 1000 * 10, // 10 Mb
    MAX_FILE_SIZE = 1024 * 5, // 500 Kb
    WRITE_BUFFER_SIZE = 1024,
    READ_BUFFER_SIZE = 512;

const
    FLAG_ACCELEROMETER = Utils.strToInt32Array('%ACC')[0],
    FLAG_GYROSCOPE = Utils.strToInt32Array('%GYR')[0],
    FLAG_BAROMETER = Utils.strToInt32Array('%BAR')[0],
    FLAG_HEARTRATE = Utils.strToInt32Array('%HRT')[0],
    FLAG_ORIENTATION = Utils.strToInt32Array('%ORI')[0],
    FLAG_ACTIVITY = Utils.strToInt32Array('%ACT')[0];

const
    PATH_TEMP_DATA = 'temp.dat',
    PATH_SENSOR_DATA = 'sensor-data',
    PATH_CONFIG_DATA = 'config.json';


const DEFAULT_FREQUENCIES = {
    accelerometer: 10,
    gyroscope: 10,
    barometer: 1,
    orientation: 10,
    heartrate: 1,
    activity: 1
};

class Constants {
    static get URL_ENDPOINT () {
        return URL_ENDPOINT;
    }

    static get CONN_CHECK_INTERVAL() {
        return CONN_CHECK_INTERVAL;
    }

    static get MAX_ARCHIVE_SIZE () {
        return MAX_ARCHIVE_SIZE;
    }

    static get MAX_FILE_SIZE () {
        return MAX_FILE_SIZE;
    }

    static get WRITE_BUFFER_SIZE () {
        return WRITE_BUFFER_SIZE;
    }

    static get READ_BUFFER_SIZE () {
        return READ_BUFFER_SIZE;
    }

    static get DEFAULT_FREQUENCIES () {
        return DEFAULT_FREQUENCIES;
    }

    static get FLAG_ACCELEROMETER () {
        return FLAG_ACCELEROMETER;
    }

    static get FLAG_GYROSCOPE () {
        return FLAG_GYROSCOPE;
    }

    static get FLAG_BAROMETER () {
        return FLAG_BAROMETER;
    }

    static get FLAG_HEARTRATE () {
        return FLAG_HEARTRATE;
    }

    static get FLAG_ORIENTATION () {
        return FLAG_ORIENTATION;
    }

    static get FLAG_ACTIVITY () {
        return FLAG_ACTIVITY;
    }

    static get PATH_TEMP_DATA () {
        return PATH_TEMP_DATA;
    }

    static get PATH_SENSOR_DATA () {
        return PATH_SENSOR_DATA;
    }

    static get PATH_CONFIG_DATA () {
        return PATH_CONFIG_DATA;
    }
}

export {
    Constants
}



