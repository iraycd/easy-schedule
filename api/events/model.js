'use strict'

const _     = require('lodash')
  , uuid    = require('node-uuid')
  , redis   = require('../../lib/redis')
  , name    = 'events'

exports.findAll = function* () {
  return yield redis.hgetall(name)
}

exports.find = function* (login) {
  let key = name + ':' + login
    , evts = yield redis.lrange(key, 0, -1)

  return evts.map(JSON.parse)
}

exports.get = function* (login, id) {
  let key = name + ':' + login
  return yield redis.hgetall(key + ':' + id)
}

exports.create = function* (login, evt) {
  let key = name + ':' + login
    , action = 'created'
    , id = uuid.v1()

  evt = _.assign(evt, {
    id: id,
    status: 'active'
  })

  let args = [action, key, evt, login]

  return yield* saveAndReturn.apply(this, args)
}

exports.update = function* (login, evt) {
  let key = name + ':' + login
    , action = 'updated'
    , args = [action, key, evt, login]

  return yield* saveAndReturn.apply(this, args)
}

exports.delete = function* (login, id) {
  id || (id = 0)

  let action = 'deleted'
    , key = name + ':' + login

  let del = function* (evt) {
    return yield [
      redis.del(name),
      redis.del(key),
      redis.del(key + ':' + id),
      redis.publish('schedule:' + action, payload.call(null, action, evt))
    ]
  }

  let evt = yield this.get(login, id)
  return yield* del(evt)
}

function* saveAndReturn(action, key, evt, login, options) {
  yield [
    redis.hmset(name, evt),
    redis.hmset(key + ':' + evt.id, evt),
    redis.lpush(key, JSON.stringify(evt)),
    redis.publish('schedule:' + action, payload.call(null, action, evt))
  ]
  return yield* this.get(login, evt.id)
}

function payload(action, evt) {
  return JSON.stringify({
    action: action,
    body: evt
  })
}
