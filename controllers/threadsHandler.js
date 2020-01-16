var mongo = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID
var url = process.env.DB

function RepliesHandler() {
  this.newThread = function(req, res) {
    var board = req.params.board
    var thread = {
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      
    }
  }
}

module.exports = RepliesHandler