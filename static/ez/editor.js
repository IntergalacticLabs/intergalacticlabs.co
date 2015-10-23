// wow such oldschool
var COSM = {};

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
    currentEditingNode.layer.off('drag', updateprops);
  }
  currentEditingNode = null;
  $('.text').hide();
  $('.marker').hide();
  $('.tabs').hide();
}

COSM.editor.create = function(e) {
  e.layer.options.draggable = true;

  var id = Math.random()*10101010|0;
  e.id = id;

  // cosmData is all the stuff persisted to db
  e.cosmData = {
    id: id,
    public: true,
    featuretype: 'science',
    feature: call(e, 'layer.toGeoJSON'),
    radius: call(e, 'layer.getRadius'),
    layerType: e.layerType
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
    'marker': defaultprops.concat(['lng', 'lat', 'point-image']),
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
  e.layer.on('drag', updateprops);

  $('.option-text').click();
  $('.tabs').show();
}


/**
 * Property changes
 */
var updateprops = COSM.editor.updateprops = function() {
  var e = currentEditingNode;
  e.cosmData.feature = call(e, 'layer.toGeoJSON');
  e.radius = call(e, 'layer.getRadius');
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

/**
 * Editor navigation
 */
$('.option-text').on('click', function() {
  $('.option-text').addClass('active');
  $('.option-marker').removeClass('active');
  $('.marker').hide();
  $('.text').show();
})

$('.option-marker').on('click', function() {
  $('.option-text').removeClass('active');
  $('.option-marker').addClass('active');
  $('.text').hide();
  $('.marker').show();
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
  debounceQueue: {}
}
var debounceQueue = COSM.db.debounceQueue;
var $saveText = $('.saveText');
