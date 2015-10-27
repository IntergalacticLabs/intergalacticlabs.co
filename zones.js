var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  id: {
    type: String,
    index: true
  },
  name: String,
  email: String,
  user: String,
  description: String,
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
    ownerIP: String
  }
})

schema.index({
  'zone.geometry': '2dsphere'
})

schema.pre('save', function(next) {
  this.meta.updated = Date.now();
  next();
})

var zones = module.exports = mongoose.model('Zone', schema, 'zones');

//
zones.upsert = function(zone, cb) {
  zones.update({id: zone.id}, zone, {upsert: true}, function(e, r) {
    if (e) return cb(e);
    cb(null, r);
  })
}
