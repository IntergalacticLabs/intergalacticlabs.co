var Promise = require('bluebird');
var dirty = require('dirty');
var uuid = require('uuid');
var mongoose = require('mongoose');
var config = require('config');

if (mongoose.connection.readyState == 0) {
    mongoose.connect(config.mongodb.url);
    var db_conn = mongoose.connection;
    db_conn.on('error', function(err) {
        logger.log({
            message: 'error connecting to mongodb',
            err: err
        });
    });
    db_conn.on('open', function(){
        console.log('connected to mongodb', config.mongodb.url);
    });
}

// var sql = requrie('sqlite3');
// var db = new sql.Database('intergalacticlabs.sqlite3', function() {
//   db.run('create table if not exists ')
// })

var comments = dirty(__dirname + '/comments.db');
var commentsReady = new Promise(function (resolve, reject) {
  comments.on('load', function() {
    resolve();
  })
})

var invites = dirty(__dirname + '/invites.db');
var invitesReady = new Promise(function (resolve, reject) {
  invites.on('load', function() {
    resolve();
  })
})

var moondb = dirty(__dirname + '/moon.db');
var marsdb = dirty(__dirname + '/mars.db');

module.exports = {
    moondb: moondb,
    marsdb: marsdb,
    comments: {
        save: function(comment){
          return commentsReady.then(function() {
            comments.set(uuid.v4(), comment);
            console.log('saving', comment);
            return comment;
          })
        }
    },
    invites: {
        save: function(invite){
          return invitesReady.then(function() {
            invites.set(uuid.v4(), invite);
            console.log('saving', invite);
            return invite;
          })
        }
    },
    moon: {
      save: function (feature) {
        return moonReady.then(function() {
          if (!feature.id) {
            feature.id = uuid.v4();
          }
          moon.set(feature.id, feature);
          console.log('saving feature', feature);
          return feature;
        })
      },
      LANDING_TARGET: 0
    },
    features: require('./features'),
    zones: require('./zones')
};
