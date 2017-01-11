
# Igo.js Documentation

Igo.js is a full-featured Node.js web framework for developing web applications.

Igo is not a Node.js boilerplate. It's more like a meta-framework since it leverages on several existing frameworks and libraries.

In a few seconds it can give you a production-ready application and a 100% working development environment.

## Introduction

We love Node.js, it's a fantastic and easy technology to build and run web applications.
But after building several projects, we found that it was a pain to duplicate these many *technical* files:
- `app.js` for Express and its bunch of middlewares, plus the configuration for these middlewares,
- `Gulpfile.js` to have a nice development environment,
- MySQL, Redis, SMTP configurations and connections,
- `package.json` with so many dependencies,
- `Mocha` configuration and tools to write good tests,
- ...etc.

After several months spent duplicating the same configuration and the same technical stack over and over, well, it appeared clearly that all this had very little added value. That's how Igo.js was born.

## Installation
```sh
# install required tools
npm install -g bower gulp-cli mocha

# install igo
npm install -g igo
```

## Getting started
```sh
# create new project
igo create myproject
cd myproject

# install node.js dependencies
npm install

# install bower dependencies
bower install

# start the server on http://localhost:3000
gulp
```

## Configuration
The Igo configuration is located in `/app/config.js`.
The configuration is initialized at startup, and can be retrieved through igo module:
```js
var config = require('igo').config`;
```

Some configuration parameters can be defined with environment variables. Igo uses [dotenv](https://github.com/motdotla/dotenv), so you can just add/override variables in the `/.env` file.

```txt
# development database
MYSQL_DATABASE=mydatabase
```

## MVC
Igo uses:
- A basic custom ORM for MySQL, inspired by [Rails ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html)
- [Dust](http://www.dustjs.com/), a powerful and performant template engine, maintained by LinkedIn
- [Express](http://expressjs.com/), the most widely used Node.js web framework

🌀 For detailed documentation, see [Models](/docs/models.md), [Views](/docs/views.md) and [Controllers](/docs/controllers.md).

## Extra Features

- Igo [Cache](/docs/cache.md)
- Igo Mailer (TODO)

## Development
Igo uses [Gulp](http://gulpjs.com/) and provides default gulp tasks based on these modules:
- [Nodemon](https://nodemon.io/) to auto-refresh the server on code change
- [JSHint](http://jshint.com/) to verify the quality of your backend Javascript code
- [Bower](https://bower.io) to download and install frontend modules
- [Less](http://lesscss.org/) or [Sass](http://sass-lang.com/) as a CSS preprocessor
- [Uglify](http://lisperator.net/uglifyjs/) to compress and minify your frontend Javascript code
- [Livereload](https://github.com/vohof/gulp-livereload) to refresh your browser automatically

🌀 See the [Development](/docs/development.md) section to learn more.

## Test
Igo uses [Mocha](https://mochajs.org/) test framework, and offers more features:
- Testing controllers layer with [superagent](https://github.com/visionmedia/superagent)
- Automatic test database reinitialization before first test
- Test isolation: each test runs in a transaction that is rollbacked

🌀 See the [Test](/docs/test.md) section to learn more.


## Production
- Igo dev dependencies are packaged in a separate module [igo-dev](https://github.com/arnaudm/igo-dev)
- Production configuration is loaded separately
- Runtime errors are caught and can be sent by email to the admin
- Igo logger uses [winston](https://github.com/winstonjs/winston) so you can log where you like (eg: [papertrail](https://github.com/kenperkins/winston-papertrail))

🌀 See the [Production](/docs/production.md) section to learn more.