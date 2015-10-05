'use strict'
var moondb = require('dirty')('./moon.db');

moondb.on('load', function() {
  var craters = [];
  moondb.forEach(function(key, value) {
    if (key[0] == 'c') {
      craters.push(value);
    }
  })

  craters = craters.sort(function(a, b) {
    return b.radius - a.radius;
  });

  console.log('found', craters.length, 'craters');
  console.log(craters[0]);
  console.log(craters[1]);
  console.log(typeof craters[0].location.lat)

  var topleft = [0, 39];
  var bottomright = [10, 25];

  var top10 = [];
  for (var i = 0; i < craters.length; i++) {
    let c = craters[i];
    if (c.location.lon >= topleft[0]
      && c.location.lon <= bottomright[0]
      && c.location.lat <= topleft[1]
      && c.location.lat >= bottomright[1]) {
        top10.push(c);
        if (top10.length === 10) {
          break;
        }
      }
  }
  console.log(top10);
})
