/**
 * Created by siman on 15/03/17.
 */

const express = require('express');

const app = express();
app.use(express.static('build'));

const server = require('./common-server');
server.setup(app);

app.listen(3000, function () {
  console.log('App is running at http://localhost:3000')
});

module.exports = app; // for testing
