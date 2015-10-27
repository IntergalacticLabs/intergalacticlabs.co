// wow such oldschool
var COSM = {};

COSM.urlRoot = "http://intergalacticlabs.co";

COSM.localStore = localStorage || {};
COSM.localStore.loadedZones = COSM.localStore.loadedZones || '';

COSM.markers = {
  yellow: {
    iconUrl: '/images/maki/marker-yellow-24.svg',
    iconAnchor: L.point(12, 21)
  },
  blue: {
    iconUrl: '/images/maki/marker-blue-24.svg',
    iconAnchor: L.point(12, 21)
  },
  white: {
    iconUrl: '/images/maki/marker-white-24.svg',
    iconAnchor: L.point(12, 21)
  },
  red: {
    iconUrl: '/images/maki/marker-red-24.svg',
    iconAnchor: L.point(12, 21)
  },
  black: {
    iconUrl: '/images/maki/marker-24.svg',
    iconAnchor: L.point(12, 21)
  },
  base: {
    iconUrl: '/images/maki/base-yellow-24.svg',
    iconAnchor: L.point(12, 12)
  },
  landing: {
    iconUrl: '/images/maki/rocket-yellow-24.svg',
    iconAnchor: L.point(12, 12)
  }
};

/**
 * Logging
 */
COSM.DEBUG = true;
function log() {
  COSM.DEBUG && console.log.apply(console, arguments);
}

log.error = function() {
  COSM.DEBUG && console.log.apply(console, arguments);
}
log.err = log.error;


/**
 * hacky wizardy voodoo for easy/safe getting of props and calling of functions
 */
var get = _.get;
var call = function(prop, fpath) {
  var f = get(prop, fpath);
  if (typeof f === 'function') {
    var a = Array.prototype.slice.call(arguments).slice(2);
    if (fpath.indexOf('.') > 0) {
      var thisvar = fpath.split('.');
      thisvar.pop();
      thisvar = thisvar.join('.');
      thisvar = get(prop, thisvar);
    } else {
      thisvar = prop;
    }
    return f.apply(thisvar, a);
  }
}


/**
 * Editing stuff
 */
COSM.editor = {};
var currentEditingNode = COSM.editor.currentEditingNode = null;

var exitEditMode = COSM.editor.exitEditMode = function() {
  if (currentEditingNode) {
    call(currentEditingNode, 'layer.editing.disable');
  }
  currentEditingNode = null;
  $('.text').hide();
  $('.marker').hide();
  $('.general').hide();
  $('.tabs').hide();
}


COSM.editor.create = function(e) {
  e.layer.options.draggable = true;

  var id = COSM.localStore.user + '.' +  COSM.localStore.zone + '.' + Math.random().toString(36).slice(2)
  e.id = id;

  if (e.layerType === 'marker') {
    e.layer.on('dragstart', function() {
      COSM.editor.edit(e);
    })
    e.layer.on('drag', function() {
      updateprops();
    })
  }
  e.layer.on('edit', updateprops);

  // cosmData is all the stuff persisted to db
  e.cosmData = {
    id: id,
    public: true,
    featuretype: 'science',
    feature: call(e, 'layer.toGeoJSON'),
    radius: call(e, 'layer.getRadius'),
    layerType: e.layerType,
    color: '#dcb439',
    markerIcon: COSM.markers.blue
  };
  COSM.db.save(e);
}

COSM.editor.edit = function(e) {
  if (currentEditingNode === e) {
    log('already editing', e.id);
    return;
  }
  exitEditMode();
  currentEditingNode = e;

  if (currentEditingNode.layerType !== 'marker') {
    $('.leaflet-marker-icon').removeClass('selected');
  }

  call(e, 'layer.editing.enable');
  log('editing', e.id);

  // show and hide specific things based on the type of layer it is
  log(e.layerType);
  var allprops = ['name', 'description', 'featuretype', 'lng', 'lat', 'radius', 'color', 'point-image', 'tabs'];
  var defaultprops = ['name', 'description', 'tabs'];
  var shapeprops = {
    'zone': ['general'],
    'circle': defaultprops.concat(['lng', 'lat', 'radius', 'featuretype', 'color']),
    'marker': defaultprops.concat(['lng', 'lat', 'point-image', 'featuretype']),
    'rectangle': defaultprops.concat(['featuretype', 'color']),
    'polygon': defaultprops.concat(['featuretype', 'color']),
    'polyline': defaultprops.concat(['color'])
  }[e.layerType];

  allprops.map(function(p) {
    $('.' + p).hide();
  })

  shapeprops.map(function(p) {
    $('.' + p).show();
  })

  updateprops();

  $('.option-text').click();
}


