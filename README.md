# pfsense-blink(1)

<br />
<div align="center">
    <img src="/docs/images/blink1-logo.png" alt="blink(1)" height="60" />
    <img src="/docs/images/pfsense-logo.png" alt="pfsense" height="60" />
</div>

### Introduction
:todo:

### Preperations & setup
1. Setup [jaredhendrickson13/pfsense-api](https://github.com/jaredhendrickson13/pfsense-api) for [pfsense](https://www.pfsense.org/)
2. Create an API Token for the REST API (see `jaredhendrickson13/pfsense-api` instructions)
3. Install [libusb](https://libusb.info/) driver `apt-get install libusb-1.0-0` which is required to access the [blink(1)](https://blink1.thingm.com/) device using the node package [sandeepmistry/node-blink1](https://github.com/sandeepmistry/node-blink1)
4. Install `nodejs` (see [nodejs.org](https://nodejs.org/en/))
4. Connect the [blink(1)](https://blink1.thingm.com/) via USB
5. Clone this repository (`gh repo clone amacado/pfsense-blink`)
6. `yarn install`
7. Copy [.env.sample](/.env.sample), rename it to `.env` and paste API credentials and pfsense URI
7. Run the app using `yarn run start` (or `node main.js`)

### Known problems
##### Error `TypeError: cannot open device with path`
This error may occurs when the current user is not allowed to access the
attached blink(1) device:
```bash
TypeError: cannot open device with path /dev/hidraw0
```
If you're running this script in a docker container you might want to check
the [bindings](https://forums.balena.io/t/docker-container-cannot-access-dynamically-plugged-usb-devices/4277) and
`mount /dev:/dev` which allows the container to access the device.


### Credits
Special thanks to this projects:
* [sandeepmistry/node-blink1](https://github.com/sandeepmistry/node-blink1)
* [jaredhendrickson13/pfsense-api](https://github.com/jaredhendrickson13/pfsense-api)

<br /><br />
<div align="center">

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-badges.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/open-source.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/powered-by-black-magic.svg)](https://forthebadge.com)

</div>
