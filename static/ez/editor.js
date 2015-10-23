// wow such oldschool
var COSM = {};

COSM.urlRoot = "http://intergalacticlabs.co";


COSM.localStore = localStorage || {};

if (!COSM.localStore.user) {
  COSM.localStore.user = (Math.random()*8e11).toString(32);
}

// load a session
if (!COSM.localStore.session) {
  COSM.localStore.session = (Math.random()*8e11).toString(32);
}


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

  var id = COSM.localStore.user + '__' + (Math.random()*8e11).toString(32);
  e.id = id;

  if (e.layerType === 'marker') {
    e.layer.on('drag', function() {
      COSM.editor.edit(e);
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
    color: '#dcb439'
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

  call(e, 'layer.editing.enable');
  log('editing', e.id);

  // show and hide specific things based on the type of layer it is
  log(e.layerType);
  var allprops = ['name', 'description', 'featuretype', 'lng', 'lat', 'radius', 'color', 'point-image'];
  var defaultprops = ['name', 'description'];
  var shapeprops = {
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
  $('.tabs').show();
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

$('#ez-title').on('keyup', function() {
  var t = $(this).val()
  $('.bar .title').text(t);
  COSM.localStore.title = t;
})

if (COSM.localStore.title) {
  $('.bar .title').text(COSM.localStore.title)
  $('#ez-title').val(COSM.localStore.title)
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
})
$('input.email').keyup();
$('input.email').on('change', function() {
  $(this).keyup();
})


/**
 * Editor navigation
 */
var tabContent = ['.text', '.marker', '.general'];
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
  openTab('.general')
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
  }
}
var debounceQueue = COSM.db.debounceQueue;
var $saveText = $('.saveText');
