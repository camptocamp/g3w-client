const {inherit, base} = require('core/utils/utils');
const FeaturesStore = require('./featuresstore');

// Storage of the feature in vector layer
function OlFeaturesStore(options={}) {
  base(this, options);
  this._features = options.features || new ol.Collection([]);
}

inherit(OlFeaturesStore, FeaturesStore);

const proto = OlFeaturesStore.prototype;

proto.getLength = function() {
  return this._features.getLength();
};

//overwrite
proto.setFeatures = function(features=[]) {
  features.forEach((feature) => {
    this._features.push(feature);
  })
};
// overwrite
proto.readFeatures = function() {
  return this._features.getArray();
};

proto.getFeaturesCollection = function() {
  return this._features;
};

proto.getFeatureById = function(featureId) {
  return this._features.getArray().find((feature) => {
    return feature.getId() == featureId;
  });
};

proto.getFeatureByUid = function(uid) {
  return this._features.getArray().find((feature) => {
    return feature.getUid() === uid;
  });
};

proto._addFeature = function(feature) {
  this._features.push(feature);
  // useful for ol.source.Vector
  this._features.dispatchEvent('change')
};

//sobtitute the feature after modify
proto._updateFeature = function(feature) {
  // set index at -1
  let index = -1;
  const featuresArray = this._features.getArray();
  for (let i = 0; featuresArray.length; i++) {
    const _feature = featuresArray[i];
    if(_feature.getUid() === feature.getUid()) {
      index = i;
      break;
    }
  }
  if (index >=0) {
    this._features.removeAt(index);
    this._features.insertAt(index, feature);
    this._features.dispatchEvent('change')
  }
};

// remove feature from store
proto._removeFeature = function(feature) {
  const featuresArray = this._features.getArray();
  for (let i = 0; i < featuresArray.length; i++) {
    const feat = featuresArray[i];
    if (feature.getUid() === feat.getUid()) {
      this._features.removeAt(i);
      break;
    }
  }
  this._features.dispatchEvent('change')
};


proto._clearFeatures = function() {
  try {
    this._features.clear();
  } catch(err){}
  this._features = null;
  this._features = new ol.Collection([]);
};

module.exports = OlFeaturesStore;
