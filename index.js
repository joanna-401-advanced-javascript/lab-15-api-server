'use strict';

// Start up DB server
require('dotenv').config();
const mongoose = require('mongoose');
const options = {
  userNewUrlParser: true,
  useCreateIndex: true,
};

mongoose.connect(process.env.MONGODB_URI, options);

// Start the web server
require('./src/app').start(process.env.PORT);