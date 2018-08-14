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

import {v4 as uuid} from 'uuid';

import customStyle from './map_style.js';

import Socket from './socket.js'

var allPins = {};

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


function dropPin(id, coord, type) {
  var pointFeature = new Feature({
    geometry: new Point(coord),
    name: 'Null Island',
    population: 4000,
    rainfall: 500
  });

  var iconFile = (type) ? (type+'.png') : 'icon.png';

  var pointStyle = new Style({
    image: new Icon({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: iconFile
    })
  });

  pointFeature.setStyle(pointStyle);
  pointFeature.setId(id);

  pointSource.addFeature(pointFeature);
  return pointFeature;
}

function changePinIcon(feature, src) {
  var pointStyle = new Style({
    image: new Icon({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: src
    })
  });
  feature.setStyle(pointStyle);
}

var pinDialogEl = document.getElementById('icon-select');


var pinDialog = new Overlay({
  element: pinDialogEl,
  positioning: 'bottom-center',
  stopEvent: false,
  offset: [10, -240]
});
myMap.addOverlay(pinDialog);

var curPin;

function startPinCreation(coordinate) {
  state = null;

  document.getElementById('icon-select-step1').style.display = 'block';
  document.getElementById('icon-select-step2').style.display = 'none';
  document.getElementById('icon-select-step3').style.display = 'none';

  pinDialog.setPosition(coordinate);
  
  pinDialogEl.style.display = 'block';  
  pinDialogEl.style.zIndex = 3000;
  var pinId = uuid();
  var pin = dropPin(pinId, coordinate);

  var lonLat = toLonLat(coordinate);
  console.log("Dropped pin:", lonLat);

  curPin = {
    coordinate: coordinate,
    feature: pin,
    id: pinId
  };
}


document.getElementById('resource-btn').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  if(!curPin) return;

  document.getElementById('resource-or-need').innerHTML = "the resource";

  curPin.type = 'resource';

  pinIconSelect()
});

document.getElementById('need-btn').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation();
  if(!curPin) return;

  document.getElementById('resource-or-need').innerHTML = "needed";

  curPin.type = 'need';

  pinIconSelect();
});


var icons = document.getElementById('icon-select-step2').querySelectorAll("img")
var i;
for(i=0; i < icons.length; i++) {
  icons[i].addEventListener('click', pinIconSelected);
}

function pinIconSelect() {

  document.getElementById('icon-select-step1').style.display = 'none';
  document.getElementById('icon-select-step2').style.display = 'block';
  document.getElementById('icon-select-step3').style.display = 'none';


}

function pinIconSelected(e) {
  e.preventDefault();
  e.stopPropagation();

  document.getElementById('icon-select-step1').style.display = 'none';
  document.getElementById('icon-select-step2').style.display = 'none';
  document.getElementById('icon-select-step3').style.display = 'block';
  document.getElementById('pin-description').value = '';

  var filename = e.target.src.split('/').pop();
  var iconName = filename.replace(/\.[^\.]+$/, '');
  curPin.type = iconName;


  changePinIcon(curPin.feature, filename);

  console.log("base", iconName)
}

document.getElementById('save-pin-btn').addEventListener('click', function(e) {
  var desc = document.getElementById('pin-description').value;

  curPin.desc = desc;

  var lonLat = toLonLat(curPin.coordinate);
  finalizePin(lonLat, curPin.type, desc);
});

function finalizePin(lonLat, type, desc) {
  socketSendPin(lonLat, type, desc, function(err) {
    if(err) return console.error(err);

    allPins[curPin.id] = curPin;
    curPin = null;
    dropPinBtn.style.backgroundColor = 'gray';
    pinDialogEl.style.display = 'none';
    state = null;
  });
}

myMap.on("singleclick", function(e) {
  if(state !== 'dropping') return;

  startPinCreation(e.coordinate);
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
    var pin = allPins[feature.getId()];

    popup.setPosition(coordinates);

    document.getElementById('popup-description').value = pin.desc;
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
function socketSendPin(pos, type, desc, cb) {
  // TODO we should let the user know they're not connected
  if(!socketConnected) {
    console.error("socket not connected so not sending pin position");
    process.nextTick(cb);
    return;
  }

  var msg = JSON.stringify({
    pos: pos,
    type: type,
    desc: desc
  });

  socket.send('m', msg, function(err) {
    if(err) {
      console.error("Failed to send:", err) // TODO handle better
      return cb(err)
    }
    console.log("Pin position sent!")
    cb();
  });

  socket.addListener('m', function(namespace, data) {
    var o = JSON.parse(data);
    var lonLat = o.pos;
    var coord = fromLonLat(lonLat);

    var pinId = uuid();
    o.id = pinId;

    allPins[pinId] = o;

    dropPin(pinId, coord, type);
  })
}
