'use strict';

var expect = require('chai').expect;
var ThreadHandler = require('../controllers/threadsHandler.js')
var ReplyHandler = require('../controllers/repliesHandler.js')
require('dotenv').config();

module.exports = function (app) {
  var threadHandler = new ThreadHandler
  var replyHandler = new ReplyHandler
  
  // Add new route for getting board stats
  app.route('/api/boards')
    .get(threadHandler.getBoardStats)
    .post(threadHandler.createBoard)
  
  app.get('/api/boards/with-threads', threadHandler.getBoardsWithTopThreads.bind(threadHandler));

  app.route('/api/threads/:board')
    .get(threadHandler.threadList)
    .post(threadHandler.newThread)
    .put(threadHandler.reportThread)
    .delete(threadHandler.deleteThread)
    
  app.route('/api/replies/:board')
    .get(replyHandler.replyList)
    .post(replyHandler.newReply)
    .put(replyHandler.reportReply)
    .delete(replyHandler.deleteReply)
};
