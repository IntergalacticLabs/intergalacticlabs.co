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

app.get('/mars', function(req, res) {
  if (req.query.hasOwnProperty('react')) {
    res.render('ez/ez-react')
  } else {
    res.render('ez/ez', {})
  }
})

app.use('/tiles', express.static('tileserver'))


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
