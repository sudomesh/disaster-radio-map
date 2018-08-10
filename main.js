import {Map, View} from 'ol';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import MVT from 'ol/format/MVT.js';

import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import {Fill, Icon, Stroke, Style, Text} from 'ol/style.js';

import customStyle from './custom_style.js';


var style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)'
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000'
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3
    })
  })
});

var mainLayer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
  attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright">' +
      'OpenStreetMap contributors</a>',
    format: new MVT(),
    url: 'vector_tiles/' +
      '{z}/{x}/{y}.pbf'

  }),

  style: customStyle(Style, Fill, Stroke, Icon, Text)

})

// EPSG:3857
var sudoroomLonLat = [-122.2663397, 37.8350257];

var myMap = new Map({
  target: 'map',
  layers: [
    mainLayer
  ],

  view: new View({
    center: fromLonLat(sudoroomLonLat, 'EPSG:3857'),
    zoom: 10
  })

});

