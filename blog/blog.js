var fs = require('fs')
var express = require('express')
var app = express()
var moment = require('moment')
var marked = require('marked')

// set view direct
app.set('views', __dirname);

// Set up meta data
var years = ['2015'].map(function(y) {
  return require(__dirname + '/' + y + '/meta.js');
})

// Get list of posts
var posts = module.exports.posts = years.reduce(function(posts, year) {
  return posts.concat(year.posts.filter(function(p) {
    return (p.posted <= new Date()) || (process.NODE_ENV != 'production');
  }))
}, []).map(function(post) {
  post.route = moment(post.posted).format('/YYYY/MM/DD/') + post.file.split('.')[0]
  return post
}).sort(function(a, b) {
  return a.posted > b.posted
})

// load the markdown async
posts.map(function(post) {
  console.log('file', post.fullpath)
  fs.readFile(post.fullpath, 'utf8', function(e, md) {
    if (e) { console.error(e); process.exit(1) }
    post.md = marked(md);
  })
})

// Create routes for each post
posts.map(function(post, i) {
  app.get(post.route, function(req, res, next) {
    if (process.NODE_ENV !== 'production') {
      post.md = marked(fs.readFileSync(post.fullpath, 'utf8'));
    }
    var data = {
      post: post,
      nextpost: posts[i+1],
      previouspost: posts[i-1],
      date: moment(post.posted).fromNow(),
      posts: posts.map(function(post) {
        return {
          title: post.title,
          date: moment(post.posted).format('YYYY-MM-DD'),
          route: post.route
        }
      })
    }
    res.render('post', data);
  })
})

module.exports.app = app;
