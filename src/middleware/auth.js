'use strict';

const User = require('../model/users-model');

module.exports = (request, response, next) => {
  try {
    let [authType, authString] = request.headers.authorization.split(/\s+/);

    switch (authType.toLowerCase()){
    case 'basic':
      return _authBasic(authString);
    case 'bearer':
      return _authBearer(authString);
    default:
      return _authError();
    }

  } catch (error){
    _authError();
  }

  function _authBasic(authString){
    let base64Buffer = Buffer.from(authString, 'base64');
    let bufferString = base64Buffer.toString();
    let [username, password] = bufferString.split(':');
    let auth = {username, password};

    return User.authenticateBasic(auth)
      .then(user => _authenticate(user))
      .catch(_authError);
  }

  function _authBearer(authString) {
    return User.authenticateToken(authString)
      .then(user => {
        _authenticate(user);
      })
      .catch(_authError);
  }

  function _authenticate(user){
    if(user){
      request.user = user;
      request.token = user.generateToken();
      next();
    } else {
      _authError();
    }
  }

  function _authError(){
    next('Invalid User ID/Password');
  }
};