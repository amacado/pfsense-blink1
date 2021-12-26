import ConfigurationManager from './helper/ConfigurationManager';
import Log from './helper/Log';
import apiClientInstance from './helper/ApiClient';
import Blink1 = require('node-blink1');

import _ from 'lodash';
import {TemperatureThreshold} from './types/TemperatureThreshold';
import {Blink1LedIndex} from './enums/Blink1LedIndex';
import {StatusSystem} from './types/StatusSystem';
import {AxiosResponse} from 'axios';

Log.verbose('', 'Import completed');

//#region Configuration

Log.verbose('', 'Start loading configuration and default settings..');

// load temperature thresholds and order them by ascending threshold to ensure the loop through those values work
const temperatureThresholds: TemperatureThreshold[] = _.orderBy(ConfigurationManager.get('indicator:temperatureThresholds'), ['threshold'], 'asc');
const checkStatusInterval: number = Number.parseInt(ConfigurationManager.get('api:interval'));
const blink1HotplugEnabled: boolean = Boolean(ConfigurationManager.get('blink1:hotplug'));

let checkStatusIndicator: Blink1LedIndex = (<any>Blink1LedIndex)[ConfigurationManager.get('indicator:apiRequest:ledPosition')];
if (checkStatusIndicator == undefined) {
    checkStatusIndicator = Blink1LedIndex.Bottom; // default value when parsing fails
    Log.warn('', 'Invalid configuration value for indicator:apiRequest:ledPosition, fallback to default value of "%s"', Blink1LedIndex[checkStatusIndicator])
}


Log.verbose('', 'Loading configuration and default settings completed.');

//#endregion Configuration

async function getBlink1Device(fallback?: Blink1 | undefined): Promise<Blink1 | undefined> {
    Log.verbose('', 'Executing function "%s"', 'getBlink1Device');

    try {
        const blink1Devices = Blink1.devices();
        Log.info('', 'Found %d blink(1) devices with serials %j ', blink1Devices.length, blink1Devices);

        const blinkSerial = ConfigurationManager.get('blink1:serial');

        // determine blink device serial based on user setting or default value (the first device found)
        const blink1DeviceSerial: string = blinkSerial ?? blink1Devices[0];
        if (blink1Devices.length == 0) {
            // throwing this error will abort further processing (if no device could be found; even when removed via hotplug)
            throw new Error('No attached blink(1) devices could be found.');
            if (blink1HotplugEnabled == false) {
                process.abort();
            }
        }

        // If hotplug mode is enabled we must close the existing connection to the
        // blink(1) device before we can create a new connection using the Blink() constructor
        if (fallback != undefined) {
            Log.verbose('', 'Try to close existing blink(1) device connection to allow hotplug')
            fallback.close();
        }

        // Create USB connection to the blink(1) device
        const blink1: Blink1 = new Blink1(blink1DeviceSerial);
        Log.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);

        // Print version number of blink(1) device for debugging purposes
        blink1.version(function (version: number) {
            Log.verbose('', 'Version number of blink(1) device: %d', version.toString())
        });

        return blink1;

    } catch (exception: unknown) {
        if (exception instanceof Error) {
            Log.warn('', exception.message);
        }
    }

    // if any error has occurred during connection
    // creation with blink(1) device, return unknown as response type
    return undefined;
}

async function apiRequestTemperature(blink1: Blink1) {
    Log.verbose('', 'Executing function "%s"', 'apiRequestTemperature');
    ledIndicatorApiRequest(blink1);

    try {
        const response: AxiosResponse = await apiClientInstance.get('/api/v1/status/system');
        Log.verbose('', '%j', response.data)

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
    } catch (exception: unknown) {
        ledIndicatorError(blink1);
        if (exception instanceof Error) {
            Log.error('', exception.message);
            // Log.verbose('', exception.)
        }
    }
}

function ledIndicatorApiRequest(blink1: Blink1) {
    if (checkStatusIndicator != Blink1LedIndex.None) {
        // Set LED to a bright, flashing white indicating a API request beeing performed
        blink1.fadeToRGB(300, 255, 255, 255, checkStatusIndicator);
    }
}

function ledIndicatorError(blink1: Blink1) {
    blink1.writePatternLine(200, 255, 0, 0, 0);
    blink1.writePatternLine(200, 0, 0, 0, 1);
    blink1.playLoop(0, 1, 3);
}

//#region Script execution


Log.info('', 'Preparing status request interval (%dms)..', checkStatusInterval)

// Infinite loop to call the API and react on thresholds
async function startApplication() {
    Log.verbose('', 'Executing function %s', 'startApplication');

    let blink1: Blink1 | undefined = await getBlink1Device();

    while (true) {
        try {

            // (Re)create connection to blink(1) device; unknown
            // will be returned when connection could not be established. It must
            // be the first action in the loop because further processing requires a valid
            // blink(1) device connection
            if (blink1HotplugEnabled) {
                blink1 = await getBlink1Device(blink1);
            }

            if (blink1 != undefined) {
                await apiRequestTemperature(blink1);
            } else {
                Log.verbose('', 'Skipping API request because blink(1) device is not available');
            }


        } catch (exception: unknown) {
            if (exception instanceof Error) {
                Log.error('', exception.message);
            }
        }

        // Delay next loop iteration by the user defined interval
        await new Promise(f => setTimeout(f, checkStatusInterval));
    }
}

startApplication();

//#endregion Script execution

