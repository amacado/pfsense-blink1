#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigurationManager_1 = __importDefault(require("./helper/ConfigurationManager"));
const Log_1 = __importDefault(require("./helper/Log"));
const ApiClient_1 = __importDefault(require("./helper/ApiClient"));
const Blink1Service_1 = __importDefault(require("./services/Blink1Service"));
const lodash_1 = __importDefault(require("lodash"));
const Blink1LedIndex_1 = require("./enums/Blink1LedIndex");
Log_1.default.verbose('', 'Import of libraries, types and classes completed.');
Log_1.default.verbose('', 'Start loading configuration and default settings..');
const temperatureThresholds = lodash_1.default.orderBy(ConfigurationManager_1.default.get('indicator:temperatureThresholds'), ['threshold'], 'asc');
const checkStatusInterval = Number.parseInt(ConfigurationManager_1.default.get('api:interval'));
const blink1HotplugEnabled = Boolean(ConfigurationManager_1.default.get('blink1:hotplug'));
const blinkSerial = ConfigurationManager_1.default.get('blink1:serial');
let checkStatusIndicator = Blink1LedIndex_1.Blink1LedIndex[ConfigurationManager_1.default.get('indicator:apiRequest:ledPosition')];
if (checkStatusIndicator == undefined) {
    checkStatusIndicator = Blink1LedIndex_1.Blink1LedIndex.Bottom;
    Log_1.default.warn('', 'Invalid configuration value for indicator:apiRequest:ledPosition, fallback to default value of "%s"', Blink1LedIndex_1.Blink1LedIndex[checkStatusIndicator]);
}
Log_1.default.verbose('', 'Loading configuration and default settings completed.');
function apiRequestTemperature(blink1) {
    return __awaiter(this, void 0, void 0, function* () {
        Log_1.default.verbose('', 'Executing function "%s"', 'apiRequestTemperature');
        ledIndicatorApiRequest(blink1);
        try {
            const response = yield ApiClient_1.default.get('/api/v1/status/system');
            Log_1.default.verbose('', '%j', response.data);
            let responseStatusSystem = response.data.data;
            let measuredTemperature = responseStatusSystem.temp_c;
            let maximumReachedThreshold;
            temperatureThresholds.forEach((temperatureThreshold) => {
                if (measuredTemperature >= temperatureThreshold.threshold) {
                    maximumReachedThreshold = temperatureThreshold;
                }
            });
            if (maximumReachedThreshold) {
                Log_1.default.http('', 'Fetched temperature %d°C matches threshold >= %d°C.', measuredTemperature, maximumReachedThreshold.threshold);
                Log_1.default.verbose('', 'Fade blink(1) to RGB (%d, %d, %d).', maximumReachedThreshold.color.red, maximumReachedThreshold.color.green, maximumReachedThreshold.color.blue);
                blink1.fadeToRGB(1000, maximumReachedThreshold.color.red, maximumReachedThreshold.color.green, maximumReachedThreshold.color.blue, Blink1LedIndex_1.Blink1LedIndex.All);
            }
        }
        catch (exception) {
            ledIndicatorError(blink1);
            if (exception instanceof Error) {
                Log_1.default.error('', exception.message);
            }
        }
    });
}
function ledIndicatorApiRequest(blink1) {
    if (checkStatusIndicator != Blink1LedIndex_1.Blink1LedIndex.None) {
        blink1.fadeToRGB(300, 255, 255, 255, checkStatusIndicator);
    }
}
function ledIndicatorError(blink1) {
    blink1.writePatternLine(200, 255, 0, 0, 0);
    blink1.writePatternLine(200, 0, 0, 0, 1);
    blink1.playLoop(0, 1, 3);
}
Log_1.default.info('', 'Preparing status request interval (%dms)..', checkStatusInterval);
function startApplication() {
    return __awaiter(this, void 0, void 0, function* () {
        Log_1.default.verbose('', 'Executing function %s', 'startApplication');
        const blink1Service = new Blink1Service_1.default(blinkSerial);
        let blink1 = yield blink1Service.getBlink1Device();
        while (true) {
            try {
                if (blink1HotplugEnabled)
                    blink1 = yield blink1Service.getBlink1Device(blink1);
                let isBlink1Available = yield blink1Service.isBlink1Available(blink1);
                Log_1.default.verbose('', 'Result of blink(1) availability test: %j', isBlink1Available);
                if (!isBlink1Available && !blink1HotplugEnabled)
                    process.abort();
                if (isBlink1Available && blink1 != undefined) {
                    yield apiRequestTemperature(blink1);
                }
                else {
                    Log_1.default.verbose('', 'Skipping API request because blink(1) device is not available.');
                }
            }
            catch (exception) {
                if (exception instanceof Error) {
                    Log_1.default.error('', exception.message);
                }
            }
            yield new Promise(f => setTimeout(f, checkStatusInterval));
        }
    });
}
startApplication();
