import 'dotenv/config'

import https from 'https';
import axios from 'axios';
import log from 'npmlog';

import {TemperatureThreshold} from './types/TemperatureThreshold';

const Blink1: any = require('node-blink1');

const blinkTopLedN = 1;
const blinkBottomLedN = 2;
const blinkBothLedN = 0;

// setup date string for logging https://github.com/npm/npmlog/issues/33#issuecomment-342785666
Object.defineProperty(log, 'heading', {
    get: () => {
        return new Date().toISOString()
    }
})
log.headingStyle = {bg: '', fg: 'white'}

const temperatureThresholds: TemperatureThreshold[] = [
    {threshold: 50, color: {red: 36, green: 189, blue: 46}}, // green
    {threshold: 60, color: {red: 246, green: 225, blue: 36}}, // yellow
    {threshold: 70, color: {red: 188, green: 19, blue: 19}}, // red
]

if (process.env.error) {
    throw process.env.error
}

const pfSenseApiBaseUrl = process.env.PFSENSE_API_BASE_URL;
const credentialsClientId = process.env.PFSENSE_API_CLIENT;
const credentialsClientSecret = process.env.PFSENSE_API_TOKEN;
const checkStatusInterval: number = Number.parseInt(process.env.CHECK_STATUS_INTERVAL ?? "5000");
const checkStatusIndicatorEnabled = process.env.CHECK_STATUS_INDICATOR_ENABLED === 'true' ? true : false;

const apiClientInstance = axios.create(
    {
        baseURL: pfSenseApiBaseUrl,
        timeout: 1000,
        httpsAgent: new https.Agent(
            {
                rejectUnauthorized: false // allow self sign certificates
            })
    });

apiClientInstance.interceptors.request.use(function (config) {
    if (config.headers != undefined) {
        config.headers.Authorization = credentialsClientId + ' ' + credentialsClientSecret;
    }

    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});


function apiRequestTemperature() {
    ledIndicatorApiRequest();

    apiClientInstance.get('/api/v1/status/system')
        .then(function (response) {
            // handle success
            let measuredTemperature = response.data.data.temp_c;
            let maximumReachedThreshold: TemperatureThreshold | undefined;

            temperatureThresholds.forEach((temperatureThreshold) => {
                if (measuredTemperature >= temperatureThreshold.threshold) {
                    maximumReachedThreshold = temperatureThreshold;
                }
            })

            if (maximumReachedThreshold) {
                log.http('', 'Fetched temperature %d matches threshold >= %d', measuredTemperature, maximumReachedThreshold.threshold);

                blink1.fadeToRGB(1000,
                    maximumReachedThreshold.color.red,
                    maximumReachedThreshold.color.green,
                    maximumReachedThreshold.color.blue,
                    blinkBothLedN);
            }
        })
        .catch(function (error) {
            // handle error
            ledIndicatorError();
            log.error('', error);

        })
        .then(function () {
            // always executed
        });
}

function ledIndicatorApiRequest() {
    if (checkStatusIndicatorEnabled) {
        // Set bottom LED to a bright, flashing white indicating a API request beeing performed
        blink1.fadeToRGB(300, 255, 255, 255, blinkBottomLedN);
    }
}

function ledIndicatorError() {
    blink1.writePatternLine(200, 255, 0, 0, 0);
    blink1.writePatternLine(200, 0, 0, 0, 1);
    blink1.playLoop(0, 1, 3);
}


const blink1Devices = Blink1.devices();
if (blink1Devices.length == 0) {
    log.error('', 'No attached blink(1) devices could be found. Script aborted.');
    process.abort();
}

log.info('', 'Found blink(1) devices %j serials', blink1Devices);

const blink1DeviceSerial = blink1Devices[0];
log.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);

var blink1 = new Blink1(blink1DeviceSerial);

setInterval(() => {
    apiRequestTemperature();
}, checkStatusInterval)
