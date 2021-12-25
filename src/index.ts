import ConfigurationManager from './helper/ConfigurationManager';
import Log from './helper/Log';
import apiClientInstance from './helper/ApiClient';
import Blink1 = require('node-blink1');

import _ from 'lodash';
import {TemperatureThreshold} from './types/TemperatureThreshold';
import {Blink1LedIndex} from './enums/Blink1LedIndex';
import {StatusSystem} from './types/StatusSystem';

Log.verbose('', 'Import completed');

//#region Configuration

Log.verbose('', 'Start loading configuration and default settings..');

// load temperature thresholds and order them by ascending threshold to ensure the loop through those values work
const temperatureThresholds: TemperatureThreshold[] = _.orderBy(ConfigurationManager.get('indicator:temperatureThresholds'), ['threshold'], 'asc');
const blinkSerial = ConfigurationManager.get('blink1:serial')
const checkStatusInterval: number = Number.parseInt(ConfigurationManager.get('api:interval'));

let checkStatusIndicator: Blink1LedIndex = (<any>Blink1LedIndex)[ConfigurationManager.get('indicator:apiRequest:ledPosition')];
if (checkStatusIndicator == undefined) {
    checkStatusIndicator = Blink1LedIndex.Bottom; // default value when parsing fails
    Log.warn('', 'Invalid configuration value for indicator:apiRequest:ledPosition, fallback to default value of "%s"', Blink1LedIndex[checkStatusIndicator])
}

const blink1Devices = Blink1.devices();
if (blink1Devices.length == 0) {
    Log.error('', 'No attached blink(1) devices could be found. Script aborted.');
    process.abort();
}

// determine blink device serial based on user setting or default value (the first device found)
const blink1DeviceSerial: string = blinkSerial ?? blink1Devices[0];
const blink1 = new Blink1(blink1DeviceSerial);

Log.verbose('', 'Loading configuration and default settings completed.');

//#endregion Configuration

function apiRequestTemperature() {
    ledIndicatorApiRequest();

    apiClientInstance.get('/api/v1/status/system')
        .then(function (response) {
            let responseStatusSystem: StatusSystem = response.data.data;

            // handle success
            let measuredTemperature = responseStatusSystem.temp_c;
            let maximumReachedThreshold: TemperatureThreshold | undefined;

            temperatureThresholds.forEach((temperatureThreshold) => {
                if (measuredTemperature >= temperatureThreshold.threshold) {
                    maximumReachedThreshold = temperatureThreshold;
                }
            })

            if (maximumReachedThreshold) {
                Log.http('', 'Fetched temperature %d°C matches threshold >= %d°C', measuredTemperature, maximumReachedThreshold.threshold);
                Log.verbose('', 'Fade blink(1) to RGB (%d, %d, %d)', maximumReachedThreshold.color.red, maximumReachedThreshold.color.green, maximumReachedThreshold.color.blue);

                blink1.fadeToRGB(1000,
                    maximumReachedThreshold.color.red,
                    maximumReachedThreshold.color.green,
                    maximumReachedThreshold.color.blue,
                    Blink1LedIndex.All);
            }
        })
        .catch(function (error) {
            // handle error
            ledIndicatorError();
            Log.error('', error.message);
            Log.verbose('', error)
        });
}

function ledIndicatorApiRequest() {
    if (checkStatusIndicator != Blink1LedIndex.None) {
        // Set bottom LED to a bright, flashing white indicating a API request beeing performed
        blink1.fadeToRGB(300, 255, 255, 255, checkStatusIndicator);
    }
}

function ledIndicatorError() {
    blink1.writePatternLine(200, 255, 0, 0, 0);
    blink1.writePatternLine(200, 0, 0, 0, 1);
    blink1.playLoop(0, 1, 3);
}

//#region Script execution

Log.info('', 'Found %d blink(1) devices with serials %j ', blink1Devices.length, blink1Devices);
Log.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);
blink1.version(function (version: number) {
    Log.verbose('', 'Version number of blink(1) device: %d', version.toString())
});

Log.info('', 'Preparing status request interval (%dms)..', checkStatusInterval)

// Infinite loop to call the API and react on thresholds
setInterval(() => {
    apiRequestTemperature();
}, checkStatusInterval)

//#endregion Script execution

