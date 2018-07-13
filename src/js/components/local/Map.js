import React, { Component } from 'react';

var L = require('leaflet');
var esri = require('esri-leaflet');
var geocoding = require('esri-leaflet-geocoder');

//import L from 'leaflet';
//import esri from 'esri-leaflet';
//import { geocoding } from 'esri-leaflet-geocoder';
import { displayPoint, mapOptions, cityBoundries, cityBoundaryStyle, 
  onBoundryHover, onBoundryMouseOut, onBoundryMouseOver,  
  resetHighlight, highlightFeature, getStyles,
  circle, marker, overlayLegend, renderLayer
} from 'js/utils/mapHelper';

export default class Map extends Component {
  displayName: 'Map';
  constructor(props) {
    super(props);
    this.state = { 
      map : null,
      mapLayers : [],
      layersData : [],
      layerStyles : {},
      renderedData : {}
    };
  }


  componentDidMount() {
    // Intialize The Map Enviornment
    let map = new L.Map('mapid', mapOptions);
    document.getElementById("mapid").tabIndex = "-1";
    map.zoomControl.setPosition('topleft');
    L.control.scale({ imperial: false }).addTo(map)
    map.addControl(new overlayLegend());

    // Create Search Control
    var searchControl = geocoding.geosearch({
        allowMultipleResults: true,
        placeholder: 'Enter an Address',
        providers: [
          geocoding.arcgisOnlineProvider({
                maxResults : 1,
                label: 'Search Returned : ',
          }),
          geocoding.featureLayerProvider({
                url: 'https://services.arcgis.com/uCXeTVveQzP4IIcx/arcgis/rest/services/gisday/FeatureServer/0/',
                searchFields: ['Name', 'Organization'],
                label: '',
                maxResults : 1,
                bufferRadius: 1000,
                formatSuggestion: function(feature) {
                    return feature.properties.Name + ' - ' + feature.properties.Organization;
                }
            })]
    }).addTo(map);
    // Handle Search Control Events
    searchControl.on('results', function(data) {
        if (!map.hasLayer(marker)) { circle.addTo(map); marker.addTo(map); }
        var meters = milesToMeters(.25);
        let latlng = data.latlng;
        marker.setLatLng(latlng).update();
        circle.setLatLng(latlng).setRadius(meters).setStyle({ fillOpacity: 0.3, opacity: 0.3 }).redraw();
        let innerTxt = data.text
        console.log(data.text)
        if (data.results.length > 0) { 
          marker.bindPopup(
            '<strong>' + data.text + "</strong><br>"+
            "<button id='removeRadius'>Remove Radius</button> "+
            "<button id='removeRadiusMarker'>Remove Marker</button>"
          ).openPopup(); 
        }
        map.fitBounds(circle.getBounds(), {padding: [100, 50]}) 
        document.getElementById("removeRadius").addEventListener("click", removeRadius);
        document.getElementById("removeRadiusMarker").addEventListener("click", removeRadiusMarker);
    });
    // Utility
    function milesToMeters(miles) { return miles * 1069; };
    function removeRadius() { map.removeLayer(circle); };
    function removeRadiusMarker() { map.removeLayer(circle); map.removeLayer(marker); };

    this.setState({ map });
  }

