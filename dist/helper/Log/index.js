"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const npmlog_1 = __importDefault(require("npmlog"));
const ConfigurationManager_1 = __importDefault(require("../ConfigurationManager"));
Object.defineProperty(npmlog_1.default, 'heading', {
    get: () => {
        return new Date().toISOString();
    }
});
npmlog_1.default.headingStyle = { bg: '', fg: 'white' };
npmlog_1.default.level = ConfigurationManager_1.default.get('log:level');
module.exports = npmlog_1.default;
