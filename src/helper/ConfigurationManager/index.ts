const nconf = require('nconf');

nconf.env(); // allow `process.env` to override
nconf.argv(); // allow `process.argv` to override
nconf.file({file: 'config/config.json5', format: require('json5')}); // load configuration from file

// default values for configuration (see config/config.sample.json5 for
// parameter description
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
            {threshold: 0, color: {red: 36, green: 189, blue: 46}},  // green
            {threshold: 60, color: {red: 246, green: 225, blue: 36}}, // yellow
            {threshold: 70, color: {red: 188, green: 19, blue: 18}},  // red
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

export = nconf;
