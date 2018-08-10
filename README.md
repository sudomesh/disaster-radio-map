
This is a simple offline map app for disaster.radio. It uses vector tiles and openlayers. It is a work in progress.

# Requirements

Install node modules:

```
npm install
```

You will an offline map in pbf vector tile format.

Download or create an extract of the area of interest. You can download pre-made extracts in `.mbtiles` format from [OpenMapTiles](https://openmaptiles.com/downloads/planet/) or custom-defined extracts as a single `.osm.pdf` file from [bbbike.org](https://extract.bbbike.org/). We'll assume you have a `.mbtiles` file. The example code is centered on Oakland, CA so it might be a good idea to download the bay area extract for testing.

Assuming your downloaded/extracted file is `map.mbtiles`.

Download [mbutil](https://github.com/mapbox/mbutil) and convert:

```
git clone https://github.com/mapbox/mbutil
cd mbutil/
./mb-util --image_format=pbf ../map.mbtiles vector_tiles
cd ../vector_tiles
gzip -d -r -S .pbf * # uncompress
find . -type f -exec mv '{}' '{}'.pbf \; # rename
```

Ensure the `vector_tiles/` dir is in the same directory as this REAMDE.md file.

# Building

```
npm run build
```

# Running

```
firefox index.html
```

# Modifying styles

You can modify `custom_style.js` to change the styling and show/hide features. The feature names for the openmaptiles.org data is documented [here](https://openmaptiles.org/schema/).

# License

AGPLv3