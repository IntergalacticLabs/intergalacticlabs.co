module.exports = {
  posts: [
    {
      file: 'mars_maps.md',
      title: 'Modern maps of Mars',
      posted: new Date('2015-10-15T13:00:22.062Z'),
      hero: '/images/mapbox_mars.png', //'/images/image_6.png',
      snippet: 'Finding a good map of Mars is no easy task.  There’s one really good map from NASA, but it doesn’t show up on the first page of google results for “map of mars.”'
    },
    {
      file: 'slack.md',
      title: 'Join the discussion on Slack',
      posted: new Date('2015-10-15T12:00:22.062Z'),
      hero: '/images/slack_rgb_300_141.png',
      snippet: 'Intergalactic Labs has created a community for space exploration discussion on the chat platform Slack.'
    },
    {
      file: 'which_mars_rover.md',
      title: 'Modern maps of Mars',
      posted: new Date('2015-11-03T13:00:22.062Z')
    },
    {
      file: 'marsmaps.md',
      title: 'Modern maps of Mars',
      posted: new Date('2015-11-10T13:00:22.062Z')
    },
    {
      file: 'marsmaps.md',
      title: 'Modern maps of Mars',
      posted: new Date('2015-11-17T13:00:22.062Z')
    }
  ].map(function(post) {
    post.fullpath = __dirname + '/' + post.file;
    return post;
  })
}
