"use strict";
const nconf = require('nconf');
nconf.env();
nconf.argv();
nconf.file({ file: 'config/config.json5', format: require('json5') });
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
module.exports = nconf;
