module.exports = {
  posts: [
    {
      file: 'mars_maps.md',
      title: 'Modern maps of Mars',
      posted: new Date('2015-10-10T13:00:22.062Z'),
      hero: '/images/spacesuit-gold.png', // stamen map!
      snippet: 'Finding a good map of mars is no easy task.  There’s one really good map, but it doesn’t show up on the first page of google results for “map of mars.”'
    },
    {
      file: 'slack.md',
      title: 'Join the discussion on Slack',
      posted: new Date('2015-10-27T13:00:22.062Z')
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
