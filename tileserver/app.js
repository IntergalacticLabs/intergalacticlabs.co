var express = require('express');
var app = express();
var url = require('url');

// Increase the libuv threadpool size to 1.5x the number of logical CPUs.
var threadpool_size = Math.ceil(Math.max(4, require('os').cpus().length * 1.5));
process.env.UV_THREADPOOL_SIZE = threadpool_size

var fs = require('fs');
var mapnik = require('mapnik');
// register fonts and datasource plugins
mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

var stylesheet = __dirname + '/demo/world_latlon.xml';
var concurrency = 32;
var palette = false; // process.argv[5] ? new mapnik.Palette(fs.readFileSync(process.argv[5]), 'act') : false;

var renderer = require('./renderer')({
    stylesheet: stylesheet,
    concurrency: concurrency,
    palette: palette
});

function isPNG(data) {
    return data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E &&
        data[3] === 0x47 && data[4] === 0x0D && data[5] === 0x0A &&
        data[6] === 0x1A && data[7] === 0x0A;
}

function lowercaseProps(obj) {
  return Object.keys(obj).reduce(function (obj2, k) {
    obj2[k.toLowerCase()] = obj[k];
    return obj2;
  }, {})
}

app.get('/demo', function(req, res) {
  res.sendfile(__dirname + '/demo/leaflet.html')
})

app.get('/tiles/*', function(req, res) {
  var uri = url.parse(req.originalUrl.toLowerCase(), true);
  renderer(uri.query, function(err, tile) {
      if (err || !tile || !isPNG(tile)) {
        console.error(err);
          res.set({
              'Content-Type': 'text/plain; charset=utf-8'
          });
          res.sendStatus(500);
      } else {
          res.set({
              'Content-Length': tile.length,
              'Content-Type': 'image/png'
          });
          res.send(tile);
      }
  })
})

if (!module.parent) {
  app.listen(8888, function(e) {
    if (e) { return console.error(e) }
    console.log('listening at port 8888');
  })
} else {
  module.exports = app;
}
