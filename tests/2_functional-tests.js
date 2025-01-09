/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

var mocha = require('mocha');
var { suite, test } = mocha;

chai.use(chaiHttp);

suite("Functional Tests", function() {
  var test1Id;
  var test2Id;
  var replyId;
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("create 2 threads", done => {
        // Create first thread
        chai
          .request(server)
          .post("/api/threads/anon")
          .send({
            text: "thread1",
            delete_password: "12345"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            test1Id = res.body._id;
            
            // Create second thread only after first is done
            chai
              .request(server)
              .post("/api/threads/anon")
              .send({
                text: "thread2",
                delete_password: "12345"
              })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.property(res.body, '_id');
                test2Id = res.body._id;
                done();
              });
          });
      });
    });

    suite("GET", function() {
      test("get most recent 10 threads", done => {
        chai
          .request(server)
          .get("/api/threads/anon")
          .end((err, res) => {
            // Add debug log
            console.log("Thread IDs from GET:", {
              thread1: res.body[0]._id,
              thread2: res.body[1]._id
            });
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isBelow(res.body.length, 11);
            assert.property(res.body[0], "_id");
            assert.property(res.body[0], "text");
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "bumped_on");
            assert.notProperty(res.body[0], "reported");
            assert.notProperty(res.body[0], "delete_password");
            assert.isArray(res.body[0].replies);
            assert.isBelow(res.body[0].replies.length, 4);
            // Fix the ID assignments - swap them to match the creation order
            test1Id = res.body[1]._id;  // thread1
            test2Id = res.body[0]._id;  // thread2
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("delete thread", done => {
        // Add delay to ensure previous operations completed
        setTimeout(() => {
          console.log("Attempting to delete thread ID:", test1Id);
          chai
            .request(server)
            .delete("/api/threads/anon")
            .send({
              thread_id: test1Id,
              delete_password: "12345"
            })
            .end((err, res) => {
              // Add debug log
              console.log("Delete response:", res.text);
              assert.equal(res.status, 200);
              assert.equal(res.text, "success");
              done();
            });
        }, 500);
      });
    });

    suite("PUT", function() {
      test("put report", done => {
        chai
          .request(server)
          .put("/api/threads/anon")
          .send({ thread_id: test1Id })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      test("post a new reply", done => {
        chai
          .request(server)
          .post("/api/replies/anon")
          .send({
            thread_id: test2Id,
            text: "hi",
            delete_password: "11111"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite("GET", function() {
      test("get a reply", done => {
        chai
          .request(server)
          .get("/api/replies/anon")
          .query({ thread_id: test2Id })
          .end((err, res) => {
            assert.equal(res.status, 200);
            console.log(res.body);
            assert.equal(res.body.replies[0].text, "hi");
            assert.notProperty(res.body.replies[0], "reported");
            assert.notProperty(res.body.replies[0], "delete_password");
            replyId = res.body.replies[0]._id;
            done();
          });
      });
    });

    suite("PUT", function() {
      test("report a reply", done => {
        chai
          .request(server)
          .put("/api/replies/anon")
          .send({ thread_id: test2Id, reply_id: replyId })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "reported reply: " + replyId);
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("delete a reply", done => {
        chai
          .request(server)
          .delete("/api/replies/anon")
          .send({
            thread_id: test2Id,
            reply_id: replyId,
            delete_password: "11111"
          })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success delete " + replyId);
            done();
          });
      });
    });
  });
});
