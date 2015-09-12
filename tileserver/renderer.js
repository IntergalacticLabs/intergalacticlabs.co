var mapnik = require('mapnik');
var fs = require('fs');
var path = require('path');
var util = require('util');
var Pool = require('./pool');

module.exports = function(args) {
    if (!args.stylesheet) throw new Error('missing stylesheet');
    args.stylesheet = path.resolve(args.stylesheet);
    if (!args.concurrency) args.concurrency = 10;
    if (!args.bufferSize) args.bufferSize = 0;

    var created = 0;
    var maps = new Pool(function() {
        var map = new mapnik.Map(256, 256);
        map.bufferSize = args.bufferSize;
        map.load(args.stylesheet, {
            strict: true,
            base: path.dirname(args.stylesheet)
        }, function(err, map) {
            if (err) throw err;
            map.zoomAll();
            created++;
            util.print('\rCreating map objects (' + created + '/' + args.concurrency + ')...');
            maps.release(map);
        });
    }, args.concurrency);

    return function(query, callback) {
        query.width = +query.width || 256;
        query.height = +query.height || 256;
        if (query.width < 1 || query.width > 2048 || query.height < 1 || query.height > 2048) {
            return callback(new Error('Invalid size: ' + query.width + '×' + query.height));
        }

        var bbox = query.bbox ? query.bbox.split(',') : [];
        console.log(bbox);
        if (bbox.length !== 4) return callback(new Error('Invalid bbox: ' + util.inspect(bbox)));
        bbox = bbox.map(parseFloat);
        console.log(bbox);
        for (var i = 0; i < 4; i++) {
            if (isNaN(bbox[i])) return callback(new Error('Invalid bbox: ' + util.inspect(bbox)));
        }

        maps.acquire(function(map) {
            map.resize(query.width, query.height);
            if (query.srs) map.srs = '+init=' + query.srs;
            map.extent = bbox;

            var canvas = new mapnik.Image(query.width, query.height);
            map.render(canvas, function(err, image) {
                // Wait until the next tick to avoid Mapnik warnings.
                process.nextTick(function() { maps.release(map); });

                if (err) {
                    callback(err);
                } else {
                    if (args.palette) {
                        image.encode('png8:z=1', {palette: args.palette}, callback);
                    } else {
                        image.encode('png32:z=1', callback);
                    }
                }
            });
        });
    };
};
