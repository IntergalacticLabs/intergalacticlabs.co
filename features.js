var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  id: {
    type: String,
    index: true
  },
  name: String,
  description: String,
  featuretype: {
    type: String,
    index: true
  },
  feature: {
    geometry: {},
    properties: {}
  },
  radius: Number,
  color: String,
  layerType: String,
  markerIcon: {},
  public: {
    type: Boolean,
    default: true
  },

  // stuff not sent to front end
  meta: {
    created: {
      type: Date,
      default: Date.Now
    },
    updated: {
      type: Date,
      default: Date.Now
    },
    ownerSession: String,
    ownerIP: String,
    email: String,
    user: String, // user from browser
    zone: {
      type: String, // zone from browser
      index: true
    }
  }
})

schema.index({
  'feature.geometry': '2dsphere'
})

schema.pre('save', function(next) {
  this.meta.updated = Date.now();
  next();
})

var features = module.exports = mongoose.model('Feature', schema, 'features');

//
features.upsert = function(feature, cb) {
  features.update({id: feature.id}, feature, {upsert: true}, function(e, r) {
    if (e) return cb(e);
    cb(null, r);
  })
}
