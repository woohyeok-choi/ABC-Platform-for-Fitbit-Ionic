import {peerSocket} from 'messaging';
import {Commands} from "../common/commands";
import {settingsStorage} from 'settings';
import {device} from 'peer';

class DataReceiver {
    /**
     * @param {number} timeout
     * @param {string} endpoint
     */
    constructor (timeout, endpoint) {
        /**
         * @type {?Uint8Array}
         * @private
         */
        this._data = null;

        /**
         * @type {?string}
         * @private
         */
        this._filePath = null;

        /**
         * @type {number}
         * @private
         */
        this._filePos = 0;

        /**
         * @type {number}
         * @private
         */
        this._timeout = timeout;

        /**
         * @type {string}
         * @private
         */
        this._endpoint = endpoint;

        /**
         * @type {boolean}
         * @private
         */
        this._isActivated = false;

        /**
         * @type {number}
         * @private
         */
        this._timeoutId = undefined;

        this._checkConnection = this._checkConnection.bind(this);

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
    _checkConnection () {
        if(this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = 0;
        }

        fetch(this._endpoint, {
            method: 'HEAD'
        }).then(resp => {
            console.log(`[Companion] DataReceiver._checkConnection(): fetch(url=${this._endpoint}): ${resp.status}`);
            if(resp.ok) {
                const msg = {
                    command: Commands.COMPANION_READY
                };
                this._send(msg);
            } else {
                this._terminate();
            }
            this._timeoutId = setTimeout(this._checkConnection, this._timeout);
        }).catch(err => {
            this._terminate();
            this._timeoutId = setTimeout(this._checkConnection, this._timeout);
            console.error(`[Companion] DataReceiver._checkConnection(): fetch(url=${this._endpoint}): ${err}`);
        });
    }

    /**
     * @param {string} filePath
     * @param {number} fileSize
     */
    _prepareData (filePath, fileSize) {
        this._data = new Uint8Array(new ArrayBuffer(fileSize));
        this._filePath = filePath;
        console.log(`[Companion] DataReceiver._prepareData(filePath: ${filePath}, fileSize: ${fileSize})`);
        const msg = {
            command: Commands.COMPANION_PREPARED,
            options: {
                filePath: this._filePath
            }
        };
        this._send(msg);
    }

    /**
     * @param {Uint8Array} data
     */
    _receiveData (data) {
        if(!data) {
            console.error(`[Companion] DataReceiver._receiveData(): Data received is null`);
            this._terminate();
            return;
        }

        if(!this._data) {
            console.error(`[Companion] DataReceiver._receiveData(): Data contained is null`);
            this._terminate();
            return;
        }

        const expPos = this._filePos + data.byteLength;

        if(expPos > this._data.byteLength) {
            console.error(`[Companion] DataReceiver._receiveData(): expPos=${expPos}, this._data.byteLength=${this._data.byteLength}`);
            this._terminate();
            return;
        }

        this._data.set(data, this._filePos);
        this._filePos += data.byteLength;

        if (this._filePos === this._data.byteLength) {
            const form = new FormData();
            const email = settingsStorage.getItem('email');
            const uuid = settingsStorage.getItem('uuid');
            const group = settingsStorage.getItem('group');
            const sourceType = 'WRIST_WORN';
            const sourceInfo = `${device.type}-${device.modelName}-${device.modelId}`;
            const file = new Blob([this._data]);

            form.append('file', file, this._filePath);
            form.append('email', email);
            form.append('uuid', uuid);
            form.append('group', group);
            form.append('sourceType', sourceType);
            form.append('sourceInfo', sourceInfo);

            fetch(this._endpoint, {
                method: 'POST',
                body: form
            }).then(resp => {
                console.log(`[Companion] DataReceiver._receiveData(): fetch(url=${this._getURL()}, filePath=${this._filePath}): ${resp.status}`);

                if(resp.ok) {
                    const msg = {
                        command: Commands.COMPANION_UPLOAD_COMPLETED,
                        options: {
                            filePath: this._filePath
                        }
                    };
                    this._send(msg);
                } else {
                    this._terminate();
                }
            }).catch(err => {
                console.error(`[Companion] DataReceiver._receiveData(): fetch(url=${this._getURL()}, filePath=${this._filePath}): ${err}`);
                this._terminate();
            })
        }
    }

    /**
     * @private
     */
    _completeSyncToApp () {
        console.log('[Companion] DataReceiver._completeSyncToApp()');
        this.clear();
        const msg = {
            command: Commands.COMPANION_READY
        };
        this._send(msg);
    }

    /**
     * @private
     */
    _terminate () {
        console.log('[Companion] DataReceiver._terminate()');
        this.clear();
        const msg = {
            command: Commands.COMPANION_REQUEST_ABORT
        };
        this._send(msg)
    }

    clear () {
        console.log('[Companion] DataReceiver.clear()');
        this._filePos = 0;
        this._filePath = null;
        this._data = null;
    }

    /**
     * @param {string} command
     * @param {object} options
     */
    handleMessage (command, options) {
        if(this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = 0;
        }
        switch (command) {
            case Commands.APP_SEND_METADATA:
                this._prepareData(options.filePath, options.pos);
                break;
            case Commands.APP_SEND_DATA:
                this._receiveData(options.data);
                break;
            case Commands.APP_UPDATE_FILE_SYSTEM:
                this._completeSyncToApp();
                break;
            case Commands.APP_REQUEST_ABORT:
                this.clear();
                break;
        }
        this._timeoutId = setTimeout(this._checkConnection, this._timeout);
    }

    start () {
        if(this._isActivated) {
           return;
        }
        this._isActivated = true;
        console.log('[Companion] DataReceiver.start()');
        this._checkConnection();
    }

    stop () {
        if(!this._isActivated) {
            return;
        }
        this._isActivated = false;
        console.log('[Companion] DataReceiver.stop()');
        this.clear();

        if(this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = 0;
        }
    }
}

export {
    DataReceiver
};