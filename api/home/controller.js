'use strict';

exports.index = function* () {
  this.type = 'json'
  this.status = 200
  this.body = {message: 'Easy Schedule rest api working'}
}
