var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  id: {
    type: Number,
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
  layerType: String,
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
    }
  }
})

schema.index({
  'feature.geometry': '2dsphere'
})

var features = module.exports = mongoose.model('Feature', schema, 'features');
