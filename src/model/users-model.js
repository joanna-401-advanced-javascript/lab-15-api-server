'use strict';
/**
 * API Server Module
 * @module src/model/users-model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const TOKEN_EXPIRE = process.env.TOKEN_LIFETIME || 10 ;
const SECRET = process.env.SECRET || 'sillystring';

const usedTokens = [];

const users = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String},
  role: {type: String, default: 'user', enum: ['admin', 'user', 'editor']},
});

/**
 * Pre hook uses bcrypt to hash the password
 */
users.pre('save', function(next){
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => new Error(error));
});

/**
 * This finds a user where a token was used in bearer authentication
 * @param token
 * @returns {object|Error}
 */
users.statics.authenticateToken = function(token) {
  if (usedTokens.includes(token)){
    throw new Error('Invalid Token');
  } else {
    let decryptedToken = jwt.verify(token, SECRET);

    if(decryptedToken.type !== 'key'){
      usedTokens.push(token);
    }

    let query = {_id: decryptedToken.id};
    return this.findOne(query);
  }
};

/**
 * This finds a user where basic authentication
 * @param auth
 * @returns {object} - user
 */
users.statics.authenticateBasic = function(auth) {
  let query = {username: auth.username};
  return this.findOne(query)
    .then(user => user ? user.comparePassword(auth.password) : null)
    .catch(error => error);
};

/**
 * This uses bcrypt to check if password is valid
 * @param password
 * @returns {object| null}
 */
users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(isValid => isValid? this : null);
};

/**
 * This generates a token
 * @returns {*}
 */
users.methods.generateToken = function(type) {
  let token = {
    id: this._id,
    role: this.role,
    type: type || 'user',
  };

  let options = {};
  if (type !== 'key' && TOKEN_EXPIRE){
    options = {expiresIn: TOKEN_EXPIRE};
  }
  return jwt.sign(token, SECRET, options);
};

module.exports = mongoose.model('user', users);