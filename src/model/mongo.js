'use strict';
/**
 * API Server Module
 * @module src/model/mongo
 */

class Model {
  /***
   * Model constructor
   * @param schema {object} - mongo schema
   */
  constructor(schema) {
    this.schema = schema;
  }

  jsonSchema() {
    console.log(typeof this.schema.jsonSchema);
    return typeof this.schema.jsonSchema === 'function'
      ? this.schema.jsonSchema()
      : {};
  }

  /***
   * Retrieves one or more records
   * @param _id {string}, optional mongo record id
   * @returns {count:#, results[{*}]} | {*}
   */
  get(_id) {
    let queryObject = _id ? { _id } : {};
    return this.schema.find(queryObject);
  }

  /***
   * Creates a new record
   * @param record {object}, matches the form of the schema
   * @returns {*}
   */
  create(record) {
    console.log('r',record);
    let newRecord = new this.schema(record);
    console.log('n', newRecord);
    return newRecord.save();
  }

  /***
   * Updates a record
   * @param _id {string} mongo record id
   * @param record {object}, the data to replace. Must have id.
   * @returns {*}
   */
  update(_id, record) {
    return this.schema.findByIdAndUpdate(_id, record, { new: true });
  }

  /***
   * Deletes a record
   * @param _id {string} mongo record id
   * @returns {*}
   */
  delete(_id) {
    return this.schema.findByIdAndDelete(_id);
  }

}

module.exports = Model;
