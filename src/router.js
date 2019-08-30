'use strict';

const express = require('express');
const authRouter = express.Router();

const User = require('./model/users-model');
const auth = require('./middleware/auth');
const oauth = require('./oauth/google');

authRouter.post('/signup', (request, response, next) => {
  let user = new User;
  user.save()
    .then(user => {
      request.token = user.generateToken();
      request.user = user;
      response.set('token', request.token);
      response.cookie('auth', request.token);
      response.send(request.token);
    })
    .catch(next);
});

authRouter.post('/signin', auth, (request, response, next) => {
  response.cookie('auth', request.token);
  response.send(request.token);
});

authRouter.post('/key', auth, (request, response, next) => {
  let key = request.user.generateToken('key');
  response.status(200).send(key);
});

authRouter.get('/oauth', (request, response, next) => {
  oauth.authorize(request)
    .then(token => {
      response.status(200).send(token);
    })
    .catch(next);
});

module.exports = authRouter;