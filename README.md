# palava | web

[palava.tv](https://palava.tv) is a cost-free, simple to use, secure, and open source platform for video calls, built on top of the [WebRTC](https://webrtc.org/) technology.

This repository contains the current front-end web application of palava.tv. There is an overview of all parts of palava.tv at [palavatv/palava](https://github.com/palavatv/palava).

## Setup

Make sure you have Node.js installed. Then run:

    $ npm install

Start the development server on http://localhost:3000:

    $ npm run dev

To build the static production version:

    $ npm run build

To preview the production build locally:

    $ npm run preview

## Configuration

The following variables can be configured as environment variables or via an `.env.local` file:

### `VUE_APP_RTC_URL`

Sets the location of the palava signaling server. By default, it tries to reach a local [signaltower](https://github.com/farao/signaltower/) (or [palava-machine](https://github.com/palavatv/palava-machine/)) on port 4233. To use the palava.tv signaling server:

    VUE_APP_RTC_URL=wss://machine.palava.tv npm run dev

### `VUE_APP_STUN_URL`

The (required) [STUN server](https://en.wikipedia.org/wiki/STUN) to use. Defaults to `stun:stun.palava.tv`.

### `VUE_APP_TURN_URLS`

The (optional) [TURN server](https://en.wikipedia.org/wiki/TURN) URLs to use (comma separated).

### `VUE_APP_FILTER_ICE_CANDIDATE_TYPES`

Optional filter for ICE candidate types.

## Tech Stack

- [Nuxt 3](https://nuxt.com/) - Vue.js framework
- [Vue 3](https://vuejs.org/) - Composition API
- [TypeScript](https://www.typescriptlang.org/)
- [palava-client](https://github.com/nicosabena/nicosabena) - WebRTC client library

## Credits

MIT License. Part of the [palava project](https://palava.tv).

    Copyright (C) 2020-2025 palava e. V.  contact@palava.tv

Icon assets [Entypo+](http://www.entypo.com) by Daniel Bruce – CC BY-SA 4.0, and [Ionicons](https://ionicons.com/)
