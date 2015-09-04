var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var db = require('db');
var email = require('./email');
var config = require('config');
var app = express();

app.use(bodyParser.json());
app.use(favicon(__dirname + '/static/images/favico.png'));
app.use(require('./auth'));
app.set('view engine', 'jade');
app.set('views', '.');

app.use(express.static('static'));

app.get('/', function(req, res, next) {
    res.render('index', {h: 1});
})

app.post('/comment', function(req, res, next) {
    console.log(req.body);
    db.comments.save(req.body);
    email.send('peter@intergalacticlabs.co', 'new comment', 'comment: ' + JSON.stringify(req.body));
    res.send('T_T');
})

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