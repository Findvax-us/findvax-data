# Jabzone Data

## Data repository for fetching and displaying vaccine availability

This is the data used by https://github.com/pettazz/findvax-scraper and https://github.com/pettazz/findvax-site

### What? I thought it was fetched automatically 

This is the starting point for both the scrapers and the site. `locations.json` is a manually populated file that lists every location in a state, along with necessary metadata for scraping it and displaying it on the site. `availability.json` files will be written by the scraper after a successful run alongside `locations.json`. 

Currently we only have data/scrapers for Massachusetts, so everything is hardcoded to use the `/MA/` path here, but when we start adding more states, `states.json` will be the source of truth for those.

We keep all this stuff in a separate S3 bucket on a separate domain so we can cache it differently, we don't want `availability.json` to be cached longer than 300s if we're updating it every five minutes, but in that time after the update we *definitely* do want it cached. `deploy.sh` is a simple script for uploading to S3 and invalidating the cache, so it should be run every time these files are changed.

`index.html` is just a basic page to display that tells people this is probably not the domain they're looking for.

There are a couple tools in, that's right, `/tools` for things like parsing a big CVS json into locations suitable for locations.json, or generating a list of zip codes for a state (used by the frontend for radius search).

### Zip Code Data Source

https://simplemaps.com/data/us-zips