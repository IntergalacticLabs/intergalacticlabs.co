L.mapbox.accessToken = 'pk.eyJ1IjoicGJyYW5kdDEiLCJhIjoiY2lmeDRsY25pM29yaXV1bTAzZXc3cnY3bSJ9.26vjnG9YuDapjlXB8ebHvg';
var map = L.mapbox.map('map', 'mapbox.mars-satellite')
    .setView([5, 150], 7);

// var map = L.map('map').setView([38.89399, -77.03659], 8);
// projection not correct here...
// var viking232m = L.tileLayer('http://dzw9r5p966egh.cloudfront.net/catalog/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0//default/default028mm/{z}/{y}/{x}.jpg', {
//   attribution: 'NASA',
//   //tms: true
// });
// viking232m.addTo(map);


var featureGroup = L.featureGroup().addTo(map);

// Define circle options
// http://leafletjs.com/reference.html#circle
var circle_options = {
    color: '#fff',      // Stroke color
    opacity: 1,         // Stroke opacity
    weight: 10,         // Stroke weight
    fillColor: '#000',  // Fill color
    fillOpacity: 0.6    // Fill opacity
};

// Define polyline options
// http://leafletjs.com/reference.html#polyline
var polyline_options = {
    color: '#000'
};


var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: featureGroup
  }
}).addTo(map);

map.on('draw:created', function(e) {
    featureGroup.addLayer(e.layer);
});

var coordinates = $('#coordinates');
map.on('move', function(e) {
  var ll = map.getCenter();
  coordinates.text('Lon: ' + ll.lng.toPrecision(5) + ', Lat: ' + ll.lat.toPrecision(5) + ', z: ' + map.getZoom());
})

var ll = map.getCenter();
coordinates.text('Lon: ' + ll.lng.toPrecision(5) + ', Lat: ' + ll.lat.toPrecision(5) + ', z: ' + map.getZoom());
