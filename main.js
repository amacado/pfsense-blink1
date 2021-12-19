const async  = require('async');
const https  = require('https');
const axios  = require('axios').default;
const Blink1 = require('node-blink1');
const env    = require('dotenv').config()
const log    = require('npmlog')

const blinkTopLedN    = 1;
const blinkBottomLedN = 2;
const blinkBothLedN   = 0;

// setup date string for logging https://github.com/npm/npmlog/issues/33#issuecomment-342785666
Object.defineProperty(log, 'heading', {
    get: () => {
        return new Date().toISOString()
    }
})
log.headingStyle = {bg: '', fg: 'white'}

const temperatureThresholds = {
    50: {r: 36, g: 189, b: 46}, // green
    60: {r: 246, g: 225, b: 36}, // yellow
    70: {r: 188, g: 19, b: 19}, // red
}

if (env.error) {
    throw env.error
}

const pfSenseApiBaseUrl           = env.parsed.PFSENSE_API_BASE_URL;
const credentialsClientId         = env.parsed.PFSENSE_API_CLIENT;
const credentialsClientSecret     = env.parsed.PFSENSE_API_TOKEN;
const checkStatusInterval         = env.parsed.CHECK_STATUS_INTERVAL;
const checkStatusIndicatorEnabled = env.parsed.CHECK_STATUS_INDICATOR_ENABLED === 'true' ? true : false;

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
    config.headers.Authorization = credentialsClientId + ' ' + credentialsClientSecret;
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
            let measuredTemperature     = response.data.data.temp_c;
            let maximumReachedThreshold = null;
            for (let threshold in temperatureThresholds) {
                if (measuredTemperature >= threshold) {
                    maximumReachedThreshold = threshold;
                }
            }

            log.http('', 'Fetched temperature %d matches threshold >= %d', measuredTemperature, maximumReachedThreshold);
            blink1.fadeToRGB(1000,
                             temperatureThresholds[maximumReachedThreshold].r,
                             temperatureThresholds[maximumReachedThreshold].g,
                             temperatureThresholds[maximumReachedThreshold].b,
                             blinkBothLedN);

        })
        .catch(function (error) {
            // handle error
            ledIndicatorError();
            log.error(error);

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
    log.error('No attached blink(1) devices could be found. Script aborted.');
    return;
}

log.info('', 'Found blink(1) devices %j serials', blink1Devices);

const blink1DeviceSerial = blink1Devices[0];
log.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);

var blink1 = new Blink1(blink1DeviceSerial);

setInterval(() => {
    apiRequestTemperature();
}, checkStatusInterval)

