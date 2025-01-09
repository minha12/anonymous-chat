const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require('dotenv').config();

const client = new MongoClient(process.env.DB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB once
let connected = false;
async function connectDB() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
}

function RepliesHandler() {
  this.newReply = async (req, res) => {
    var board = req.params.board;
    var reply = {
      _id: new ObjectId(),
      text: req.body.text,
      created_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password
    };

    try {
      await connectDB();
      const collection = client.db().collection(board);
      await collection.findOneAndUpdate(
        { _id: new ObjectId(req.body.thread_id) },
        {
          $set: { bumped_on: new Date() },
          $push: { replies: reply }
        }
      );
      res.redirect("/b/" + board + "/" + req.body.thread_id);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.replyList = async (req, res) => {
    var board = req.params.board;
    try {
      await connectDB();
      const collection = client.db().collection(board);
      const doc = await collection.findOne(
        { _id: new ObjectId(req.query.thread_id) },
        {
          projection: {
            reported: 0,
            delete_password: 0,
            "replies.delete_password": 0,
            "replies.reported": 0
          }
        }
      );
      res.json(doc);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.reportReply = async (req, res) => {
    var board = req.params.board;
    try {
      await connectDB();
      const collection = client.db().collection(board);
      await collection.findOneAndUpdate(
        {
          _id: new ObjectId(req.body.thread_id),
          "replies._id": new ObjectId(req.body.reply_id)
        },
        {
          $set: { "replies.$.reported": true }
        }
      );
      res.send("reported reply: " + req.body.reply_id);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.deleteReply = async (req, res) => {
    var board = req.params.board;
    try {
      await connectDB();
      const collection = client.db().collection(board);
      const result = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(req.body.thread_id),
          replies: {
            $elemMatch: {
              _id: new ObjectId(req.body.reply_id),
              delete_password: req.body.delete_password
            }
          }
        },
        { $set: { "replies.$.text": "[deleted]" } }
      );
      if (result.value === null) {
        res.send("incorrect password");
      } else {
        res.send("success delete " + req.body.reply_id);
      }
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };
}

module.exports = RepliesHandler;
