import {peerSocket} from 'messaging';
import {BufferedReader} from "../io/buffered-reader";
import {Commands} from "../../common/commands";
import storage from "../storage-manager";
import * as fs from 'fs';

class DataSender {
    /**
     * @param {number} bufSize
     */
    constructor (bufSize) {
        /**
         * @type {BufferedReader}
         * @private
         */
        this._reader = null;

        /**
         * @type {number}
         * @private
         */
        this._bufSize = bufSize;


        this._sendLargeData = this._sendLargeData.bind(this);
    }

    /**
     * @param {{command: string, options: {}=}} msg
     * @private
     */
    _send (msg) {
        if (peerSocket.readyState === peerSocket.OPEN) {
            peerSocket.send(msg);
        }
    }

    /**
     * @private
     */
    _sendLargeData () {
        try {
            while(!peerSocket.bufferedAmount) {
                if(!this._reader || this._reader.isClosed) {
                    console.error(`[App] DataSender._sendLargeData(): BufferedReader is null or closed.`);
                    this._terminate();
                }
                const buf = this._reader.read();
                if (buf && buf.byteLength) {
                    const msg = {
                        command: Commands.APP_SEND_DATA,
                        options: {
                            data: buf
                        }
                    };
                    this._send(msg);
                } else {
                    this.abort();
                }
            }
        } catch (e) {
            console.error(`[App] DataSender._sendLargeData(): ${e}`);
            this._terminate();
        }
    }

    _sendMetadata () {
        const filePath = storage.getLeastRecentArchivedFile();
        if(!filePath) {
            return;
        }
        const fileSize = storage.getFileSize(filePath);
        if(!fileSize) {
            return;
        }

        const msg = {
            command: Commands.APP_SEND_METADATA,
            options: {
                fileSize: fileSize,
                filePath: filePath
            }
        };
        this._send(msg);
        console.log(`[App] DataSender._sendMetaData(): fileSize = ${fileSize}, filePath = ${filePath}`);
    }

    /**
     * @param {string} filePath
     */
    _sendSensorData (filePath) {
        console.log(`[App] DataSender._sendSensorData(): filePath = ${filePath}`);
        this._reader = new BufferedReader(this._bufSize, filePath);
        peerSocket.onbufferedamountdecrease = this._sendLargeData;
        this._sendLargeData();
    }

    /**
     * @param {string} filePath
     */
    _updateFileSystem (filePath) {
        storage.remove(filePath);
        const msg = {
            command: Commands.APP_UPDATE_FILE_SYSTEM
        };
        this._send(msg);
        console.log(`[App] DataSender._updateFileSystem()`);
    }

    /**
     * @private
     */
    _terminate () {

        this.abort();

        const msg = {
            command: Commands.APP_REQUEST_ABORT
        };
        this._send(msg);
        console.log(`[App] DataSender._terminate()`);
    }

    /**
     * @param {number} command
     * @param {object} options
     */
    handleMessage (command, options) {
        switch (command) {
            case Commands.COMPANION_READY:
                this._sendMetadata();
                break;
            case Commands.COMPANION_PREPARED:
                this._sendSensorData(options.filePath);
                break;
            case Commands.COMPANION_UPLOAD_COMPLETED:
                this._updateFileSystem(options.filePath);
                break;
            case Commands.COMPANION_REQUEST_ABORT:
                this.abort();
                break;
        }
    }

    abort () {
        console.log(`[App] DataSender.abort()`);

        if(this._reader && !this._reader.isClosed) {
            this._reader.close();
        }
        this._reader = null;
        peerSocket.onbufferedamountdecrease = null;
    }
}

export {
    DataSender
}