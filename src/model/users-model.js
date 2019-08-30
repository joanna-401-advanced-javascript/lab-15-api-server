'use strict';
/**
 * API Server Module
 * @module src/auth/users-model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
  role: {type: String, default:'user', enum: ['admin','editor','user']},
});

let previousTokens = [];

/**
 * Pre hook uses bcrypt to hash the password
 */
users.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(console.error);
});

/**
 * This function creates a new user from 0auth
 * @param email
 * @returns {*}
 */
users.statics.createFromOauth = function(email) {
  if(! email) { return Promise.reject('Validation Error'); }

  return this.findOne( {email} )
    .then(user => {
      if( !user ) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    .catch( error => {
      console.log('Creating new user');
      let username = email;
      let password = 'none';
      return this.create({username, password, email});
    });

};

/**
 * This finds a user where basic authentication
 * @param auth
 * @returns {object} - user
 */
users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

/**
 * This finds a user where a token was used in bearer authentication
 * @param token
 * @returns {object|Error}
 */
users.statics.authenticateToken = function(token) {
  if (process.env.REMEMBER === 'yes'){
    const decryptedToken = jwt.verify(token, process.env.SECRET || 'secret');
    const query = {_id:decryptedToken.id};
    return this.findOne(query);
  } else {
    if(previousTokens.includes(token)){
      throw new Error('Invalid Token.');
    } else {
      previousTokens.push(token);
      const decryptedToken = jwt.verify(token, process.env.SECRET || 'secret');
      const query = {_id:decryptedToken.id};
      return this.findOne(query);
    }
  }
};

/**
 * This uses bcrypt to check if password is valid
 * @param password
 * @returns {object| null}
 */
users.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

/**
 * This generates a token
 * @returns {*}
 */
users.methods.generateToken = function() {
  let token = {
    id: this._id,
    role: this.role,
  };
  return jwt.sign(token, process.env.SECRET || 'secret');
};

/**
 * This generates a token which expires
 * @returns {*}
 */
users.methods.generateTimedToken = function() {
  let token = {
    id: this._id,
    role: this.role,
  };
  return jwt.sign(token, process.env.SECRET || 'secret', {expiresIn: 10});
};

/**
 * This generates an auth key
 * @returns {*}
 */
users.methods.generateAuthKey = function() {
  return this.generateToken();
};

module.exports = mongoose.model('users', users);
