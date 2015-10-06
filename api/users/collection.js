import crypto from 'crypto'
import monk from 'monk'
import wrap from 'co-monk'

const db = monk('localhost/schedule')
  , users = wrap(db.get('users'))

exports.create = function* (name, password) {
  return yield users.insert({
    name: name,
    password: password,
    createdAt: new Date()
  })
}

exports.auth = function* (name, password) {
  return yield users.find({
    name: name,
    password: password
  })
}

exports.remove = function* (name, password) {
  return yield users.remove({
    name: name,
    password: password
  })
}

exports.cleardb = function* () {
  return yield users.remove()
}

function hashDigest(password) {
  let shaSum = crypto.createHash('sha256')
  shaSum.update(password)
  return shaSum.digest('hex')
}
