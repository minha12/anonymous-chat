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
  return client.db('anonymous_chat'); // Explicitly specify database name
}

function RepliesHandler() {
  // Helper function to validate MongoDB ObjectId
  function isValidObjectId(id) {
    try {
      return ObjectId.isValid(id) && (String)(new ObjectId(id)) === id;
    } catch (e) {
      return false;
    }
  }

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
      const db = await connectDB();
      const collection = db.collection(board);
      await collection.findOneAndUpdate(
        { _id: new ObjectId(req.body.thread_id) },
        {
          $set: { bumped_on: new Date() },
          $push: { replies: reply }
        }
      );
      // Return JSON instead of redirect
      res.json({ 
        success: true, 
        message: 'Reply added successfully',
        reply: {
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on
        }
      });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.replyList = async (req, res) => {
    var board = req.params.board;
    try {
      // Validate thread_id before querying
      if (!req.query.thread_id || !isValidObjectId(req.query.thread_id)) {
        return res.status(400).json({ error: 'Invalid thread ID format' });
      }

      const db = await connectDB();
      const collection = db.collection(board);
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
      
      if (!doc) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      
      res.json(doc);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.reportReply = async (req, res) => {
    var board = req.params.board;
    try {
      if (!isValidObjectId(req.body.thread_id) || !isValidObjectId(req.body.reply_id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const db = await connectDB();
      const collection = db.collection(board);
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
      if (!isValidObjectId(req.body.thread_id) || !isValidObjectId(req.body.reply_id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const db = await connectDB();
      const collection = db.collection(board);
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
