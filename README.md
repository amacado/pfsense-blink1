sudo apt-get install libusb-1.0-0
yarn install


Docker:
TypeError: cannot open device with path /dev/hidraw0
https://forums.balena.io/t/docker-container-cannot-access-dynamically-plugged-usb-devices/4277

bind mount /dev/hidraw0 to /dev/hidraw0

Credits
https://github.com/sandeepmistry/node-blink1
