import axios from 'axios';
import https from 'https';
import ConfigurationManager from '../ConfigurationManager';

const pfSenseApiBaseUrl = ConfigurationManager.get('api:baseUrl');
const credentialsClientId = ConfigurationManager.get('api:client');
const credentialsClientSecret = ConfigurationManager.get('api:token');
const apiHttpsAgentRejectUnauthorized = ConfigurationManager.get('api:httpsAgent:rejectUnauthorized');

const apiClientInstance = axios.create(
    {
        baseURL: pfSenseApiBaseUrl,
        timeout: 1000,
        httpsAgent: new https.Agent(
            {
                rejectUnauthorized: apiHttpsAgentRejectUnauthorized // allow/disallow self sign certificates
            })
    });

apiClientInstance.interceptors.request.use(function (config) {
    if (config.headers != undefined) {
        config.headers.Authorization = credentialsClientId + ' ' + credentialsClientSecret;
    }

    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

export = apiClientInstance;
