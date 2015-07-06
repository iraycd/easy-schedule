'use strict';

var BPromise    = require('bluebird')
  , redis       = require('promise-redis')(promiseFactory)
  , config      = require('../config/redis')[process.env.NODE_ENV]
  , client      = redis.createClient(config.port, config.host);

function promiseFactory(resolver) {
  return new BPromise(resolver);
}

module.exports = client;
