'use strict';
/**
 * API Server Module
 * @module src/middleware/model-finder
 */

const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);

const modelsFolder = `${__dirname}/../model`;

/***
 * Instantiates the correct model depending on the request
 * @param request {string}
 * @param response {object}
 * @param next, to next middleware
 */
const load = (request, response, next) => {
  let modelName = request.params.model.replace(/[^a-z0-9-_]/gi, '');
  const Model = require(`../model/${modelName}/${modelName}-model.js`);
  request.model = new Model();
  next();
};

/***
 * Filters through modelsFolder
 * @returns { * | void }
 */
const list = () => {
  return readdir(modelsFolder)
    .then(contents =>
      contents.filter((entry) =>
        fs.lstatSync(`${modelsFolder}/${entry}`).isDirectory() && fs.statSync(`${modelsFolder}/${entry}/${entry}-model.js`)
      )
    )
    .catch(console.error);
};

module.exports = {load,list};
