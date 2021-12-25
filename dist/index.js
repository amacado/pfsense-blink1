"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigurationManager_1 = __importDefault(require("./helper/ConfigurationManager"));
const Log_1 = __importDefault(require("./helper/Log"));
const ApiClient_1 = __importDefault(require("./helper/ApiClient"));
const Blink1 = require("node-blink1");
const lodash_1 = __importDefault(require("lodash"));
const Blink1LedIndex_1 = require("./enums/Blink1LedIndex");
Log_1.default.verbose('', 'Import completed');
Log_1.default.verbose('', 'Start loading configuration and default settings..');
const temperatureThresholds = lodash_1.default.orderBy(ConfigurationManager_1.default.get('indicator:temperatureThresholds'), ['threshold'], 'asc');
const blinkSerial = ConfigurationManager_1.default.get('blink1:serial');
const checkStatusInterval = Number.parseInt(ConfigurationManager_1.default.get('api:interval'));
let checkStatusIndicator = Blink1LedIndex_1.Blink1LedIndex[ConfigurationManager_1.default.get('indicator:apiRequest:ledPosition')];
if (checkStatusIndicator == undefined) {
    checkStatusIndicator = Blink1LedIndex_1.Blink1LedIndex.Bottom;
    Log_1.default.warn('', 'Invalid configuration value for indicator:apiRequest:ledPosition, fallback to default value of "%s"', Blink1LedIndex_1.Blink1LedIndex[checkStatusIndicator]);
}
const blink1Devices = Blink1.devices();
if (blink1Devices.length == 0) {
    Log_1.default.error('', 'No attached blink(1) devices could be found. Script aborted.');
    process.abort();
}
const blink1DeviceSerial = blinkSerial !== null && blinkSerial !== void 0 ? blinkSerial : blink1Devices[0];
const blink1 = new Blink1(blink1DeviceSerial);
Log_1.default.verbose('', 'Loading configuration and default settings completed.');
function apiRequestTemperature() {
    ledIndicatorApiRequest();
    ApiClient_1.default.get('/api/v1/status/system')
        .then(function (response) {
        let responseStatusSystem = response.data.data;
        let measuredTemperature = responseStatusSystem.temp_c;
        let maximumReachedThreshold;
        temperatureThresholds.forEach((temperatureThreshold) => {
            if (measuredTemperature >= temperatureThreshold.threshold) {
                maximumReachedThreshold = temperatureThreshold;
            }
        });
        if (maximumReachedThreshold) {
            Log_1.default.http('', 'Fetched temperature %d°C matches threshold >= %d°C', measuredTemperature, maximumReachedThreshold.threshold);
            Log_1.default.verbose('', 'Fade blink(1) to RGB (%d, %d, %d)', maximumReachedThreshold.color.red, maximumReachedThreshold.color.green, maximumReachedThreshold.color.blue);
            blink1.fadeToRGB(1000, maximumReachedThreshold.color.red, maximumReachedThreshold.color.green, maximumReachedThreshold.color.blue, Blink1LedIndex_1.Blink1LedIndex.All);
        }
    })
        .catch(function (error) {
        ledIndicatorError();
        Log_1.default.error('', error.message);
        Log_1.default.verbose('', error);
    });
}
function ledIndicatorApiRequest() {
    if (checkStatusIndicator != Blink1LedIndex_1.Blink1LedIndex.None) {
        blink1.fadeToRGB(300, 255, 255, 255, checkStatusIndicator);
    }
}
function ledIndicatorError() {
    blink1.writePatternLine(200, 255, 0, 0, 0);
    blink1.writePatternLine(200, 0, 0, 0, 1);
    blink1.playLoop(0, 1, 3);
}
Log_1.default.info('', 'Found %d blink(1) devices with serials %j ', blink1Devices.length, blink1Devices);
Log_1.default.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);
blink1.version(function (version) {
    Log_1.default.verbose('', 'Version number of blink(1) device: %d', version.toString());
});
Log_1.default.info('', 'Preparing status request interval (%dms)..', checkStatusInterval);
setInterval(() => {
    apiRequestTemperature();
}, checkStatusInterval);
