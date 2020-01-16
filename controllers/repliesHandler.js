var mogo = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID
var url = process.env.DB

function ThreadsHandler() {
  this.newReply = (req, res) => {
    var board = req.params.board
    var reply = {
      _id: new ObjectId(),
      text: req.body.text,
      created_on: new Date(),
      reported: false,
      delete_password: req
    }
  }
}

module.exports = ThreadsHandler