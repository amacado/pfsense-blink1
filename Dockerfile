# syntax=docker/dockerfile:1
FROM node:16.17-alpine
ENV NODE_ENV=production

WORKDIR /app

VOLUME /app/config

# alpine-sdk: essential build tools (like make)
# libusb-dev: required for usb connection (see README.md)
# linux-headers: required for linux/hidraw.h
# libudev-zero-dev: required for libudev.h
RUN apk update && apk add alpine-sdk libusb-dev libudev-zero-dev python3 git pkgconfig linux-headers

# Install typescript for building process
RUN npm install -g typescript

# Clone repository
RUN git clone https://github.com/amacado/pfsense-blink1.git ./

# Install dependencies and build application
RUN yarn install
RUN yarn build
ENTRYPOINT ["node", "./dist/index.js"]




