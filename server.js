var cradle = require('cradle');
var db = new(cradle.Connection)().database('mvml');

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
