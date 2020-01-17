var mongo = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectID;
var url = process.env.DB;

function RepliesHandler() {
  this.newReply = (req, res) => {
    var board = req.params.board;
    var reply = {
      _id: new ObjectId(),
      text: req.body.text,
      created_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password
    };
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board);
      collection.findAndModify({ _id: new ObjectId(req.body.thread_id) }, [], {
        $set: { bumped_on: new Date() },
        $push: { replies: reply }
      });
    });
    console.log("Redirecting to thread board ...");
    res.redirect("/b/" + board + "/" + req.body.thread_id);
  };

  this.replyList = (req, res) => {
    var board = req.params.board;
    // console.log('query: ' + req.query.thread_id)
    // console.log('body: ' + req.body.thread_id)
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board);
      collection
        .find(
          { _id: new ObjectId(req.query.thread_id) },
          {
            reported: 0,
            delete_password: 0,
            "replies.delete_password": 0,
            "replies.reported": 0
          }
        )
        .toArray((err, doc) => {
          console.log(doc[0]);
          res.json(doc[0]);
        });
    });
  };

  this.reportReply = (req, res) => {
    var board = req.params.board;
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board);
      collection.findAndModify(
        {
          _id: new ObjectId(req.body.thread_id),
          "replies._id": new ObjectId(req.body.reply_id)
        },
        [],
        {
          $set: { "replies.$.reported": true }
        }
      );
    });
    res.send("reported reply: " + req.body.reply_id);
  };

  this.deleteReply = (req, res) => {
    var board = req.params.board;
    mongo.connect(url, (err, db) => {
      var collection = db.collection(board);
      collection.findAndModify(
        {
          _id: new ObjectId(req.body.thread_id),
          replies: {
            $elemMatch: {
              _id: new ObjectId(req.body.reply_id),
              delete_password: req.body.delete_password
            }
          }
        },
        [],
        { $set: { "replies.$.text": "[deleted]" } },
        (err, doc) => {
          if (doc.value === null) {
            res.send("incorrect password");
          } else {
            res.send("success delete " + req.body.reply_id);
          }
        }
      );
    });
  };
}

module.exports = RepliesHandler;
