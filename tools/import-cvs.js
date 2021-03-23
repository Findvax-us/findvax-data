const util = require('util'),
      fs = require('fs');
const uuid = require('uuid'),
      axios = require('axios'),
      cheerio = require('cheerio');

//config: change as needed
const filterExistingLocations = false,
      existingLocationsFile = '../RI/locations.json',
      inFile = 'cvs.json',
      outFile = 'cvs-locations.json',
      state = 'RI',
      stateSlug = 'Rhode-Island', // cvs store locator requires it i dunno, hyphens to replace spaces
      timezone = '-04:00'; 

const locatorURLBase = `https://www.cvs.com/store-locator/cvs-pharmacy-locations/${stateSlug}/`,
      jsonURL = `https://www.cvs.com/immunizations/covid-19-vaccine.vaccine-status.${state.toLowerCase()}.json?vaccineinfo`;
const template = {
  uuid: '',
  name: '',
  scraperClass: 'cvs',
  scraperUrl: jsonURL,
  scraperParams: {
      segmentId: state.toLowerCase(),
      locationName: ''
  },
  tz: timezone,
  zip: '',
  state: state,
  serves: 'Eligible populations statewide',
  address: '',
  linkUrl: 'https://www.cvs.com/immunizations/covid-19-vaccine',
  siteType: 'indoor',
  siteInstructions: 'Check-in 15min prior',
  accessibility: '',
  caveats: [
      'no-timeslots'
  ]
};

const toTitleCase = function(){
  return this.toString().toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.substring(1, word.length)
  ).join(' ');
}
String.prototype.toTitleCase = toTitleCase;

const toSlug = function(){
  return this.toString().split(' ').join('-');
}
String.prototype.toSlug = toSlug;


const getAddressForCity = (city) => {
  return axios.get(locatorURLBase + city.toSlug()).then(result => {
    $ = cheerio.load(result.data);
    let firstAddress = $('div.each-store:first-child > p.store-address').text().trim();
    let addresses = $('div.each-store');
    
    return {
      count: addresses.length,
      addr: firstAddress
    };
  }).catch(err => {
    console.error(`cant load ${city} location page: ${err}`);
  })
}

// these have to be done in series, because the website
// sends you to hell if it thinks youre scraping
let locations = [];
const getLocations = (location, next) => {

  const city = location.city;
  return getAddressForCity(city).then(result => {
    let location = JSON.parse(JSON.stringify(template));

    location.uuid = uuid.v4();
    location.name = `CVS ${city.toTitleCase()}`;
    location.scraperParams.locationName = city;
    location.zip = result.addr.substring(result.addr.length - 5, result.addr.length);
    location.address = result.addr;

    if(result.count > 1){
      location.caveats.push('nonspecific-location');
    }

    locations.push(location);

    if(next.length > 0){
      console.log(`remaining: ${next.length}`);
      return getLocations(next.pop(), next);
    }else{
      return locations;
    }

  });
}


const list = JSON.parse(fs.readFileSync(inFile, 'utf8')),
      cvses = list.responsePayloadData.data[state];

console.log(`cities: ${cvses.length}`);
getLocations(cvses.pop(), cvses)
  .then(result => {
    let filtered = result;

    if(filterExistingLocations){
      const currentLocations = JSON.parse(fs.readFileSync(existingLocationsFile, 'utf8'));

      filtered = result.filter(newLoc => {
        return !currentLocations.find(oldLoc => oldLoc.scraperClass === 'cvs' && 
                                                oldLoc.scraperParams.locationName === newLoc.scraperParams.locationName);
      })
    }

    fs.writeFileSync(outFile, JSON.stringify(filtered), 'utf8')
  });
