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
  var replyHandler = new ReplyHandler
  
  app.route('/api/threads/:board')
    .get(threadHandler.threadList)
    .post(threadHandler.newThread)
    .put(threadHandler.reportThread)
    .delete(threadHandler.deleteThread)
    
  app.route('/api/replies/:board')
    .get(replyHandler.replyList)
    .post(replyHandler.newReply)

};
