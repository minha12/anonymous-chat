var mongo = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID
var url = process.env.DB

function ThreadsHandler() {
  this.newThread = function(req, res) {
    var board = req.params.board
    console.log(board)
    var thread = {
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.delete_password,
      replies: []
    }
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board)
      collection.insert(thread, () => {
        console.log('Redirecting ... ')
        res.redirect('/b/' + board + '/')
      })
    })
  }
  
  this.threadList = (req, res) => {
    var board = req.params.board
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board)
      collection.find(
        {},
        {
          reported: 0,
          delete_password: 0,
          "replies.delete_password": 0,
          "replies.reported": 0
        })
      .sort({bumped_on: -1})
      .limit(10)
      .toArray((err, docs) => {
        docs.forEach((doc) => {
          doc.replycount = doc.replies.length
          if(doc.replies.length > 3) {
            doc.replies = doc.replies.slice(-3)
          }
        })
        console.log(docs)
        res.json(docs)
      })
    })
  }
  
  this.reportThread = (req, res) => {
    var board = req.params.board
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board)
      collection.findAndModify(
        {_id: new ObjectId(req.query.thread_id)},
        [],
        {
          $set: {reported: true}
        }
      )
      res.send('reported')
    })
  }
  
  this.deleteThread = (req, res) => {
    var board = req.params.board
    mongo.
  }
  
}

module.exports = ThreadsHandler