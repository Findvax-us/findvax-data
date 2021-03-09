const util = require('util'),
      fs = require('fs');
const csvParse = require('csv-parse/lib/sync');

// config
const state = 'MA',
      outFile = 'zipcodes.json';

const zipdb = csvParse(fs.readFileSync('../lib/zips/uszips.csv', 'utf8'), {
  columns: true,
  skip_empty_lines: true
});

const stateZips = zipdb
                    .filter(zip => zip.state_id === state)
                    .map(zip => { return { zip: zip.zip, lat: zip.lat, lng: zip.lng }});

fs.writeFileSync(outFile, JSON.stringify(stateZips), 'utf8');