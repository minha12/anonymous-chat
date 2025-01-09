'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

// Add security headers middleware
app.use((req, res, next) => {
  // Only allow site to be loaded in iframes on own pages
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Disable DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  // Only send referrer for own pages
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//Sample Front-end

    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
if(process.env.NODE_ENV==='test') {
  console.log('Running Tests...');
  setTimeout(function () {
    try {
      runner.run();
      // Start server after tests complete instead of exiting
      setTimeout(() => {
        console.log('Tests completed, starting server...');
        app.listen(process.env.PORT || 3000, function() {
          console.log("Listening on port " + process.env.PORT);
        });
      }, 2000);
    } catch(e) {
      console.log('Tests are not valid:');
      console.log(error);
      process.exit(1);
    }
  }, 1500);
} else {
  app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port " + process.env.PORT);
  });
}

module.exports = app;
