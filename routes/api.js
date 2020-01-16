/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ThreadHandler = require('../controllers/threadsHandler.js')
var ReplyHandler = require('../controllers/repliesHandler.js')

module.exports = function (app) {
  var threadHandler = new ThreadHandler
  var replyHandler = new ThreadHandler
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
