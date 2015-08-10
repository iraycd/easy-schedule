'use strict';

const supertest = require('supertest')
  , mocha       = require('mocha')
  , expect      = require('chai').expect
  , redis       = require('../../lib/redis')
  , app         = require('../../app')
  , request     = supertest(app.listen())
  , User        = require('../../api/users/model');

require('co-mocha')(mocha);

describe('UserControllerSpec', function() {

  let login = 'user-login'
    , password = 'user-password';

  afterEach(function* (done) {
    try {
      yield redis.flushdb();
      done();
    } catch(err) {
      done(err);
    }
  });

  describe('POST /v1/users', function() {

    before(function* (done) {
      try {
        yield User.create(login, password);
        done();
      } catch(err) {
        done(err);
      }
    });

    it('should create a user', function(done) {
      request
        .post('/v1/users')
        .set('Accept', 'application/json')
        .set('Accept-Encoding', 'gzip')
        .send({login: login, password: password})
        .expect('Content-Type', /json/)
        .expect(201, function(err, res) {
          if (err) return done(err);
          expect(res.statusCode).to.be.equal(201);
          done();
        });
    });
  });
});
