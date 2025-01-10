const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require('dotenv').config();

const client = new MongoClient(process.env.DB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB once and use specific database
let connected = false;
async function connectDB() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db('anonymous_chat'); // Explicitly specify database name
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
      const db = await connectDB();
      const collection = db.collection(board);
      await collection.insertOne(thread);
      res.json({ 
        success: true, 
        _id: thread._id,
        message: 'Thread created successfully'
      });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.threadList = async (req, res) => {
    var board = req.params.board;
    try {
      const db = await connectDB();
      const collection = db.collection(board);
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
      const db = await connectDB();
      const collection = db.collection(board);
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
      const db = await connectDB();
      const collection = db.collection(board);
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

  this.getBoardStats = async function(req, res) {
    try {
      const db = await connectDB();
      const collections = await db.listCollections().toArray();
      const stats = await Promise.all(collections.map(async (coll) => {
        if (coll.name.startsWith('system.')) return null; // Skip system collections
        const count = await db.collection(coll.name).countDocuments();
        return {
          name: coll.name,
          threadCount: count
        };
      }));
      res.json(stats.filter(Boolean)); // Remove null entries
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };

  this.createBoard = async function(req, res) {
    const boardName = req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    try {
      const db = await connectDB();
      await db.createCollection(boardName);
      res.json({ success: true, board: boardName });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error creating board' });
    }
  };

  this.getBoardsWithTopThreads = async function(req, res) {
    try {
      const db = await connectDB();
      const collections = await db.listCollections().toArray();
      const boardsData = await Promise.all(
        collections
          .filter(coll => !coll.name.startsWith('system.'))
          .map(async (coll) => {
            const topThreads = await this.getTopThreadsForBoard(coll.name);
            // Get the most recent bumped_on date from threads
            const latestActivity = topThreads.length > 0 
              ? Math.max(...topThreads.map(t => new Date(t.bumped_on).getTime()))
              : 0;
            return {
              name: coll.name,
              threads: topThreads,
              latestActivity: latestActivity
            };
          })
      );
      
      // Sort boards by latest activity
      boardsData.sort((a, b) => b.latestActivity - a.latestActivity);
      
      res.json(boardsData);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error accessing database' });
    }
  };
}

// Move this outside of ThreadsHandler but before module.exports
ThreadsHandler.prototype.getTopThreadsForBoard = async function(boardName) {
  try {
    const db = await connectDB();
    const collection = db.collection(boardName);
    const threads = await collection
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
      .limit(3)
      .toArray();

    threads.forEach(thread => {
      thread.replycount = thread.replies.length;
      if (thread.replies.length > 3) {
        thread.replies = thread.replies.slice(-3);
      }
    });

    return threads;
  } catch (err) {
    console.error('Error fetching top threads:', err);
    return [];
  }
};

module.exports = ThreadsHandler;
