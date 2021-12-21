import ConfigurationManager from './helper/ConfigurationManager';
import Log from './helper/Log';
import apiClientInstance from './helper/ApiClient';
import Blink1 from './types/Blink1';
import {TemperatureThreshold} from './types/TemperatureThreshold';
import {Blink1LedPosition} from './enums/Blink1LedPosition';

const temperatureThresholds: TemperatureThreshold[] = [
    {threshold: 50, color: {red: 36, green: 189, blue: 46}}, // green
    {threshold: 60, color: {red: 246, green: 225, blue: 36}}, // yellow
    {threshold: 70, color: {red: 188, green: 19, blue: 19}}, // red
]

const blinkSerial = ConfigurationManager.get('blink1:serial')
const checkStatusInterval: number = Number.parseInt(ConfigurationManager.get('api:interval'));

let checkStatusIndicator: Blink1LedPosition = (<any>Blink1LedPosition)[ConfigurationManager.get('indicator:apiRequest:ledPosition')];
if (checkStatusIndicator == undefined) {
    checkStatusIndicator = Blink1LedPosition.Bottom; // default value when parsing fails
    Log.warn('', 'Invalid configuration value for CHECK_STATUS_INDICATOR, fallback to default value of "%s"', Blink1LedPosition[checkStatusIndicator])
}


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
                Log.http('', 'Fetched temperature %d matches threshold >= %d', measuredTemperature, maximumReachedThreshold.threshold);

                blink1.fadeToRGB(1000,
                    maximumReachedThreshold.color.red,
                    maximumReachedThreshold.color.green,
                    maximumReachedThreshold.color.blue,
                    Blink1LedPosition.All);
            }
        })
        .catch(function (error) {
            // handle error
            ledIndicatorError();
            Log.error('', error);

        })
        .then(function () {
            // always executed
        });
}

function ledIndicatorApiRequest() {
    if (checkStatusIndicator != Blink1LedPosition.None) {
        // Set bottom LED to a bright, flashing white indicating a API request beeing performed
        blink1.fadeToRGB(300, 255, 255, 255, checkStatusIndicator);
    }
}

function ledIndicatorError() {
    blink1.writePatternLine(200, 255, 0, 0, 0);
    blink1.writePatternLine(200, 0, 0, 0, 1);
    blink1.playLoop(0, 1, 3);
}

const blink1Devices = Blink1.devices();
if (blink1Devices.length == 0) {
    Log.error('', 'No attached blink(1) devices could be found. Script aborted.');
    process.abort();
}

Log.info('', 'Found blink(1) devices with serials %j ', blink1Devices);

const blink1DeviceSerial: string = blinkSerial ?? blink1Devices[0];
Log.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);

var blink1 = new Blink1(blink1DeviceSerial);

setInterval(() => {
    apiRequestTemperature();
}, checkStatusInterval)

