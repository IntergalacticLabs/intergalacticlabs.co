// wow such oldschool
var COSM = {};

/**
 * Logging
 */
function log() {
  console.log.apply(console, arguments);
}

log.error = function() {
  console.log.apply(console, arguments);
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
      thisvar.join('.');
      thisvar = get(prop, thisvar);
    } else {
      thisvar = prop;
    }
    f.apply(thisvar, a);
  }
}


/**
 * Editing stuff
 */
COSM.editor = {};
var currentEditingNode = null;

var exitEditMode = COSM.editor.exitEditMode = function() {
  if (currentEditingNode) {
    call(currentEditingNode, 'layer.editing.disable');
  }
  currentEditingNode = null;
  $('.text').hide();
  $('.marker').hide();
  $('.tabs').hide();
}

COSM.editor.create = function(e) {
  var id = Math.random()*10101010|0;
  e.id = id;
  e.cosmData = {
    id: id,
    public: true
  }
}

COSM.editor.edit = function(e) {
  if (currentEditingNode === e) {
    log('already editing', e.id);
    return;
  }
  exitEditMode();
  currentEditingNode = e;

  call(e, 'layer.editing.enable');
  log('editing', e);

  log(e.layerType);
  var defaultprops = ['name', 'description', 'id', 'public', 'layertype', 'featuretype', 'coordinates', 'geoJSON']
  var shapeprops = {
    'circle': defaultprops.concat(['color', 'radius']),
    'marker': []
  }



  $('.text').show();
  $('.tabs').show();
}

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
   }
 }
