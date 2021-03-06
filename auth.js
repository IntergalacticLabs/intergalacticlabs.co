var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var uuid = require('uuid')
var config = require('config');
var app = express.Router();

var tokenExpirationMinutes = 10 * 365 * 24 * 60;

app.use(cookieParser());
app.use(bodyParser.json());

/**
 * WHO ARE YOU?
 */
app.use(function(req, res, next) {
    var token = req.headers.authorization || req.cookies.iluser;
    if (token) {
        token = token.split(' ').pop(); // takes care of "Bearer: asgfljadhsg;ajshdfkasdf"
        jwt.verify(token, config.jwt.secret, function(err, user) {
            if (err) {
                console.error(err);
                console.error('resetting auth token');
                var auth = createUser();
                req.user = auth.user;
                req.user.new = true;
                res.cookie('iluser', auth.token, {maxAge: tokenExpirationMinutes * 60 * 1000});
                return next();
            }

            if (user) {
                req.user = user;
                return next();
            }
        })
    } else {
      var auth = createUser();
      req.user = auth.user;
      req.user.new = true;
      res.cookie('iluser', auth.token, {maxAge: tokenExpirationMinutes * 60 * 1000});
      return next();
    }
});

function createUser() {
  var user = {
      id: uuid.v4()
  };

  token = jwt.sign(user, config.jwt.secret, {
      algorithm: config.jwt.algorithm,
      expiresInMinutes: tokenExpirationMinutes
  });
  return {
    user: user,
    token: token
  }
}

module.exports = app;
