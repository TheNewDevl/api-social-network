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

### Classic way

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

### Docker

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
