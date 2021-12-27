"use strict";
var _a;
const nconf = require('nconf');
nconf.env();
nconf.argv();
const configFile = (_a = nconf.get('config')) !== null && _a !== void 0 ? _a : 'config/config.json5';
nconf.file({ file: configFile, format: require('json5') });
nconf.defaults({
    'blink1': {
        'hotplug': false,
    },
    'api': {
        'interval': 5000,
        'timeout': 5000,
        'httpsAgent': {
            'rejectUnauthorized': true
        }
    },
    'indicator': {
        'temperatureThresholds': [
            { threshold: 0, color: { red: 36, green: 189, blue: 46 } },
            { threshold: 60, color: { red: 246, green: 225, blue: 36 } },
            { threshold: 70, color: { red: 188, green: 19, blue: 18 } },
        ],
        'apiRequest': {
            'ledPosition': 'Bottom'
        }
    },
    'log': {
        'level': 'info'
    }
});
nconf.required(['api:baseUrl', 'api:client', 'api:token']);
module.exports = nconf;
