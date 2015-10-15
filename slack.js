var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('config');
var db = require('db');
var app = express();

app.use(bodyParser.json());
app.post('/invite', function(req, res) {
  if (!req.body.email) {
    return res.send({err: 'Must provide email address'})
  }

  // log it baby
  db.invites.save({
    email: req.body.email,
    time: new Date()
  });

  // post to slack (from outsiders/slack-invite-automation)
  request.post({
    url: 'https://intergalacticlabs.slack.com/api/users.admin.invite',
    form: {
      email: req.body.email,
      token: config.slack.token,
      set_active: true
    }
  }, function(err, httpResponse, body) {
    // body looks like:
    //   {"ok":true}
    //       or
    //   {"ok":false,"error":"already_invited"}
    if (err) { return res.send({err: err}); }
    body = JSON.parse(body);
    if (body.ok) {
      res.send({
        message: 'Thanks! Check "'+ req.body.email +'" for an invite from Slack.'
      });
    } else {
      var error = body.error;
      if (error === 'already_invited') {
        error = 'You have already been invited, check your email (' + req.body.email + ') for a message from slack!'
      } else if (error === 'invalid_email') {
        error = 'The email you entered (' + req.body.email + ') appeared to be invalid.  Care to try again?'
      } else if (error === 'already_in_team') {
        error = 'You have already joined the team, go to https://intergalacticlabs.slack.com and log in or reset your password if needed'
      }

      res.send({
        err: error
      });
    }
  })
})

module.exports = app;
