import {peerSocket} from 'messaging';
import {me} from 'companion';
import {DataReceiver} from "./data-receiver";
import {Constants} from "../common/constants";


const receiver = new DataReceiver(Constants.CONN_CHECK_INTERVAL, Constants.URL_ENDPOINT);

me.onunload = () => {
    console.log('[Companion] me.onunload()');
    me.wakeInterval = 1000 * 60 * 5;
    receiver.stop();
};

if(me.launchReasons.peerAppLaunched) {
    console.log(`[Companion] me.launchReasons.peerAppLaunched`)
} else if (me.launchReasons.settingsChanged) {
    console.log(`[Companion] me.launchReasons.settingsChanged`)
} else if (me.launchReasons.wokenUp) {
    console.log('[Companion] me.lanuchReasons.wokenUp');
    me.wakeInterval = undefined;
}

peerSocket.onmessage = (evt) => {
    const {data: msg} = evt;
    const {command, options} = msg;
    console.log(`[Companion] peerSocket.onmessage(): ${command}`);
    receiver.handleMessage(command, options);
};

peerSocket.onopen = () => {
    console.log('[Companion] peerSocket.onopen()');
    receiver.start();
};

peerSocket.onclose = () => {
    console.log('[Companion] peerSocket.onclose()');
    receiver.stop();
};

peerSocket.onerror = () => {
    console.log('[Companion] peerSocket.onerror()');
    receiver.stop();
};
