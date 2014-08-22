var fs = require('fs');
var path = require('path');
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

// CORS
/*var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);*/

// MVML
var mvml_server_post = {
  host: '127.0.0.1',
  port: 6865,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'text/mvml'
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
function convert_mvml(mvml_string, callback) {
  mvml_server_post.headers['Content-Length'] = mvml_string.length;
  make_request( mvml_server_post, mvml_string, callback );
}
function convert_mvml_file(file_path, callback) {
  fs.readFile(file_path, function(error, data) {
    if (error) {
      callback('Error reading MVML file: '+data);
    }
    convert_mvml(data, function(html) {
      callback(html);
    });
  });
}

express.static.mime.define({
  'text/mvml': ['mvml']
});
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.render('info');
});
app.get('/getting-started', function(request, response) {
  response.render('getting-started');
});

app.get('/mvml/:file', function(request, response) {
  var relative_path = './public/mvml/'+request.params.file+'.mvml';
  var absolute_path = path.resolve(__dirname, relative_path);
  convert_mvml_file(absolute_path, function(html) {
    response.send(html);
  });
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

app.get('/space/:id', function(request, response) {
  console.log("GET /:id");
  console.log("id: "+request.params.id);
	db.get(request.params.id, function(error, document) {
    if (error) {
      response.send('Invalid space ID: '+request.params.id);
    }
    else {
      var object = JSON.parse(document);
      if(object.html == '') {
        response.send('<div style="width:100%; text-align:center"><img src="construction.gif"/></div>');
      }
      else {
        response.send(object.html);
      }
    }
	});
});

app.get('/space/edit/:id', function(request, response) {
  db.get(request.params.id, function(error, document) {
    response.render('space/edit', {
      mvml: document
    });
  });
});

app.post('/edit/:id', function(request, response) {
  // TODO: check credentials
  var mvml = request.body.mvml;
  convert_mvml(mvml, function(html){
    db.merge(request.params.id, {
      name: request.body.name,
      mvml: request.body.mvml,
      html: html
    }, function(error, db_response) {
      if (error) {
        response.send("Couldn't save MVML entry: "+request.params.id);
      }
      response.redirect('/space/'+request.params.id);
    });
  });
});

app.get('/account', function(request, response) {
	response.send('your account');
});

app.get('/account/:id', function(request, response) {
	response.send(request.params.id+'\'s account');
});


server.listen(process.argv[2] || 8080);
console.log('mvml-host server started on port '+server.address().port);
