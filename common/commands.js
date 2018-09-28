const COMPANION_READY = 'COMPANION_READY';
const COMPANION_PREPARED = 'COMPANION_PREPARED';
const COMPANION_UPLOAD_COMPLETED = 'COMPANION_UPLOAD_COMPLETED';
const COMPANION_REQUEST_ABORT = 'COMPANION_REQUEST_ABORT';

const APP_SEND_METADATA = 'APP_SEND_METADATA';
const APP_SEND_DATA = 'APP_SEND_DATA';
const APP_UPDATE_FILE_SYSTEM = 'APP_UPDATE_FILE_SYSTEM';
const APP_REQUEST_ABORT = 'APP_REQUEST_ABORT';

class Commands {
    static get COMPANION_READY () {
        return COMPANION_READY;
    }

    static get COMPANION_PREPARED () {
        return COMPANION_PREPARED;
    }

    static get COMPANION_UPLOAD_COMPLETED () {
        return COMPANION_UPLOAD_COMPLETED;
    }

    static get COMPANION_REQUEST_ABORT () {
        return COMPANION_REQUEST_ABORT;
    }

    static get APP_SEND_METADATA () {
        return APP_SEND_METADATA;
    }

    static get APP_UPDATE_FILE_SYSTEM () {
        return APP_UPDATE_FILE_SYSTEM;
    }

    static get APP_REQUEST_ABORT () {
        return APP_REQUEST_ABORT;
    }

    static get APP_SEND_DATA () {
        return APP_SEND_DATA;
    }
}

export {
    Commands
}
