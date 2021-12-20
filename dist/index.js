"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
const npmlog_1 = __importDefault(require("npmlog"));
const Blink1 = require('node-blink1');
const blinkTopLedN = 1;
const blinkBottomLedN = 2;
const blinkBothLedN = 0;
Object.defineProperty(npmlog_1.default, 'heading', {
    get: () => {
        return new Date().toISOString();
    }
});
npmlog_1.default.headingStyle = { bg: '', fg: 'white' };
const temperatureThresholds = [
    { threshold: 50, color: { red: 36, green: 189, blue: 46 } },
    { threshold: 60, color: { red: 246, green: 225, blue: 36 } },
    { threshold: 70, color: { red: 188, green: 19, blue: 19 } },
];
if (process.env.error) {
    throw process.env.error;
}
const pfSenseApiBaseUrl = process.env.PFSENSE_API_BASE_URL;
const credentialsClientId = process.env.PFSENSE_API_CLIENT;
const credentialsClientSecret = process.env.PFSENSE_API_TOKEN;
const blinkSerial = process.env.BLINK_SERIAL;
const checkStatusInterval = Number.parseInt((_a = process.env.CHECK_STATUS_INTERVAL) !== null && _a !== void 0 ? _a : "5000");
const checkStatusIndicatorEnabled = process.env.CHECK_STATUS_INDICATOR_ENABLED === 'true' ? true : false;
const apiClientInstance = axios_1.default.create({
    baseURL: pfSenseApiBaseUrl,
    timeout: 1000,
    httpsAgent: new https_1.default.Agent({
        rejectUnauthorized: false
    })
});
apiClientInstance.interceptors.request.use(function (config) {
    if (config.headers != undefined) {
        config.headers.Authorization = credentialsClientId + ' ' + credentialsClientSecret;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});
function apiRequestTemperature() {
    ledIndicatorApiRequest();
    apiClientInstance.get('/api/v1/status/system')
        .then(function (response) {
        let measuredTemperature = response.data.data.temp_c;
        let maximumReachedThreshold;
        temperatureThresholds.forEach((temperatureThreshold) => {
            if (measuredTemperature >= temperatureThreshold.threshold) {
                maximumReachedThreshold = temperatureThreshold;
            }
        });
        if (maximumReachedThreshold) {
            npmlog_1.default.http('', 'Fetched temperature %d matches threshold >= %d', measuredTemperature, maximumReachedThreshold.threshold);
            blink1.fadeToRGB(1000, maximumReachedThreshold.color.red, maximumReachedThreshold.color.green, maximumReachedThreshold.color.blue, blinkBothLedN);
        }
    })
        .catch(function (error) {
        ledIndicatorError();
        npmlog_1.default.error('', error);
    })
        .then(function () {
    });
}
function ledIndicatorApiRequest() {
    if (checkStatusIndicatorEnabled) {
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
    npmlog_1.default.error('', 'No attached blink(1) devices could be found. Script aborted.');
    process.abort();
}
npmlog_1.default.info('', 'Found blink(1) devices with serials %j ', blink1Devices);
const blink1DeviceSerial = blinkSerial !== null && blinkSerial !== void 0 ? blinkSerial : blink1Devices[0];
npmlog_1.default.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);
var blink1 = new Blink1(blink1DeviceSerial);
setInterval(() => {
    apiRequestTemperature();
}, checkStatusInterval);
