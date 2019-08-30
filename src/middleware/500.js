'use strict';
/**
 * API Server Module
 * @module src/auth/error
 */

/**
 * Error handling middleware
 * @param err - error message
 * @param req - request
 * @param res - response
 * @param next
 */

module.exports = (err, req, res, next) => {
  console.log('__SERVER_ERROR__', err);
  let error = { error: err.message || err };
  res.status(500).json(error);
};
