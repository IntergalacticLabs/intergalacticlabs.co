L.mapbox.accessToken = 'pk.eyJ1IjoicGJyYW5kdDEiLCJhIjoiY2lmeDRsY25pM29yaXV1bTAzZXc3cnY3bSJ9.26vjnG9YuDapjlXB8ebHvg';
var map = L.mapbox.map('map', 'mapbox.mars-satellite')
    .setView([5, 150], 9);

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
    color: '#dcb439',      // Stroke color
    fillColor: '#dcb439',  // Fill color
    fillOpacity: 0.25    // Fill opacity
};

// Define polyline options
// http://leafletjs.com/reference.html#polyline
var polyline_options = {
    color: '#dcb439'
};

var markers = COSM.markers;

var drawControl = new L.Control.Draw({
  edit: {
    featureGroup: featureGroup
  }, draw: {
    circle: {
      shapeOptions: circle_options
    },
    polyline: {
      shapeOptions: polyline_options
    },
    rectangle: {
      shapeOptions: circle_options
    },
    polygon: {
      shapeOptions: circle_options
    },
    marker: {
      draggable: true,
      icon: L.icon({
        iconUrl: '/images/maki/marker-blue-24.svg',
        iconAnchor: L.point(12, 21)
      })
    }
  }
}).addTo(map);

map.on('draw:created', function(e) {
  COSM.editor.create(e);
  e.layer.on('click', function() {
    log('clicked', e.id);
    COSM.editor.edit(e);
  });
  featureGroup.addLayer(e.layer);
  log('created', e.id);
  COSM.db.save(e);
  COSM.editor.edit(e);
});

var coordinates = $('#coordinates');
map.on('move', function(e) {
  var ll = map.getCenter();
  coordinates.text('Lon: ' + ll.lng.toPrecision(5) + ', Lat: ' + ll.lat.toPrecision(5) + ', z: ' + map.getZoom());
})

var ll = map.getCenter();
coordinates.text('Lon: ' + ll.lng.toPrecision(5) + ', Lat: ' + ll.lat.toPrecision(5) + ', z: ' + map.getZoom());

map.on('click', function() {
  log('clicked map');
  COSM.editor.exitEditMode();
  $('.leaflet-marker-icon').removeClass('selected');
})

map.on('draw:drawstart', function() {
  log('start')
})
