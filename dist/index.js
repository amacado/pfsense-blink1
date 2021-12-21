"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigurationManager_1 = __importDefault(require("./helper/ConfigurationManager"));
const Log_1 = __importDefault(require("./helper/Log"));
const ApiClient_1 = __importDefault(require("./helper/ApiClient"));
const Blink1_1 = __importDefault(require("./types/Blink1"));
const Blink1LedPosition_1 = require("./enums/Blink1LedPosition");
const temperatureThresholds = [
    { threshold: 50, color: { red: 36, green: 189, blue: 46 } },
    { threshold: 60, color: { red: 246, green: 225, blue: 36 } },
    { threshold: 70, color: { red: 188, green: 19, blue: 18 } },
];
const blinkSerial = ConfigurationManager_1.default.get('blink1:serial');
const checkStatusInterval = Number.parseInt(ConfigurationManager_1.default.get('api:interval'));
let checkStatusIndicator = Blink1LedPosition_1.Blink1LedPosition[ConfigurationManager_1.default.get('indicator:apiRequest:ledPosition')];
if (checkStatusIndicator == undefined) {
    checkStatusIndicator = Blink1LedPosition_1.Blink1LedPosition.Bottom;
    Log_1.default.warn('', 'Invalid configuration value for CHECK_STATUS_INDICATOR, fallback to default value of "%s"', Blink1LedPosition_1.Blink1LedPosition[checkStatusIndicator]);
}
function apiRequestTemperature() {
    ledIndicatorApiRequest();
    ApiClient_1.default.get('/api/v1/status/system')
        .then(function (response) {
        let measuredTemperature = response.data.data.temp_c;
        let maximumReachedThreshold;
        temperatureThresholds.forEach((temperatureThreshold) => {
            if (measuredTemperature >= temperatureThreshold.threshold) {
                maximumReachedThreshold = temperatureThreshold;
            }
        });
        if (maximumReachedThreshold) {
            Log_1.default.http('', 'Fetched temperature %d matches threshold >= %d', measuredTemperature, maximumReachedThreshold.threshold);
            blink1.fadeToRGB(1000, maximumReachedThreshold.color.red, maximumReachedThreshold.color.green, maximumReachedThreshold.color.blue, Blink1LedPosition_1.Blink1LedPosition.All);
        }
    })
        .catch(function (error) {
        ledIndicatorError();
        Log_1.default.error('', error);
    })
        .then(function () {
    });
}
function ledIndicatorApiRequest() {
    if (checkStatusIndicator != Blink1LedPosition_1.Blink1LedPosition.None) {
        blink1.fadeToRGB(300, 255, 255, 255, checkStatusIndicator);
    }
}
function ledIndicatorError() {
    blink1.writePatternLine(200, 255, 0, 0, 0);
    blink1.writePatternLine(200, 0, 0, 0, 1);
    blink1.playLoop(0, 1, 3);
}
const blink1Devices = Blink1_1.default.devices();
if (blink1Devices.length == 0) {
    Log_1.default.error('', 'No attached blink(1) devices could be found. Script aborted.');
    process.abort();
}
Log_1.default.info('', 'Found blink(1) devices with serials %j ', blink1Devices);
const blink1DeviceSerial = blinkSerial !== null && blinkSerial !== void 0 ? blinkSerial : blink1Devices[0];
Log_1.default.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);
var blink1 = new Blink1_1.default(blink1DeviceSerial);
setInterval(() => {
    apiRequestTemperature();
}, checkStatusInterval);
