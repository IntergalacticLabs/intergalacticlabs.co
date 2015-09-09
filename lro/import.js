var fs = require('fs')
var _ = require('lodash')

var offset = 1737400.0;
var scalingFactor = 0.5;
var lines = 720;
var bytesPerLine = 5760;

var fd = fs.openSync('./LDEM_4_FLOAT.IMG', 'r');

var max = 0;
var min = 0;
var points = [];

for (var line = 0; line < lines; line++) {
  var buff = new Buffer(bytesPerLine)
  fs.readSync(fd, buff, 0, bytesPerLine, null)
  for (var i = 0; i < buff.length; i = i + 4) {
    var height = buff.readFloatLE(i)
    if (height > max) max = height;
    if (height < min) min = height;

    var lat = 0 - (line - 359.5)/4
    var lon = 180 - (i/4 - 719.5)/4
    points.push([lon, lat, height]);
  }
}

console.log(_.max(points.map(function(p) { return p[0]})))
console.log(_.max(points.map(function(p) { return p[1]})))
console.log(_.max(points.map(function(p) { return p[2]})))
console.log(_.min(points.map(function(p) { return p[0]})))
console.log(_.min(points.map(function(p) { return p[1]})))
console.log(_.min(points.map(function(p) { return p[2]})))
