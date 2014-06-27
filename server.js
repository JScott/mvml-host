var fs = require('fs');

var express = require('express');
var app = express();
//app.enable('trust proxy');
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

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

app.use(express.static(process.cwd() + '/public'));

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
		response.send(document);
	});
});

app.get('/edit/:id', function(request, response) {
  db.get(request.params.id, function(error, document) {
    response.render('space/edit', {
      mvml: 'hi'
    });
    //serve_view('/space/edit.html', response);
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


function serve_view(template, response) {
  template = process.cwd().concat('/views'+template);
  fs.exists(template, function(exists) {
    if (!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }
    fs.readFile(template, "binary", function(error, file) {
      if (error) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}

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
