console.log('recreating the database of features');

var fs = require('fs');
try {
  fs.unlinkSync(__dirname + '/moon.db');
} catch (e) {}
try {
  fs.unlinkSync(__dirname + '/mars.db');
} catch (e) {}

var moondb = require('./db').moondb;
var marsdb = require('./db').marsdb;
var cheerio = require('cheerio');

// Man-made objects on the moon
var moonpage = fs.readFileSync('./moon.html', 'utf8');
var $ = cheerio.load(moonpage);
var table = [];
$(".wikitable.sortable tr").map(function() {
  var cols = $(this).find('td').map(function() {
    return $(this).text();
  }).toArray();
  table.push(cols);
})
table = table.slice(1);
var tsv = [[
  'name',
  'nationality',
  'year',
  'mass',
  'status',
  'longitude',
  'latitude'
]];
table.map(function(row, i) {
  if (row.length < 7) {
    return;
  }
  var obj = {
    name: row[0],
    nationality: row[2],
    year: row[3],
    mass: row[4],
    status: row[5].replace('\n', ''),
    locationString: row[6],
    location: {
      lon: parseFloat(row[6].split('/').pop().split(';')[1]),
      lat: parseFloat(row[6].split('/').pop().split(';')[0])
    }
  }
  console.log(obj);
  moondb.set(i, obj);
  if (!isNaN(obj.location.lon)) {
    tsv.push([
      obj.name,
      obj.nationality,
      obj.year,
      obj.mass,
      obj.status,
      obj.location.lon,
      obj.location.lat
    ])
  }
});

var tsvString = tsv.reduce(function(tsvString, row) {
  return tsvString + row.join('\t') + '\n';
}, '')

fs.writeFileSync('moonobjects.tsv', tsvString, 'utf8')

// Man-made objects on mars
var marspage = fs.readFileSync('./mars.html', 'utf8');
$ = cheerio.load(marspage);
table = [];
$('table').first().find('tr').map(function() {
  var cols = $(this).find('td').map(function() {
    return $(this).text();
  }).toArray();
  table.push(cols);
})
table = table.slice(1);
console.log(table);
table.map(function(row, i) {
  if (row.length < 7) {
    return;
  }
  var obj = {
    name: row[0],
    nationality: row[2],
    year: row[3],
    mass: row[4],
    status: row[5].replace('\n', ''),
    locationString: row[6],
    location: {
      lon: parseFloat(row[6].split('/').pop().split(';')[1]),
      lat: parseFloat(row[6].split('/').pop().split(';')[0])
    }
  }
  console.log(obj);
  marsdb.set(i, obj);
});


// moon craters
var craters = fs.readFileSync(__dirname + '/Lunar_Impact_Crater_Database_v08Sep2015.xls - Database.tsv', 'utf8').split('\r\n');

var names = craters[0].split('\t');
names.forEach(function(n, i) {
  console.log(i, n);
})

craters = craters.slice(1);
craters.map(function(row, i) {
  row = row.split('\t');
  if (row.length < 4) {
    return;
  }
  var obj = {
    name: row[0],
    radius: parseFloat(row[6])/1000,
    diameter: parseFloat(row[6])/1000 * 2,
    apparentDiameter: parseFloat(row[7]),
    floorDiameter: parseFloat(row[10]),
    rimToFloorDepth: parseFloat(row[12]),
    location: {
      lat: parseFloat(row[2]),
      lon: parseFloat(row[3]),
    },
    age: row[50],
    ageClass: row[51],
    remarks: row[52]
  };
  console.log(obj);
  moondb.set('c' + i, obj);
})

// aggregate the mentions of lunar candidate sites for human exploration
var lunarCandidateSites = [
  {name: 'Aitken Basin', location: {}}
]
