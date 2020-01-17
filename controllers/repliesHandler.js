var mongo = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID
var url = process.env.DB

function RepliesHandler() {
  this.newReply = (req, res) => {
    var board = req.params.board
    var reply = {
      _id: new ObjectId(),
      text: req.body.text,
      created_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password
    }
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board)
      collection.findAndModify(
      {_id: new ObjectId(req.body.thread_id)},
      [],
      {
        $set: {bumped_on: new Date()},
        $push: {replies: reply}
      })
    })
    console.log('Redirecting to thread board ...')
    res.redirect('/b/' + board + '/' + req.body.thread_id)
  }
  
  this.replyList = (req, res) => {
    var board = req.params.board
    console.log('query: ' + req.query.thread_id)
    console.log('body: ' + req.body.thread_id)
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board)
      collection.find(
        {_id: new ObjectId(req.query.thread_id)},
        {
          reported: 0,
          delete_password: 0,
          'replies.delete_password': 0,
          'replies.reported': 0
        }
      )
      .toArray((err, doc) => {
        console.log(doc[0])
        res.json(doc[0])
      })
    })
  }
}

module.exports = RepliesHandler