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

/**
 * Loading stuff from db
 */
$(document).ready(function() {
  Object.keys(COSM.localStore).map(function(k) {
    var o = COSM.localStore[k] || '{}';
    try {
      o = JSON.parse(o)
    } catch (e) { return }
    if (!o || !o.id) {
      return;
    }

    var options = {
      color: o.color,
      fillColor: o.color,
      fillOpacity: .25,
      draggable: true
    }
    log(o)
    var node = {
      id: o.id,
      cosmData: o,
      layerType: o.layerType
    };
    switch (o.layerType) {
      case 'circle':
        log('circle');
        node.layer = L.circle([o.feature.geometry.coordinates[1], o.feature.geometry.coordinates[0]], o.radius, options);
        break;
      case 'marker':
        log('marker')
        node.layer =  L.marker([o.feature.geometry.coordinates[1], o.feature.geometry.coordinates[0]], {
          draggable: true,
          icon: L.icon({
            iconUrl: node.cosmData.markerIcon.iconUrl,
            iconAnchor: L.point([node.cosmData.markerIcon.iconAnchor.x, node.cosmData.markerIcon.iconAnchor.y])
          })
        })
        node.layer.on('dragstart', function() {
          log('dragstart')
          COSM.editor.edit(node);
        })
        node.layer.on('drag', function() {
          updateprops()
        })
        node.layer.on('click', function() {
          $('.leaflet-marker-icon').removeClass('selected');
          $(this._icon).addClass('selected');
        })
        break;
      case 'rectangle':
        log('rectangle')
        var bounds = L.latLngBounds(L.latLng(o.feature.geometry.coordinates[0][0][1], o.feature.geometry.coordinates[0][0][0]),
          L.latLng(o.feature.geometry.coordinates[0][2][1], o.feature.geometry.coordinates[0][2][0]));
        node.layer = L.rectangle(bounds, options)
        break;
      case 'polygon':
        log('polygon')
        var line = o.feature.geometry.coordinates[0].map(function(c) {
          // lon,lat to lat,lng
          return L.latLng(c[1], c[0])
        })
        node.layer = L.polygon(line, options)
        break;
      case 'polyline':
        log('polyline')
        var line = o.feature.geometry.coordinates.map(function(c) {
          // lon,lat to lat,lng
          return L.latLng(c[1], c[0])
        })
        node.layer = L.polyline(line, {
          color: o.color
        })
        break;
      default:
        log('default')
    }

    //featureGroup.addLayer(node.layer);
    node.layer.addTo(featureGroup)
    node.layer.on('edit', updateprops);
    node.layer.on('click', function() {
      log('clicked', node.id);
      COSM.editor.edit(node);
    });

  })
})
