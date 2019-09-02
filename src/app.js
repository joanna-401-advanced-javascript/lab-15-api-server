'use strict';

// Third party resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Prepare the app
const app = express();

// Other resources
const errorHandler = require('./middleware/500');
const notFound = require('./middleware/404');
const authRouter = require('./router');
const apiRouter = require('./api/v1');

// App level middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Router
app.use(authRouter);
app.use(apiRouter);

// Catch-all
app.use(notFound);
app.use(errorHandler);

module.exports = {
  server: app,
  start: (port) => {
    app.listen(port, () => {
      console.log(`Server up on ${port}`);
    });
  },
};