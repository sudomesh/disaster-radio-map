import {Map, View} from 'ol';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import MVT from 'ol/format/MVT.js';

import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import {Vector as VectorLayer} from 'ol/layer.js';

import Overlay from 'ol/Overlay.js';

import Feature from 'ol/Feature.js';
import VectorSource from 'ol/source/Vector.js';
import Point from 'ol/geom/Point.js';

import {Fill, Icon, Stroke, Style, Text} from 'ol/style.js';

import customStyle from './custom_style.js';

// EPSG:3857
var sudoroomLonLat = [-122.2663397, 37.8350257];
var fooLonLat = [-121.2663397, 37.8350257];
var sudoroomCoords = fromLonLat(sudoroomLonLat, 'EPSG:3857');

var pointFeature = new Feature({
  geometry: new Point(sudoroomCoords),
  name: 'Null Island',
  population: 4000,
  rainfall: 500
});

var pointStyle = new Style({
  image: new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'icon.png'
  })
});

pointFeature.setStyle(pointStyle);

var pointSource = new VectorSource({
  features: [pointFeature]
});

var pointLayer = new VectorLayer({
  source: pointSource
});

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

var myMap = new Map({
  target: 'map',
  layers: [
    mainLayer,
    pointLayer
  ],

  view: new View({
    center: sudoroomCoords,
    zoom: 10
  })

});



myMap.on("singleclick", function(e){
  if(state !== 'dropping') return;

  var lonLat = toLonLat(e.coordinate);
  console.log("Dropped pin:", lonLat);


  var pointFeature = new Feature({
    geometry: new Point(e.coordinate),
    name: 'Null Island',
    population: 4000,
    rainfall: 500
  });

  var pointStyle = new Style({
    image: new Icon({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'icon.png'
    })
  });

  pointFeature.setStyle(pointStyle);

  pointSource.addFeature(pointFeature);

  dropPinBtn.style.backgroundColor = 'gray';
  state = null;
});


var popupEl = document.getElementById('popup');

var popup = new Overlay({
  element: popupEl,
  positioning: 'bottom-center',
  stopEvent: false,
  offset: [-30, -100]
});
myMap.addOverlay(popup);

// display popup on click
myMap.on('click', function(e) {
  var feature = myMap.forEachFeatureAtPixel(
    e.pixel, 
    function(feature) {
      return feature;
    }
  );

  var geom;
  if(feature) {
    geom = feature.getGeometry();
  }
  if(geom && typeof geom.getCoordinates === 'function') {
    var coordinates = geom.getCoordinates();

    popup.setPosition(coordinates);

    popupEl.style.display = 'block';
    popupEl.style.zIndex = 1000;
  } else {
    popupEl.style.display = 'none';
  }
})

var dropPinBtn = document.getElementById('drop-pin');
var state;

dropPinBtn.addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();

  if(state === 'dropping') {
    dropPinBtn.style.backgroundColor = 'gray';
    state = null;
    return;
  }

  state = 'dropping';
  dropPinBtn.style.backgroundColor = 'green';
  
});
