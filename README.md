
This is a simple offline map app for disaster.radio. It uses vector tiles and openlayers. It is a work in progress.

# Requirements

## Install required node modules.

Clone the repo, cd to the directory and install required node modules:

```
npm install
```

## Download your map tiles. 

You will need an offline map in pbf vector tile format.

Download or create an extract of the area of interest. You can download pre-made extracts in `.mbtiles` format from [OpenMapTiles](https://openmaptiles.com/downloads/planet/) or custom-defined extracts as a single `.osm.pdf` file from [bbbike.org](https://extract.bbbike.org/). We'll assume you have a `.mbtiles` file. The example code is centered on Oakland, CA, so it might be a good idea to download the Bay Area extract for testing.

## Install Mapbox

Assuming your downloaded/extracted file is `map.mbtiles` and assuming you're in the same directory as this `README.md` file,

Download [mbutil](https://github.com/mapbox/mbutil) and convert:

```
git clone https://github.com/mapbox/mbutil
cd mbutil/
./mb-util --image_format=pbf ../map.mbtiles ../static/maptiles
cd ../static/maptiles
gzip -d -r -S .pbf * # uncompress
find . -type f -exec mv '{}' '{}'.pbf \; # rename
```

Ensure the `maptiles/` dir is inside the `static/` directory.

# Building
Build your map by running:
```
npm run build
```

# Running

To display the map in a browser, run:
```
firefox static/index.htm
```

# Modifying styles

You can modify `custom_style.js` to change the styling and show/hide features. The feature names for the openmaptiles.org data is documented [here](https://openmaptiles.org/schema/).

# License

Code is AGPLv3

Icons derived from Font Awesome, CC-BY-SA 4.0
