var fs = require('fs');
var http = require('http');

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

// Passport
//var passport = require('passport');
//var FacebookStrategy = require('passport-facebook').Strategy;
// http://passportjs.org/guide/facebook/

// ShortID
var short_id = require('shortid');

// MVML
var mvml_server_post = {
  host: '127.0.0.1',
  port: 6865,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/mvml'
  }
};
function make_request(options, body, callback) {
  // TODO: deal with errors
  var post_request = http.request(options, function(response) {
    //post_request.setEncoding('utf-8');
    var response_data = '';
    response.on('data', function(data) {
      response_data += data;
    });
    response.on('end', function() {
      callback(response_data);
    });
  });
  post_request.write(body);
  post_request.end();
}



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
    // TODO: deal with errors - if(error)
		response.redirect('/edit/'+new_id);
	});
});

app.get('/:id', function(request, response) {
  console.log("GET /:id");
  console.log("id: "+request.params.id);
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
  var mvml = request.body.mvml;
  mvml_server_post.headers['Content-Length'] = mvml.length;
  make_request(mvml_server_post, mvml, function(response_data){
    db.merge(request.params.id, {
      name: request.body.name,
      mvml: request.body.mvml,
      html: response_data
    }, function(error, db_response) {
      response.redirect('/'+request.params.id);
    });
  });
});

app.get('/account', function(request, response) {
	response.send('your account');
});

app.get('/account/:id', function(request, response) {
	response.send(request.params.id+'\'s account');
});

server.listen(8080);
console.log('mvml-host server started on port '+server.address().port);
