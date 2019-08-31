'use strict';

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

users.pre('save', function(next){
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => new Error(error));
});

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

users.statics.authenticateBasic = function(auth) {
  let query = {username: auth.username};
  return this.findOne(query)
    .then(user => user ? user.comparePassword(auth.password) : null)
    .catch(error => error);
};

users.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(isValid => isValid? this : null);
};

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