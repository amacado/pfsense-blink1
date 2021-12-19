const async  = require('async');
const https  = require('https');
const axios  = require('axios').default;
const Blink1 = require('node-blink1');
const env    = require('dotenv').config()

const temperatureThresholds = {
    50: {r: 36, g: 189, b: 46}, // green
    60: {r: 246, g: 225, b: 36}, // yellow
    70: {r: 188, g: 19, b: 19}, // red
}

if (env.error) {
    throw env.error
}

const pfSenseApiBaseUrl       = env.parsed.PFSENSE_API_BASE_URL;
const credentialsClientId     = env.parsed.PFSENSE_API_CLIENT;
const credentialsClientSecret = env.parsed.PFSENSE_API_TOKEN;

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
    apiClientInstance.get('/api/v1/status/system')
        .then(function (response) {
            // handle success
            console.log(response);

            let measuredTemperature     = response.data.data.temp_c;
            let maximumReachedThreshold = null;
            for (let threshold in temperatureThresholds) {
                if (measuredTemperature >= threshold) {
                    maximumReachedThreshold = threshold;
                }
            }

            console.log(measuredTemperature + ' -- ' + maximumReachedThreshold);
            blink1.fadeToRGB(2000, temperatureThresholds[maximumReachedThreshold].r, temperatureThresholds[maximumReachedThreshold].g, temperatureThresholds[maximumReachedThreshold].b);

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

console.log(Blink1.devices());
var blink1 = new Blink1();

setInterval(() => {
    apiRequestTemperature();
}, 2000)


/*

async.series([
                 function (callback) {
                     console.log('version');
                     blink1.version(function (version) {
                         console.log('\t' + version);

                         callback();
                     });
                 },
                 function (callback) {
                     console.log('fadeToRGB');
                     var millis = 1000;

                     blink1.fadeToRGB(millis, 255, 255, 255, function () {
                         console.log('\tdone');
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('rgb');
                     blink1.rgb(function (r, g, b) {
                         console.log('\t' + r + ', ' + g + ', ' + b);
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('fadeToRGB 1');
                     var millis = 1000;

                     blink1.fadeToRGB(millis, 255, 0, 0, 1, function () {
                         console.log('\tdone');
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('rgb 1');
                     blink1.rgb(1, function (r, g, b) {
                         console.log('\t' + r + ', ' + g + ', ' + b);
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('rgb 2');
                     blink1.rgb(2, function (r, g, b) {
                         console.log('\t' + r + ', ' + g + ', ' + b);
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('fadeToRGB 2');
                     var millis = 1000;

                     blink1.fadeToRGB(millis, 0, 255, 0, 2, function () {
                         console.log('\tdone');
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('rgb 1');
                     blink1.rgb(1, function (r, g, b) {
                         console.log('\t' + r + ', ' + g + ', ' + b);
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('rgb 2');
                     blink1.rgb(2, function (r, g, b) {
                         console.log('\t' + r + ', ' + g + ', ' + b);
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('setRGB');
                     blink1.setRGB(0, 0, 255, function () {
                         console.log('\tdone');
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('rgb');
                     blink1.rgb(0, function (r, g, b) {
                         console.log('\t' + r + ', ' + g + ', ' + b);
                         callback();
                     });
                 },
                 function (callback) {
                     console.log('off');
                     blink1.off(function () {
                         console.log('\tdone');

                         callback();
                     });
                 },
                 function () {
                     process.exit(0);
                 }
             ]);

 */
