# pfsense-blink(1)

<br />
<div align="center">
    <img src="https://raw.githubusercontent.com/amacado/pfsense-blink1/main/docs/images/blink1-logo.png" alt="blink(1)" height="60" />
    <img src="https://raw.githubusercontent.com/amacado/pfsense-blink1/main/docs/images/pfsense-logo.png" alt="pfSense®" height="60" />
</div>

### Introduction
Watch your pfSense® firewall temperature with blink(1) using Node.js® runtime

### Quickstart
#### Docker (recommended: [docker-compose.yml](/docker-compose.yml))
```
docker pull ghcr.io/amacado/pfsense-blink1:latest
```

### Requirements
* blink(1) `mk2` or `mk3` by [THINGM](https://blink1.thingm.com/) <br />
  <small>`mk1` does not have two LEDs on both top and bottom which are independently addressable. It might work, but not tested.</small>

### Preparations & setup
The intended deployment of this script is on another machine (or container) than the pfSense®. It's recommended to keep your firewall server as "clean" as possible.

1. Setup [jaredhendrickson13/pfsense-api](https://github.com/jaredhendrickson13/pfsense-api) for [pfSense®](https://www.pfsense.org/)
2. Create an API Token for the REST API (see `jaredhendrickson13/pfsense-api` instructions)
3. Install [libusb](https://libusb.info/) driver `apt-get install libusb-1.0-0` which is required to access the [blink(1)](https://blink1.thingm.com/) device using the node package [sandeepmistry/node-blink1](https://github.com/sandeepmistry/node-blink1)
4. Install `nodejs` (see [nodejs.org](https://nodejs.org/en/))
4. Connect the [blink(1)](https://blink1.thingm.com/) via USB

#### Run the application
1. Copy [`config/config.sample.json5`](/config/config.sample.json5), rename it to `/path/to/config.json5` (default `/config/config.json5`) and paste API credentials and pfSense® URI (see [json5.org](https://json5.org/) for more information about the this next level json project)
2. Adjust settings in `config/config.json5` to your needs. The default values are defined in [`ConfigurationManager`](/src/helper/ConfigurationManager/index.ts)
3. Install and start`pfsense-blink1` application
   ```bash
   npm i pfsense-blink1 -g
   pfsense-blink1 [--config "/path/to/config.json5"]
   ```

### Development or 'Go build yourself'
1. Install `yarn` package manager (see [yarnpkg.com](https://classic.yarnpkg.com/en/))
2. Clone this repository (`gh repo clone amacado/pfsense-blink1`)
5. Execute `yarn install`
6. Execute `yarn serve` for TypeScript watcher
7. Execute `yarn build` to build the project and create production ready project in [/dist/](/dist/)
8. Setup [`pre-push` hook](https://www.atlassian.com/git/tutorials/git-hooks) with following script
   ```shell
   #!/bin/sh
   yarn build
   git add dist/
   git diff-index --quiet HEAD || git commit -m ":octocat: build sources via pre-push hook"
   
   exit 0
   ```

### Publishing new (npm package) version
This project follows [Semantic Versioning 2.0.0](https://semver.org/) with the help of[`np`](https://www.npmjs.com/package/np) CLI tool
to ensure quality.
```bash
yarn global add np
npm install np -g
```

Create a new version and publish (`np` is installed as dev-dependency):
```bash
np
```
### Known problems

##### Error `TypeError: cannot open device with path`

This error may occurs when the current user is not allowed to access the attached blink(1) device:

```bash
TypeError: cannot open device with path /dev/hidraw0
```

If you're running this script in a docker container you might want to check the [bindings](https://forums.balena.io/t/docker-container-cannot-access-dynamically-plugged-usb-devices/4277) and
`mount /dev:/dev` which allows the container to access the device.

##### Error `libusb-1.0.so.0: cannot open shared object file`

```bash
Error: libusb-1.0.so.0: cannot open shared object file: No such file or directory
```

This error occurs if you haven't installed [libusb](https://libusb.info/) driver `apt-get install libusb-1.0-0`.

##### ERR! self signed certificate
```bash
ERR! self signed certificate
```
This error occurs when the SSL certificate which should secure your REST API connection
is self signed. There are two solutions for this problem: Either authorize your SSL certificate
or skip the check by setting configuration option `api.httpsAgent.rejectUnauthorized = false` (see [`/config/config.sample.json5`](/config/config.sample.json5)).

### Credits

Special thanks to these projects:

* [sandeepmistry/node-blink1](https://github.com/sandeepmistry/node-blink1)
* [jaredhendrickson13/pfsense-api](https://github.com/jaredhendrickson13/pfsense-api)

<br /><br />
<div align="center">

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-badges.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/open-source.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/powered-by-black-magic.svg)](https://forthebadge.com)

</div>
