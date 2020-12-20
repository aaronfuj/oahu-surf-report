# local-surf-report
An aggregation of surf information from NOAA and other sources for personal use.

## Deployment
This is built using React and Tailwind CSS, using Netlify for deployment. Netlify is key as it also allows for redirects/proxies to work around the fact that NOAA does not have CORS support for their buoy data.

## Running/Developing
First, install all dependencies via:

`yarn install`

To run this, netlify cli needs to be installed:

`npm install netlify-cli -g`

Running this locally can be done via the following command:

`netlify dev`

More on this can be found at https://www.netlify.com/products/dev/

This will spawn a local proxy and utilize Netlify's redirects/proxies, via the `_redirects` file, to allow for querying of the NOAA buoy data. See https://docs.netlify.com/routing/redirects/rewrites-proxies/#proxy-to-another-service for how the proxy allows getting around CORS.

## Understanding CORS
Due to NOAA not having CORS support, this is likely to require a server (or at the very least be dependent on a proxy).

Current proxy info:
- https://cors-anywhere.herokuapp.com/
- https://stackoverflow.com/a/43881141

Some potential sources of data:
- Waimea Buoy: https://www.ndbc.noaa.gov/station_page.php?station=51201
- Barber's Point Buoy: https://www.ndbc.noaa.gov/station_page.php?station=51212

# Buoys
The following buoys have wave height data:
51211 - Pearl Harbor
51212 - Barbers Point
51210 - Kaneohe Bay
51201 - Waimea Bay
