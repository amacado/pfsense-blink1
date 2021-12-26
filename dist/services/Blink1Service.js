"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = __importDefault(require("../helper/Log"));
const Blink1 = require("node-blink1");
class Blink1Service {
    constructor(deviceSerial = null) {
        this.deviceSerial = deviceSerial;
    }
    getBlink1Device(currentBlink1) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            Log_1.default.verbose('', 'Executing function "%s"', 'getBlink1Device');
            try {
                const blink1Devices = Blink1.devices();
                Log_1.default.info('', 'Found %d blink(1) devices with serials %j ', blink1Devices.length, blink1Devices);
                const blink1DeviceSerial = (_a = this.deviceSerial) !== null && _a !== void 0 ? _a : blink1Devices[0];
                if (blink1Devices.length == 0) {
                    throw new Error('No attached blink(1) devices could be found.');
                }
                if (currentBlink1 != undefined) {
                    Log_1.default.verbose('', 'Try to close existing blink(1) device connection to allow hotplug');
                    currentBlink1.close();
                }
                const blink1 = new Blink1(blink1DeviceSerial);
                Log_1.default.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);
                blink1.version(function (version) {
                    Log_1.default.verbose('', 'Version number of blink(1) device: %d', version.toString());
                });
                return blink1;
            }
            catch (exception) {
                if (exception instanceof Error) {
                    Log_1.default.warn('', exception.message);
                }
            }
            return undefined;
        });
    }
    isBlink1Available(blink1) {
        return __awaiter(this, void 0, void 0, function* () {
            Log_1.default.verbose('', 'Executing function "%s"', 'isBlink1Available');
            if (blink1 == undefined)
                return false;
            try {
                blink1.version((version) => { });
            }
            catch (exception) {
                if (exception instanceof Error)
                    Log_1.default.error('', 'Version of blink(1) could not be read (device is not available): %s', exception.message);
                return false;
            }
            return true;
        });
    }
}
exports.default = Blink1Service;
