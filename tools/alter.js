const util = require('util'),
      fs = require('fs');

const locationsFile = '../MA/locations.json',
      locations = JSON.parse(fs.readFileSync(locationsFile, 'utf8'));

const searchNames = [
  "Gillette Stadium",
  "Fenway Park",
  "Reggie Lewis Center (Roxbury Community College)",
  "Danvers Doubletree Hotel",
  "Natick Mall",
  "Eastfield Mall",
  "Former Circuit City"
];


let alteredUUIDs = [];
const newLocations = locations.map((location) => {
  if(searchNames.includes(location.name)){
    if(typeof location.caveats !== 'array'){
      location.caveats = [];
    }
    console.log(location.name)

    location.caveats.push('massvax-preregistration.html');

    alteredUUIDs.push(location.uuid);
  }

  return location;
});

fs.writeFileSync(locationsFile, JSON.stringify(newLocations), 'utf8');

console.log(alteredUUIDs);