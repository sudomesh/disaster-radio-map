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

import customStyle from './map_style.js';

import Socket from './socket.js'

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
    url: 'maptiles/' +
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


function dropPin(coord) {
  var pointFeature = new Feature({
    geometry: new Point(coord),
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
}

myMap.on("singleclick", function(e) {
  if(state !== 'dropping') return;

  var lonLat = toLonLat(e.coordinate);
  console.log("Dropped pin:", lonLat);

  dropPin(e.coordinate);

  socketSendPin(lonLat, function(err) {
    if(err) return alert("Failed to send pin"); // TODO bad

    dropPinBtn.style.backgroundColor = 'gray';
    state = null;
  });
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
  e.stopPropagation();
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




var socket = new Socket('/ws', {debug: true});
var socketConnected;

socket.connect(function(err, isConnected) {
  if(err) console.error(err);

  console.log("connected:", isConnected);
  
  socketConnected = true;
});

// send pin over the websocket
function socketSendPin(pos, cb) {
  // TODO we should let the user know they're not connected
  if(!socketConnected) {
    console.error("socket not connected so not sending pin position");
    process.nextTick(cb);
    return;
  }

  var msg = JSON.stringify(pos);

  socket.send('m', msg, function(err) {
    if(err) {
      console.error("Failed to send:", err) // TODO handle better
      return cb(err)
    }
    console.log("Pin position sent!")
    cb();
  });

  socket.addListener('m', function(namespace, data) {
    var lonLat = JSON.parse(data)

    var coord = fromLonLat(lonLat);

    dropPin(coord);
  })
}
