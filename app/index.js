import {peerSocket} from 'messaging';
import clock from 'clock';
import { battery, charger } from "power";
import { vibration } from "haptics";
import { me } from "appbit";
import document from "document";

import storage from './storage-manager';
import {SensorCollector} from "./sensor/sensor-collector";
import {DataSender} from "./communication/data-sender";
import {Constants} from "../common/constants";


/**
 * Declare SensorCollector and DataSender
 */
const
    collector = new SensorCollector(Constants.WRITE_BUFFER_SIZE, Constants.MAX_FILE_SIZE),
    sender = new DataSender(Constants.READ_BUFFER_SIZE);

/**
 * Get UI Components
 */
const
    clockDate = document.getElementById('clock-date'),
    clockDay = document.getElementById('clock-day'),
    clockTime = document.getElementById('clock-time'),
    clockSecond = document.getElementById('clock-second'),
    statBattery = document.getElementById('stat-battery'),
    statStorage = document.getElementById('stat-storage');

const
    MONTH_STRING = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    DAY_STRING = [
        'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
    ];

clock.granularity = 'seconds';

me.onunload = () => {
    console.log('[App] me.onunload()');
    collector.stop();
    sender.abort();
};

clock.ontick = (evt) => {
    const date = evt.date;

    clockDate.text = `${MONTH_STRING[date.getMonth()]} ${('0' + date.getDate()).slice(-2)}, ${date.getFullYear()}`;
    clockDay.text = DAY_STRING[date.getDay()];
    clockTime.text = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
    clockSecond.text = ('0' + date.getSeconds()).slice(-2);

    const batteryLevel = battery.chargeLevel;
    const storageLevel = Math.round(storage.occupiedStorageSize / Constants.MAX_ARCHIVE_SIZE * 100);
    console.log(storage.occupiedStorageSize);
    statBattery.text = batteryLevel + '%';
    statStorage.text = storageLevel + '%';
};

battery.onchange = () => {
    console.log(`[App] battery.onchange(): ${battery.chargeLevel} / ${battery.charging}`);
    if(battery.chargeLevel === 10 && !battery.charging) {
        vibration.start('nudge-max');
    }
};

charger.onchange = () => {
    console.log(`[App] charger.onchange(): ${charger.connected}`);
    if (charger.connected) {
        collector.stop();
    } else {
        collector.start();
    }
};


peerSocket.onmessage = (evt) => {
    const {data: msg} = evt;
    const {command, options} = msg;
    console.log(`[App] peerSocket.onmessage(): ${command}`);
    sender.handleMessage(command, options);
};

peerSocket.onopen = () => {
    console.log('[App] peerSocket.onopen()');
};

peerSocket.onclose = () => {
    console.log('[App] peerSocket.onclose()');
    sender.abort();
};

peerSocket.onerror = () => {
    console.log('[App] peerSocket.onerror()');
    sender.abort();
};

collector.start();

