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

function log() {
  console.log.apply(console, arguments);
}

log.error = function() {
  console.log.apply(console, arguments);
}
log.err = log.error;


var featureGroup = L.featureGroup().addTo(map);

// Define circle options
// http://leafletjs.com/reference.html#circle
var circle_options = {
    color: '#dcb439',      // Stroke color
    fillColor: '#dcb439',  // Fill color
    fillOpacity: 0.25    // Fill opacity
};

// Define polyline options
// http://leafletjs.com/reference.html#polyline
var polyline_options = {
    color: '#000'
};


var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: featureGroup
  }, draw: {
    circle: {
      shapeOptions: circle_options
    }
  }
}).addTo(map);

map.on('draw:created', function(e) {
  var id = e.id = Math.random()*10000000|0;
  e.layer.on('click', function() {
    log('clicked', id);
    edit(e);
  });
  featureGroup.addLayer(e.layer);
  log('created', id);
  edit(e);
});

var coordinates = $('#coordinates');
map.on('move', function(e) {
  var ll = map.getCenter();
  coordinates.text('Lon: ' + ll.lng.toPrecision(5) + ', Lat: ' + ll.lat.toPrecision(5) + ', z: ' + map.getZoom());
})

var ll = map.getCenter();
coordinates.text('Lon: ' + ll.lng.toPrecision(5) + ', Lat: ' + ll.lat.toPrecision(5) + ', z: ' + map.getZoom());

var currentEditingNode = null;

function exitEditMode() {
  if (currentEditingNode) {
    currentEditingNode.layer.editing.disable();
  }
  currentEditingNode = null;
}

function edit(e) {
  if (currentEditingNode === e) {
    log('already editing', e.id);
    return;
  }
  exitEditMode();
  currentEditingNode = e;
  e.layer.editing.enable();
  log('editing', e);
}

map.on('click', function() {
  log('clicked map');
  exitEditMode();
})
