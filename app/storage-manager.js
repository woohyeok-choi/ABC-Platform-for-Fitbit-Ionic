import * as fs from 'fs';
import {Constants} from "../common/constants";

class StorageManager {
    constructor () {
        /**
         * @type {Array<string>}
         * @private
         */
        this._archivedFiles = [];

        /**
         * @type {number}
         * @private
         */
        this._occupiedStorageSize = 0;

        try {
            const {archivedFiles = []} = fs.readFileSync(Constants.PATH_CONFIG_DATA, 'json');
            this._archivedFiles = archivedFiles;
        } catch (e) {

        }
        this._update();
    }

    /**
     * @param {string} source
     * @param {string} dest
     * @return {boolean}
     */
    archive (source, dest) {
        console.log(`[App] StorageManager.archive(source: ${source}, dest: ${dest})`);
        let ret = true;

        const size = this.getFileSize(source);

        if (size) {
            while (this._occupiedStorageSize + size > Constants.MAX_ARCHIVE_SIZE) {
                const oldestFilePath = this.getLeastRecentArchivedFile();
                if (oldestFilePath) {
                    this.remove(oldestFilePath);
                }
            }
        } else {
            ret = false;
        }

        try {
            fs.renameSync(source, dest);
            this._archivedFiles.push(dest);
        } catch (e) {
            ret = false;
        }
        this._update();

        return ret;
    }

    remove (filePath) {
        console.log(`[App] StorageManager.remove(filePath: ${filePath})`);
        const idx = this._archivedFiles.indexOf(filePath);
        if (idx !== -1) {
            this._archivedFiles.splice(idx, 1);
        }
        if(this.exists(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (e) {
                console.error(`[App] StorageManager.remove(): ${e}`);
            }
        }
        this._update();
    }

    getLeastRecentArchivedFile () {
        while (this._archivedFiles.length) {
            const filePath = this._archivedFiles[0];
            if(this.exists(filePath)) {
                return filePath;
            } else {
                this.remove(filePath);
            }
        }
        return null;
    }

    /**
     * @param {string} filePath
     * @return {number | null}
     */
    getFileSize (filePath) {
        try {
            const size = fs.statSync(filePath).size;
            if (size > 0) {
                return size;
            }
        } catch (e) {

        }
        return null;
    }

    /**
     * @param {string} filePath
     * @return {boolean}
     */
    exists (filePath) {
        return !!this.getFileSize(filePath);
    }

    /**
     * @private
     */
    _update () {
        let size = 0;
        for (let i = this._archivedFiles.length - 1;i >= 0; i--) {
            try {
                size += fs.statSync(this._archivedFiles[i]).size;
            } catch (e) {
                this._archivedFiles.pop();
            }
        }
        this._occupiedStorageSize = size;

        const config =  {
            archiveFiles: this._archivedFiles
        };
        console.log(`[App] StorageManager._update(): size: ${this._occupiedStorageSize}, archivedFiles: ${this._archivedFiles.length}`);

        fs.writeFileSync(Constants.PATH_CONFIG_DATA, config, 'json');
    }
    /**
     * @return {number}
     */
    get occupiedStorageSize () {
        return this._occupiedStorageSize;
    }
}

export default new StorageManager();