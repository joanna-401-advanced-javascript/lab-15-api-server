'use strict';
/**
 * API Server Module
 * @module src/auth/middleware
 */

const User = require('../model/users-model');

module.exports = (req, res, next) => {
  
  try {
    let [authType, authString] = req.headers.authorization.split(/\s+/);
    
    switch( authType.toLowerCase() ) {
    case 'basic':
      return _authBasic(authString);
    case 'bearer':
      return _authBearer(authString);
    default:
      return _authError();
    }
  }
  catch(e) {
    next(e);
  }

  /**
   * This parses basic authentication
   * @param str
   * @returns {Promise}
   * @private
   */
  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString, 'base64');
    let bufferString = base64Buffer.toString();
    let [username, password] = bufferString.split(':');
    let auth = {username,password};
    
    return User.authenticateBasic(auth)
      .then(user => _authenticate(user) )
      .catch(next);
  }

  /**
   * This sends the authString to be authenticated, if a token
   * @param authString
   * @returns {Promise}
   * @private
   */
  function _authBearer(authString) {
    return User.authenticateToken(authString)
      .then(user => _authenticate(user))
      .catch(next);
  }

  /**
   * This assigns the user and token
   * @param user
   * @private
   */
  function _authenticate(user) {
    if(user) {
      req.user = user;
      if(process.env.REMEMBER === 'yes'){
        req.token = user.generateTimedToken();
      } else {
        req.token = user.generateToken();
      }
      next();
    }
    else {
      _authError();
    }
  }

  /**
   * This throws an error if the user ID or password is invalid
   * @private
   */
  function _authError() {
    next('Invalid User ID/Password');
  }
  
};