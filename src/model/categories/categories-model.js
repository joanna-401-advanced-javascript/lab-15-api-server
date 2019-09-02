'use strict';

const Model = require('../mongo.js');
const schema = require('./categories-schema.js');

/***
 * Extends the model for categories
 */
class Categories extends Model {
  constructor() { super(schema); }
}

module.exports = Categories;
