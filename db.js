var Promise = require('bluebird');
var dirty = require('dirty');
var uuid = require('uuid');


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

var moon = dirty(__dirname + '/moon.db');
var moonReady = new Promise(function (resolve, reject) {
  moon.on('load', function() {
    resolve();
  })
})

module.exports = {
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
    }
};
