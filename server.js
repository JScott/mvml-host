var fs = require('fs');

// Express
var express = require('express');
var app = express();
//app.enable('trust proxy');

// body-parser
var body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded());

// ejs
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// HTTP Server
var http = require('http');
var server = http.createServer(app);

// Cradle
var cradle = require('cradle');
var db = new(cradle.Connection)().database('mvml');
db.exists(function (err, exists) {
	if (err) {
		console.log('error', err);
	} else if (!exists) {
		db.create();
	}
});

var passport = require('passport');
//var FacebookStrategy = require('passport-facebook').Strategy;
// http://passportjs.org/guide/facebook/

var short_id = require('shortid');


app.use(express.static(process.cwd() + '/public'));

/*app.get('/favicon.ico', function(request, response) {
  response.type('image/x-icon');
  response.send(200);
});*/

app.get('/', function(request, response) {
	response.send('main page');
});

app.get('/new', function(request, response) {
	var new_id = short_id.generate();
	db.save(new_id, {
		name:'test space',
    mvml: '',
    html: ''
	}, function(error, db_response) {
		//var rev = db_response.rev;
		response.redirect('/edit/'+new_id);
	});
});

app.get('/:id', function(request, response) {
	db.get(request.params.id, function(error, document) {
    var object = JSON.parse(document);
    if(object.html == '') {
      response.send('<div style="width:100%; text-align:center"><img src="construction.gif"/></div>');
    }
    else {
      response.send(object.html);
    }
	});
});

app.get('/edit/:id', function(request, response) {
  db.get(request.params.id, function(error, document) {
    response.render('space/edit', {
      mvml: document
    });
  });
});

app.post('/edit/:id', function(request, response) {
  // TODO: check credentials
  db.merge(request.params.id, {
    name: request.body.name,
    mvml: request.body.mvml,
    html: '' // TOOD: generate HTML! or do it on the fly client-side
  }, function(error, db_response) {
    response.redirect('/'+request.params.id);
  });
});

app.get('/account', function(request, response) {
	response.send('your account');
});

app.get('/account/:id', function(request, response) {
	response.send(request.params.id+'\'s account');
});

server.listen(6865);
console.log('mvml-host server started on port '+server.address().port);

/*
db.get('vader', function (err, doc) {
  doc.name; // 'Darth Vader'
});

db.save('skywalker', {
  force: 'light',
  name: 'Luke Skywalker'
}, function (err, res) {
  if (err) {
    // Handle error
  } else {
    // Handle success
  }
});
*/
