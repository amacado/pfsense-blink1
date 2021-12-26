import Log from '../helper/Log';
import Blink1 = require('node-blink1');

/**
 * This service class wraps methods on blink(1) device
 * interaction (like connection establishing)
 */
export default class Blink1Service {

    private deviceSerial: string | null;

    /**
     * Constructor of Blink1Service
     *
     * @param deviceSerial If passed the connection to blink(1) device will be established using a specific serial no; If no serial is passed the first device will be used
     */
    constructor(deviceSerial: string | null = null) {
        this.deviceSerial = deviceSerial;
    }

    /**
     * Establish a connection with a blink(1) device using the @see {@link deviceSerial}.
     * Executing this method will try to create a connection with a plugged blink(1) device.
     * If an existing connection is passed as parameter the connection will be closed and re-established.
     *
     * @param currentBlink1 If an blink(1) connection already has been created pass it as a parameter. This is especially required for hotplug functionality
     */
    public async getBlink1Device(currentBlink1?: Blink1 | undefined): Promise<Blink1 | undefined> {
        Log.verbose('', 'Executing function "%s"', 'getBlink1Device');

        try {

            const blink1Devices = Blink1.devices();
            Log.info('', 'Found %d blink(1) devices with serials %j ', blink1Devices.length, blink1Devices);

            // determine blink device serial based on user setting or default value (the first device found)
            const blink1DeviceSerial: string = this.deviceSerial ?? blink1Devices[0];
            if (blink1Devices.length == 0) {
                // throwing this error will abort further processing
                throw new Error('No attached blink(1) devices could be found.');
            }

            // If hotplug mode is enabled we must close the existing connection to the
            // blink(1) device before we can create a new connection using the Blink() constructor
            if (currentBlink1 != undefined) {
                Log.verbose('', 'Try to close existing blink(1) device connection to allow hotplug')
                currentBlink1.close();
            }

            // Create USB connection to the blink(1) device
            const blink1: Blink1 = new Blink1(blink1DeviceSerial);
            Log.info('', 'Using blink(1) device with serial %s', blink1DeviceSerial);

            // Print version number of blink(1) device for debugging purposes
            blink1.version(function (version: number) {
                Log.verbose('', 'Version number of blink(1) device: %d', version.toString())
            });

            return blink1;

        } catch (exception: unknown) {
            if (exception instanceof Error) {
                Log.warn('', exception.message);
            }
        }

        // if any error has occurred during connection
        // creation with blink(1) device, return unknown as response type
        return undefined;
    }

    /**
     * Check if given blink(1) device is available and commands
     * can be send to the device.
     * The check is performed using a "dummy" command executed
     * on the blink(1) device. If no/invalid answer is returned the device
     * will be marked as unavailable.
     *
     * @param blink1 blink(1) device which is about to be checked
     */
    public async isBlink1Available(blink1: Blink1 | undefined): Promise<boolean> {
        Log.verbose('', 'Executing function "%s"', 'isBlink1Available');

        // If blink1 is undefined it's not available
        if (blink1 == undefined) return false;

        try {
            // Try fetching the version of blink(1) device to ensure
            // connection can be established
            blink1.version((version) => {});

        } catch (exception: unknown) {
            if (exception instanceof Error) Log.error('', 'Version of blink(1) could not be read (device is not available): %s', exception.message);
            return false
        }

        return true
    }
}
