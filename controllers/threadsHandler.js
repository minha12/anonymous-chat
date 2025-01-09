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

function ThreadsHandler() {
  this.newThread = async function(req, res) {
    var board = req.params.board;
    console.log(board);
    var thread = {
      _id: new ObjectId(),  // Explicitly set ID
      text: req.body.text,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    };

    try {
      await connectDB();
      const collection = client.db().collection(board);
      await collection.insertOne(thread);
      // Return JSON instead of redirect for API consistency
      res.json({ success: true, _id: thread._id });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.threadList = async (req, res) => {
    var board = req.params.board;
    try {
      await connectDB();
      const collection = client.db().collection(board);
      const docs = await collection
        .find(
          {},
          {
            projection: {
              reported: 0,
              delete_password: 0,
              "replies.delete_password": 0,
              "replies.reported": 0
            }
          }
        )
        .sort({ bumped_on: -1 })
        .limit(10)
        .toArray();

      docs.forEach(doc => {
        doc.replycount = doc.replies.length;
        if (doc.replies.length > 3) {
          doc.replies = doc.replies.slice(-3);
        }
      });
      res.json(docs);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.reportThread = async (req, res) => {
    var board = req.params.board;
    try {
      await connectDB();
      const collection = client.db().collection(board);
      await collection.findOneAndUpdate(
        { _id: new ObjectId(req.body.thread_id) },
        { $set: { reported: true } }
      );
      res.send("reported");
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.deleteThread = async (req, res) => {
    var board = req.params.board;
    try {
      await connectDB();
      const collection = client.db().collection(board);
      const thread = await collection.findOne({
        _id: new ObjectId(req.body.thread_id),
        delete_password: req.body.delete_password
      });

      if (!thread) {
        return res.send("incorrect password");
      }

      await collection.deleteOne({
        _id: new ObjectId(req.body.thread_id)
      });
      
      res.send("success");
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };
}

module.exports = ThreadsHandler;