// load a zone
COSM.editor.init = function() {
  if (!COSM.localStore.user) {
    COSM.localStore.user = Math.random().toString(36).slice(2);
  }

  if (typeof document.location.pathname.split('/mars/')[1] !== 'undefined') {
    var zone = document.location.pathname.split('/mars/')[1];
    if (COSM.localStore.zone === zone) {
      COSM.editor.loadFromLocalStore();
    } else {
      COSM.localStore.zone = zone;
      COSM.db.loadZone(COSM.localStore.zone, function() {
        log('loaded zone', COSM.localStore.zone);
        COSM.editor.loadFromLocalStore();
      })
    }
  } else if (typeof COSM.localStore.zone !== "undefined") {
    log("loading", COSM.localStore.zone);
    window.history.pushState({}, "", "/mars/" + COSM.localStore.zone)
    COSM.editor.loadFromLocalStore();
  } else {
    $('.ez-new').click()
  }

  var link = 'http://intergalacticlabs.co/mars/' + COSM.localStore.zone
  $('a.link').attr('href', link)
  $('a.link').text(link)
}
$(document).ready(function() {
  log('init');
  COSM.editor.init();
})

COSM.editor.loadFromLocalStore = function() {
  log('loadFromLocalStore');
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
      case 'zone':
        log('zone');
        node.layer = L.circle([o.feature.geometry.coordinates[1], o.feature.geometry.coordinates[0]], o.radius, {
          color: o.color,
          fill: false
        });
        COSM.editor.zone = node;
        $('#ez-lng').val(node.layer.getLatLng().lng);
        $('#ez-lat').val(node.layer.getLatLng().lat);
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
}

/**
 * Property changes
 */
var updateprops = COSM.editor.updateprops = function() {
  var e = currentEditingNode;
  e.cosmData.feature = call(e, 'layer.toGeoJSON');
  e.cosmData.radius = call(e, 'layer.getRadius');
  // fill in all the props, only show the ones required
  $('input#name').val(e.cosmData.name || '');
  $('textarea#description').val(e.cosmData.description || '');
  $('input.' + e.cosmData.featuretype).attr('checked', 'checked');
  if (e.layerType === 'circle' || e.layerType === 'marker') {
    $('#lng').val(e.cosmData.feature.geometry.coordinates[0].toFixed(4))
    $('#lat').val(e.cosmData.feature.geometry.coordinates[1].toFixed(4))
    $('#radius').val((e.cosmData.radius || 0).toFixed(1))
  }
  if (e.layerType === 'zone') {
    $('#ez-lng').val(e.cosmData.feature.geometry.coordinates[0].toFixed(4))
    $('#ez-lat').val(e.cosmData.feature.geometry.coordinates[1].toFixed(4))
  }
  COSM.db.debounceSave(e);
}

$('input#name').on('keyup', function() {
  currentEditingNode.cosmData.name = $(this).val();
  COSM.db.debounceSave(currentEditingNode)
})

$('#description').on('keyup', function() {
  currentEditingNode.cosmData.description = $(this).val();
  COSM.db.debounceSave(currentEditingNode)
})

$('.color>div').on('click', function() {
  var color = $(this).css("background-color");
  currentEditingNode.layer.setStyle({
    fillColor: color,
    color: color
  });
  currentEditingNode.cosmData.color = color;
  COSM.db.save(currentEditingNode)
})

$('.featuretype input').on('click', function() {
  currentEditingNode.cosmData.featuretype = $(this).val();
  COSM.db.save(currentEditingNode)
})

$('a.marker').on('click', function() {
  var icon = currentEditingNode.cosmData.markerIcon = COSM.markers[$(this).attr('data-marker')];
  currentEditingNode.layer.setIcon(L.icon(icon));
  COSM.db.save(currentEditingNode)
})

$('#ez-title').on('keyup', function() {
  var t = $(this).val()
  $('.bar .title').text(t);
  COSM.localStore.title = t;
  COSM.db.debounceSaveZone();
})

if (COSM.localStore.title) {
  $('.bar .title').text(COSM.localStore.title)
  $('#ez-title').val(COSM.localStore.title)
} else {
  COSM.localStore.title = $('#ez-title').val();
}

if (COSM.localStore.email) {
  $('input.email').val(COSM.localStore.email);
}

$('input.email').on('keyup', function() {
  var hash = md5($(this).val())
  log(hash)
  $('.face').css('background-image', 'url(http://www.gravatar.com/avatar/'
    + hash
    + '?s=40&d='
    + encodeURIComponent(COSM.urlRoot + '/images/spacesuit-profile.jpg')
    + ')')
  log(COSM.localStore.email)
  COSM.localStore.email = $(this).val();
  COSM.db.debounceSaveZone();
})
$(document).ready(function() {
  $('input.email').keyup();
})
$('input.email').on('change', function() {
  $(this).keyup();
})

