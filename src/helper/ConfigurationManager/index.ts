const nconf = require('nconf');

nconf.env(); // allow `process.env` to override
nconf.argv(); // allow `process.argv` to override
nconf.file({file: 'config/config.json5', format: require('json5')}); // load configuration from file

// default values for configuration (see config/config.sample.json5 for
// parameter description
nconf.defaults({
    'api': {
        'interval': 5000
    },
    'indicator': {
        'apiRequest': {
            'ledPosition': 'Bottom'
        }
    }
});

nconf.required(['api:baseUrl', 'api:client', 'api:token']);

export = nconf;
