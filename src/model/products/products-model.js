'use strict';

const Model = require('../mongo.js');
const schema = require('./products-schema.js');

/***
 * Extends the class Products from Model
 */
class Products extends Model {
  constructor() { super(schema); }
}

module.exports = Products;
