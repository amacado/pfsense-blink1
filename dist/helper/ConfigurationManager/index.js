"use strict";
const nconf = require('nconf');
nconf.env();
nconf.argv();
nconf.file({ file: 'config/config.json5', format: require('json5') });
nconf.defaults({
    'api': {
        'interval': 5000,
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
