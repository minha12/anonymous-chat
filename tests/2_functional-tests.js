/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var test1Id
  var test2Id
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function(done) {
      chai.request(server)
        .post('/api/threads/anon')
        .send(
        {
          text: 'thread1',
          delete_password: '12345'
        }
        .end((err, res) => {
          assert.equal(res.status, 200)
          done()
        })
      )
      
      chai.request(server)
        .post('/api/threads/anon')
        .send(
        {
          text: 'thread2',
          delete_password: '12345'
        }
        .end((err, res) => {
          assert.equal(res.status, 200)
          done()
        })
      )
      
    });
    
    suite('GET', function(done) {
      chai.request(server)
        .get('/api/threads/anon')
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.isArray(res.body)
          assert.isBelow(res.body.length, 11)
          assert.property(res.body[0], '_id')
          assert.property(res.body[0], 'text')
          assert.property(res.body[0], 'created_on')
          assert.property(res.body[0], 'bumped_on')
          assert.notProperty(res.body[0], 'reported')
          assert.notProperty(res.body[0], 'delete_password')
          assert.isArray(res.body[0].replies)
          assert.isBelow(res.body[0].replies.length, 4)
          test1Id = res.body[0]._id
          test2Id = res.body[1]._id
          done()
      })
    });
    
    suite('DELETE', function(done) {
      chai.request(server)
        .delete('/api/threads/anon')
        .send(
        {
          thread_id: test1Id,
          delete_password: '12345'
        }
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'success')
          done()
        })
      )
    });
    
    suite('PUT', function(done) {
      chai.request(server)
        .put('/api/threads/anon')
        .send( { thread_id: test1Id } )
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.equal(res.text, 'reported')
          done()
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function(done) {
      chai.request(server)
        .post('/api/replies/anon')
        .send(
        {
          thread_id: test2Id, 
        }
      )
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });

});
