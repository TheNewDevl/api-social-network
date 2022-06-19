<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## REST API

## Table of contents

- [Built with](#built-with)
- [Description](#description)
- [Next Features](#next-features)
- [Testing](#testing)
- [Installation](#installation)
- [Running the app](#running-the-app)
  - [Classic way](#classic-way)
  - [Docker](#docker)
- [Links](#links)
- [Author](#author)

## Built with

- [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- Typescript
- TypeORM
- MySQL

## Description

My first full API. The idea is to provide a complete REST API including data persistence and users management for a corporate social network.

## Next Features

Admin-dashboard
Friendship management
Real-time display of connected users
Notifications for new posts

## Installation

You can install the app and all dependencies using the following command.
Remember that you need **Node.JS** and **NPM** installed in your local machine
(You dont need to run this if you use docker)

```bash
$ npm install
```

## Running the app

# Classic way

**Before running the app, remember to set the env variables in a .env file**
I provided a .env.sample with an exemple of the values expected to help you

**Remember that you need a DB running in your local machine or in a container**
The app is optimized for mysql

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# Docker

A docker file is provided so if you prefer you can build an image and run a container.

## Testing

The API is covered by unit tests and e2e test.
**The actual code coverage is 100%**
Not that in test env, the app is configured to use an in memory SQlite DB. The package is included in the projet dependencies.
Remember to run ```npm install````before

```bash
# unit tests
$ npm run test

# to run tests and check coverage
$ npm run test:cov
```

## Author

- GitHub - [Carl Dev](https://github.com/TheNewDevl)

## Links

- Front End: ()
