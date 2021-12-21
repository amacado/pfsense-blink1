import axios from 'axios';
import https from 'https';

const pfSenseApiBaseUrl = process.env.PFSENSE_API_BASE_URL;
const credentialsClientId = process.env.PFSENSE_API_CLIENT;
const credentialsClientSecret = process.env.PFSENSE_API_TOKEN;

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
    if (config.headers != undefined) {
        config.headers.Authorization = credentialsClientId + ' ' + credentialsClientSecret;
    }

    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

export = apiClientInstance;
