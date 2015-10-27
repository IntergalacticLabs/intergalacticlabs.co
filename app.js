var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var db = require('db');
var email = require('./email');
var config = require('config');
var request = require('request');
var app = express();
var blog = require('./blog/blog.js');

console.log(JSON.stringify(config, null, 2));

app.use(bodyParser.json());
app.use(favicon(__dirname + '/static/images/favico.png'));
app.set('view engine', 'jade');
app.set('views', '.');

app.use(express.static('static'));
app.use(require('./auth'));

app.get('/', function(req, res, next) {
    res.render('soon', {posts: blog.posts})
})

app.get('/moon', function(req, res) {
  res.sendfile(__dirname + '/tileserver/demo/leaflet.html')
})


app.post('/mars/save', function(req, res, next) {
  console.log('saving', req.body.id, 'for user', req.user.id);
  req.body.meta = {};
  req.body.meta.ownerSession = req.user.id;
  req.body.meta.user = req.body.id.split('.')[0]
  req.body.meta.zone = req.body.id.split('.')[1]
  req.body.meta.ownerIP = req.ip;
  db.features.upsert(req.body, function(e) {
    if (e) {
      console.error(e);
    }
  });
  res.send(200);
})

// gets a subset of features
app.get('/mars/zone/:zone', function(req, res, next) {
  db.zones.findOne({id: req.params.zone}, function(e, zone) {
    db.features.find({'meta.zone': req.params.zone}, function(e, r) {
      res.send({
        zone: zone,
        features: r
      })
    })
  })
})

// saves a session
app.post('/mars/zone', function(req, res, next) {
  console.log('saving session', req.body.id);
  req.body.meta = {};
  req.body.meta.ownerSession = req.user.id;
  req.body.meta.ownerIP = req.ip;
  db.zones.upsert(req.body, function(e) {
    if (e) {
      console.error(e);
    }
  })
  res.send(200);
})


app.get('/mars*', function(req, res) {
  if (req.query.hasOwnProperty('react')) {
    res.render('ez/ez-react')
  } else {
    res.render('ez/ez', {})
  }
})

app.use('/slack', require('./slack.js'))

app.post('/comment', function(req, res, next) {
    console.log(req.body);
    db.comments.save(req.body);
    email.send('peter@intergalacticlabs.co', 'new comment', 'comment: ' + JSON.stringify(req.body));
    res.send('T_T');
})

app.use('/blog', blog.app);

app.listen(config.app.port, function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log('──────────────▄▀▄───────────────\n\
────────────▄▀───▀▄─────────────\n\
──────────▄▀──▄▄▄──▀▄───────────\n\
────────▄▀──▄▀─▄─▀▄──▀▄─────────\n\
──────▄▀─────▀▄▄▄▀─────▀▄───────\n\
────▄▀───────────────────▀▄─────\n\
────▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀─────\n')
        console.log('intergalacticlabs.co listening on port', config.app.port);
    }
})