  // ComponentDidUpdate will handle changes to our layers
  async componentDidUpdate(prevProps, prevState) {
    const { state, stateFunctions } = this.props;

    // Start by getting the Legend and clearing its innerHTML
    let legend = document.getElementsByClassName("legendContainer")[0];
    let legendContent = ''; legend.innerHTML = legendContent;

    let dictionaries = state.dictionaries;
    dictionaries.map( async layer => {     
      let map = this.state.map;
      let mapLayers = this.state.mapLayers;
      let layerStyles = this.state.layerStyles;
      let layersData = this.state.layersData;
      let renderedData = this.state.renderedData;
      let layerKey = layer.service+layer.layer;
      let layerData = layer.dataWithGeometry;

      if( !layerData && mapLayers.includes(layerKey) ){ // Remove Layer
        map.hasLayer(renderedData[layerKey]) ? map.removeLayer(renderedData[layerKey]) : null;
        delete renderedData[layerKey];
        delete layersData[layerKey];
        delete layerStyles[layerKey];
        let newMapLayers = this.state.mapLayers; newMapLayers = mapLayers.filter(e => e !== layerKey)
        this.setState({map, 'mapLayers':newMapLayers, layerStyles, renderedData, layersData })
      }
      else if(layerData){
        layersData = this.state.layersData      
        if( !mapLayers.includes(layerKey) ){
          mapLayers.push(layerKey);
          layerStyles[layerKey] = await getStyles(layer);
          layersData[layerKey] = [];
          layersData[layerKey].unshift(layerData);
          legend.innerHTML += addLayerToLegend( layerStyles[layerKey], layer.alias.replace(/_/g, " ") )
          //console.log('First Time, Adding Layer')
        }
        else{
          const oldUnique = [...new Set(layersData[layerKey][0].map( obj => obj.properties[layer.primarykey] ))];
          const newUnique = [...new Set(layerData.map( obj => obj.properties[layer.primarykey] ))];
          const intersect = [...new Set(oldUnique)].filter(x => new Set(newUnique).has(x));
          legend.innerHTML += addLayerToLegend( layerStyles[layerKey], layer.alias.replace(/_/g, " ") )
          if( newUnique.length == intersect.length ){ return null }
          this.state.renderedData ? map.hasLayer(this.state.renderedData[layerKey]) ? map.removeLayer(this.state.renderedData[layerKey]) : null : null
          //layersData[layerKey] = mergeObjOnProp(layersData[layerKey], layerData, layer.primarykey);
          layersData[layerKey].unshift(layerData);
          //console.log('Merging Layer', layerKey, layersData[layerKey] )
        }
        // Get Alias
        let layerAlias = layer.alias.replace(/_/g, " "); 
        layerAlias = layerAlias.charAt(0).toUpperCase() + layerAlias.slice(1);
        // Compile all those variables into an object
        let renderObject = { 
          map,
          layer : layer,
          stateFunc : this.props.stateFunctions,
          alias : layerAlias, 
          styles : layerStyles[layerKey],
          layerKey : layerKey,
          records : layersData[layerKey].reduce( (a, b) =>{ return a.concat(b) } ), 
          context : layer.fields.filter((field) => { return field.righthand }),
          hover : layer.fields.filter((field) => { return field.revealonhover }),
        }
        // Pass that object into our Render Layer function
        let newLayer = renderLayer.call(this, renderObject );
        let renderedData = this.state.renderedData;
        renderedData[layerKey] = newLayer;
        newLayer.addTo(map)
        // Zoom to the location if only one thing was rendered
        if( layersData[layerKey] && layersData[layerKey][0].length == 1 ){
          let layer = map._layers[newLayer._leaflet_id];
          let layerId = Object.keys(layer._layers)[0];
          let feature = layer._layers[layerId];
          feature.fire('click');
          map.panBy([150, 0]);
        }
        
        this.setState({ layerStyles, map, mapLayers, renderedData, layersData });
      }
    } )
  }
  render() {
    return ( < div id = "mapid"  className='custom-popup' tabIndex = "-1" > < /div> )
  }
}


// LEGEND
function addLayerToLegend(styles, updateLayerAlias){
  let legendContent = '';
  if(styles.uniqueValueInfos.length){
    legendContent += '<div>'
    legendContent += '<h4>' + updateLayerAlias + '</h4>';
    styles.uniqueValueInfos.map((field) => {
      if(field.image){
        legendContent += "<h4 style='width:90%; padding-left: -10px; background: url(" + field.image + ") no-repeat left center;'>" + field.label + "</h4>";
      }
      else{
        legendContent += "<h4 style='width:90%; padding-left: -10px; background: " + field.color + " no-repeat left center;'>" + field.label + "</h4>";
      }
    });
  }
  if(styles.line && styles.color){
    let label = updateLayerAlias;
    if(styles.uniqueValueInfos.length){ label = 'Unassigned'}
    legendContent += "<div style='width:100%; background:" + styles.color + ";'>" + label + "</div>"; 
  }
  if(styles.image){
    let label = updateLayerAlias;
    if(styles.uniqueValueInfos.length){ label = 'Unassigned'}
    legendContent += "<div style='width:100%; padding-left: -10px; background: url(" + styles.image + ") no-repeat left center; background-size: 10px 10px;'>" + label + "</div>"; 
  }
  return legendContent
}
