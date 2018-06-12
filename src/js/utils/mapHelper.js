import App from 'js/components/App';

import Leaflet from 'leaflet';
import L from 'leaflet';

export const mapOptions = { 
  'center': [39.2854197594374, -76.61796569824219],
  'zoom': 12,
  'layers' :
    new L.TileLayer( 
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 
      { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'} 
    )
};


// City Boundary
export const cityBoundaryStyle = {
  fillColor: 'black',
  weight: 2,
  opacity: 1,
  color: 'rgba(0,0,0,0.2)',
  dashArray: '3',
  fillOpacity: 0.1
}
// City Boundary
export const cityBoundries = {
  "type" : "FeatureCollection", 
  "crs" : {
    "type" : "name", 
    "properties" : 
    { "name" : "EPSG:4326" }
  }, 
  "features" : [ {
      "type" : "Feature", 
      "geometry" : {
        "type" : "Polygon", 
        "coordinates" : [
          [
            [-76.549727473808, 39.1972413144362], 
            [-76.5836752990711, 39.2081283965348], 
            [-76.6116129416028, 39.2344024165013], 
            [-76.7111635657125, 39.2778463705771], 
            [-76.7112958924451, 39.3719649234593], 
            [-76.5296764007203, 39.3719797996088], 
            [-76.5298604566501, 39.2096308203381], 
            [-76.549727473808, 39.1972413144362]
          ]
        ]
      }, 
      "properties" : null
    }
  ]
}

export function displayPoint (data, styles, map) {
  let xcord = parseFloat(data.xcord);
  let ycord = parseFloat(data.ycord);
  let coordinates = [ycord, xcord];
  var icon = L.icon({
    iconUrl: '',
    iconSize:     [38, 95], // size of the icon
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  })
  let marker = L.marker(coordinates,icon);
  marker.on({
    mouseover: function(event) {
      feature = event.target;
      let pointsData = showOnHovers.map((field) => { return '<br><b>' + field.alias + '</b> = ' + feature.properties[field.name]; });
      layer.bindTooltip('<h4>' + updateLayerDictionary.alias + '</h4>' + pointsData).openTooltip();
    },
    click: function(event) {
      document.getElementsByClassName('toggle_context_drawer')[0].style.display = 'block';
      document.getElementById('context_drawer').style.display = 'flex';
      stateFunctions.showDetails(layer.feature)
    }
  });
  return marker
}

export function highlightFeature (e) { e.target.setStyle({ weight: 8 }); }
export function resetHighlight (e) { e.target.setStyle({ weight: 4 }); }
export function onBoundryMouseOver (e , layerState, updateLayerDictionary) {
   highlightFeature(e, layerState); 
   onBoundryHover(e, layerState); 
}
export function onBoundryMouseOut (e) { resetHighlight(e); }
export function onBoundryHover (e , layerState){
  var layer = e.target;
  var props = layer.feature.properties;
  let alias = layerState.alias;
  let hover = layerState.hover
  let innerContent = '<h4> '+alias+' </h4><br/>';
  hover.map( field => {
    innerContent += '<b>' + field.alias + '</b> : ' + props[field.name] + '<br/>';
  })
  layer.bindTooltip(innerContent).openTooltip();
}
export async function getStyles(layer) {
  // If Esri Drawing info is available, use it. otherwise use the defaults
  let drawingInfo = layer.drawinginfo;
  let geometryType = layer.geometryType;
  let type = false;
  let field = false;
  let line = false;
  let color = false;
  let image = false;
  let uniqueValueInfos = [];
  let transparency = 100;
  // ESRI POINTS
  if(layer.geometryType == "esriGeometryPoint"){
    transparency = ((100-drawingInfo.transparency)/100);
    let labelingInfo = drawingInfo.labelingInfo;
    type = drawingInfo.renderer.type;
    if ((drawingInfo.renderer.type = 'uniqueValue') && (drawingInfo.renderer.uniqueValueInfos != undefined)) {
      field = drawingInfo.renderer.field1;
      drawingInfo.renderer.uniqueValueInfos.map((uniqueInfo, i) => {
        let img = drawingInfo.renderer.uniqueValueInfos[i].symbol.imageData;
        if(img != false){img = 'data:image/png;base64,'+img}
        uniqueValueInfos.push({
          image : img, 
          label : uniqueInfo.label,
          description : uniqueInfo.description,
        })
      });
    }
    if (drawingInfo.renderer.symbol) { image = drawingInfo.renderer.symbol.imageData }
    if (drawingInfo.renderer.defaultSymbol) {
      line = drawingInfo.renderer.defaultSymbol.outline.color;
      color = drawingInfo.renderer.defaultSymbol.color;
    }
  }
  // ESRI POLYGON
  if(layer.geometryType == "esriGeometryPolygon"){
    transparency = ((100-drawingInfo.transparency)/100);
    let labelingInfo = drawingInfo.labelingInfo;
    type = drawingInfo.renderer.type
    if (drawingInfo.renderer.type = 'uniqueValue') {
      // Apply Breakpoints if available
      if(drawingInfo.renderer.classBreakInfos != undefined){
        field = drawingInfo.renderer.field;
        drawingInfo.renderer.classBreakInfos.map((uniqueInfo) => {
          uniqueValueInfos.push(
            { 
            line : prepareColor(uniqueInfo.symbol.outline.color , transparency),
            color : prepareColor( uniqueInfo.symbol.color, transparency),
            label : uniqueInfo.label,
            description : uniqueInfo.description,
            classMaxValue : uniqueInfo.classMaxValue
            }
          )
        })
      }
      else {
        // Breakpoint styling not applicable
        color = drawingInfo.renderer.symbol.outline.color;
        line = drawingInfo.renderer.symbol.color;
      } 
    }
    else if (drawingInfo.renderer.type == 'simple') {
      // Only one design
      color = drawingInfo.renderer.symbol.outline.color;
      line = drawingInfo.renderer.symbol.color;
    } 
  }
  if( !drawingInfo || drawingInfo.renderer == undefined){
    geometryType = 'point';
    image = drawingInfo;
    // Its a polygon if layer returns distinct
    if(layer.returndistinct || !drawingInfo){
      geometryType = 'esriGeometryPolygon';
      line = [100,100,255,255];
      color = [100,100,255,255];
      image = false;
      type = 'uniqueValue'
    }
  }
  if(image != false){
    if( layer.host == 'arcgis'){
      image = 'data:image/png;base64,'+image
    }
    else{
      let url = image;
      const imagee = require('images/drawinginfo/'+url)
      if(imagee){ image = imagee }
    }
  }
  if(line != false){line = prepareColor(line, transparency) }
  if(color != false){color = prepareColor(color, transparency) }
  let response = {
    'type': type,
    'field' : field,
    'geometryType' : geometryType,
    'uniqueValueInfos' : uniqueValueInfos, 
    'line' : line, 
    'color' : color, 
    'image' : image,
  }
  console.log(response);
  return response
}

function prepareColor(color, transparency){
  color[3] = transparency;
  return 'rgba(' + color + ')'
}

function prepareImage(image){
  color[3] = transparency;
  return 'rgba(' + color + ')'
}