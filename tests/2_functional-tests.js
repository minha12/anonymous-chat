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

  suite('API ROUTING FOR /api/threads/:board', function() {
    var test1Id
    var test2Id
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
        .post('/api/threads/test')
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
    
    suite('GET', function() {
      chai.request(server)
        .get('/api/threads/test')
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
      })
    });
    
    suite('DELETE', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
    });
    
    suite('GET', function() {
      
    });
    
    suite('PUT', function() {
      
    });
    
    suite('DELETE', function() {
      
    });
    
  });

});
