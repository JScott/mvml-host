var express = require('express');
var app = express();
//app.enable('trust proxy');

var http = require('http');
var server = http.createServer(app);

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


app.get('/', function(request, response) {
	response.send('main page');
});

app.get('/new', function(request, response) {
	var new_id = short_id.generate();
	db.save(new_id, {
		mvml: '', html: ''
	}, function(error, db_response) {
		//var rev = db_response.rev;
		response.redirect('/edit/'+new_id);
	});
});

app.get('/:id', function(request, response) {
	db.get(request.params.id, function(error, document) {
		response.send(document);
	});
});

app.get('/edit/:id', function(request, response) {
	response.send('edit '+request.params.id);
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