$(document).on('change', '#ez-lng, #ez-lat', function() {
  COSM.editor.zone.layer.setLatLng(L.latLng(
    parseFloat($('#ez-lng').val()),
    parseFloat($('#ez-lat').val())
  ))
  COSM.db.debounceSave(e);
})

$('.ez-new').click(function() {
  if (typeof COSM.localStore.zone !== 'undefined'
      && COSM.localStore.loadedZones.indexOf(COSM.localStore.zone) < 0) {
    COSM.localStore.loadedZones += COSM.localStore.zone;
  }
  COSM.localStore.zone = Math.random().toString(36).slice(2);
  COSM.localStore.title = "New Exploration Zone";
  $('.ez-title').val(COSM.localStore.title);
  var zoneEditableLayer = {
    layer: L.circle([5, 150], 100000, {
      color: '#dcb439',
      fill: false
    }),
    layerType: 'zone',
    color: '#dcb439'
  }
  COSM.editor.create(zoneEditableLayer);
  window.history.pushState({}, "", "/mars/" + COSM.localStore.zone)
  COSM.editor.loadFromLocalStore();
  COSM.db.debounceSaveZone();
})

/**
 * Editor navigation
 */
var tabContent = ['.text', '.marker'];
var tabs = ['.option-text', '.option-marker'];
function openTab(content, tab) {
  tabs.map(function(t) {
    $(t).removeClass('active');
  })
  tabContent.map(function(t) {
    $(t).hide();
  })
  if (tab) {
    $(tab).addClass('active');
  }
  $(content).show();
}

$('.option-text').on('click', function() {
  openTab('.text', '.option-text')
})

$('.option-marker').on('click', function() {
  openTab('.marker', '.option-marker')
})

$('.bar').on('click', function() {
  $('.general').show();
})

$('.trash').on('click', function() {
  var id = currentEditingNode.id;
  // fuck it.  bring on the coupling
  featureGroup.removeLayer(currentEditingNode.layer)
  delete COSM.localStore[id];
  COSM.db.delete(currentEditingNode);
  exitEditMode()
})

$('.done').on('click', function() {
  exitEditMode();
})


/**
 * Saving stuff to db
 */
COSM.db = {
  save: function(e) {
    log('saving', e.id);
    log(e.cosmData);
    //  $saveText.css('transition', '')
    //  $saveText.css('opacity', 1)
    $.ajax({
      url: '/mars/save',
      type: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: JSON.stringify(e.cosmData),
      success: function(r) {
        log('saved', e.id);
        $saveText.text('saved')
      }
    })

    COSM.localStore[e.id] = JSON.stringify(e.cosmData);
    //  $saveText.css('transition', 'opacity 5s ease-in-out')
    //  $saveText.css('opacity', 0)
  },

  // it's like save, but uses debounce with two seconds
  debounceSave: function(e) {
    log('debouncing save', e.id)
    debounceQueue[e.id] && clearTimeout(debounceQueue[e.id])
    debounceQueue[e.id] = setTimeout(function() {
      COSM.db.save(e)
      delete debounceQueue[e.id]
    }, 1000)
    //  $saveText.css('transition', '')
    //  $saveText.css('opacity', 1)
    $saveText.text('saving...')
  },
  debounceQueue: {},
  delete: function(e) {
    debounceQueue[e.id] && clearTimeout(debounceQueue[e.id])
  },
  loadZone: function(zone) {
    $.ajax({
      url: '/mars/zone/' + zone,
      type: 'GET',
      headers: {'Content-Type': 'application/json'},
      success: function(r) {
        log('loaded', zone);
        COSM.localStore.zone = zone;
        COSM.localStore.user = r.zone.user;
        COSM.localStore.email = r.zone.email;
        COSM.localStore.title = r.zone.name;
        r.features.map(function(f) {
          COSM.localStore[f.id] = JSON.stringify(f);
        })
        COSM.editor.loadFromLocalStore();
      }
    })

  },
  saveZone: function() {
    $.ajax({
      url: '/mars/zone',
      type: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: JSON.stringify({
        id: COSM.localStore.zone,
        name: COSM.localStore.title,
        email: COSM.localStore.email,
        user: COSM.localStore.user
      }),
      success: function(r) {
        log('saved', COSM.localStore.zone)
        $saveText.text('saved')
      }
    })
  },
  debounceSaveZone: function () {
    var zone = COSM.localStore.zone;
    log('debouncing save zone')
    debounceQueue[zone] && clearTimeout(debounceQueue[zone])
    debounceQueue[zone] = setTimeout(function() {
      COSM.db.saveZone();
      delete debounceQueue[zone]
    }, 1000)
    $saveText.text('saving...')
  }
}
var debounceQueue = COSM.db.debounceQueue;
var $saveText = $('.saveText');
