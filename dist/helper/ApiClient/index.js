"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const ConfigurationManager_1 = __importDefault(require("../ConfigurationManager"));
const pfSenseApiBaseUrl = ConfigurationManager_1.default.get('api:baseUrl');
const credentialsClientId = ConfigurationManager_1.default.get('api:client');
const credentialsClientSecret = ConfigurationManager_1.default.get('api:token');
const apiHttpsAgentRejectUnauthorized = ConfigurationManager_1.default.get('api:httpsAgent:rejectUnauthorized');
const apiTimeout = ConfigurationManager_1.default.get('api:timeout');
const apiClientInstance = axios_1.default.create({
    baseURL: pfSenseApiBaseUrl,
    timeout: apiTimeout,
    httpsAgent: new https_1.default.Agent({
        rejectUnauthorized: apiHttpsAgentRejectUnauthorized
    })
});
apiClientInstance.interceptors.request.use(function (config) {
    if (config.headers != undefined) {
        config.headers.Authorization = credentialsClientId + ' ' + credentialsClientSecret;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});
module.exports = apiClientInstance;
