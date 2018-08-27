import React, { Component } from 'react';

var L = require('leaflet');
var esri = require('esri-leaflet');
var geocoding = require('esri-leaflet-geocoder');
//require ('js/utils/leafletConditionalRender');
require ('leaflet-html-legend');

import { displayPoint, mapOptions, cityBoundaryStyle, 
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
      rndrdDt : {}
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
    function milesToMeters(miles) { return miles * 1069; };
    function removeRadius() { map.removeLayer(circle); };
    function removeRadiusMarker() { map.removeLayer(circle); map.removeLayer(marker); };

    this.setState({ map });
  }



  // Handles changes to our layers
  async componentDidUpdate(prevProps, prevState) {
    const { state, stateFunctions } = this.props;

    // Start by getting the Legend and clearing its innerHTML
    let legend = document.getElementsByClassName("legendContainer")[0];
    let legendContent = ''; legend.innerHTML = '';

    // Map through the Layers
    let dictionaries = state.dictionaries;
    dictionaries.map( async layer => {

      // Information on the Component State
      let map = this.state.map;
      let mapLayers = this.state.mapLayers;
      let layerStyles = this.state.layerStyles;
      let layersData = this.state.layersData;
      let rndrdDt = this.state.rndrdDt;

      // Information on the Incoming Layer
      let key = layer.key;
      let newData = layer.dataWithCoords;
      // Remove the layer
      if( !newData && mapLayers.includes(key) ){
        console.log( 'Removing ', key );
        map.hasLayer(rndrdDt[key]) ? map.removeLayer(rndrdDt[key]) : null;
        delete layerStyles[key];
        delete rndrdDt[key];
        delete layersData[key];
        mapLayers = mapLayers.filter(e => e !== key)
        this.setState({map, mapLayers, layersData, layerStyles, rndrdDt })
      }
      // Add the layer
      else if ( newData  ){

        // Get the Alias
        let alias = layer.alias.replace(/_/g, " ");
        alias = alias.charAt(0).toUpperCase() + alias.slice(1);


        // On the First Query get the Style
        if( !mapLayers.includes(key) ){
          console.log( 'Adding ', key );
          mapLayers.push(key);
          layerStyles[key] = await getStyles(layer);
          layersData[key] = [];
          layersData[key].unshift(newData);
        }
        
        // If its not the First Query
        else if( mapLayers.includes(key) ){
          // Get the interesect using Primary Key Values 
          const oldUnique = [...new Set(layersData[key][0].map( obj => obj.properties[layer.primarykey] ))];
          const newUnique = [...new Set(newData.map( obj => obj.properties[layer.primarykey] ))];
          const intersect = [...new Set(oldUnique)].filter(x => new Set(newUnique).has(x));
          if( newUnique.length == intersect.length ){ return null }
          // Remove old Layer and add New Data
          !this.state.rndrdDt ? null : !map.hasLayer(this.state.rndrdDt[key]) ? null : map.removeLayer(this.state.rndrdDt[key]);
        }

        // Add New Data
        layersData[key].unshift(newData);

        // Compile all those variables into an object
        let renderObject = { 
          map,
          layer : layer,
          stateFunc : this.props.stateFunctions,
          alias : alias, 
          styles : layerStyles[key],
          key : key,
          records : layersData[key].reduce( (a, b) =>{ return a.concat(b) } ), 
          context : layer.fields.filter((field) => { return field.righthand }),
          hover : layer.fields.filter((field) => { return field.revealonhover }),
        }
        // Pass that object into our Render Layer function
        let newLayer = renderLayer.call(this, renderObject );
        // newLayer = L.conditionalMarkers(newLayer['_layers'], {maxMarkers: 2});

        let layersLegend = addLayerToLegend( layerStyles[key], alias, newLayer );  // Add Legend
        //legend.innerHTML += layersLegend;
        map.addControl(layersLegend)


        let rndrdDt = this.state.rndrdDt;
        rndrdDt[key] = newLayer;
        newLayer.addTo(map)
        // Zoom to the location if only one thing was rendered
        if( layersData[key] && layersData[key][0].length == 1 ){
          let layer = map._layers[newLayer._leaflet_id];
          let layerId = Object.keys(layer._layers)[0];
          let feature = layer._layers[layerId];
          feature.fire('click');
          //map.panBy([150, 0]);
        }
       this.setState({map, mapLayers, layersData, layerStyles, rndrdDt });

      }
    } )
  }
  render() {
    return ( < div id = "mapid"  className='custom-popup' tabIndex = "-1" > < /div> )
  }
}


// LEGEND
function addLayerToLegend(styles, updateLayerAlias, newLayer){

  // Styling Templates
  let elements = [];
  let imageStyle = ( img ) => ( {
    'background': "url("+ img + ") no-repeat left center",
    'width': '10px',
    'height': '10px'
  } )
  let pointStyle = ( color ) => ( {
    'background-color': color,
    'width': '10px',
    'height': '10px'
  } )

  // Class Breaks 
  if(styles.uniqueValueInfos.length){
    styles.uniqueValueInfos.map((field) => {
      let element = {}
      let label = field.label;
      if( label == ' '){ label = 'Unassigned'}
      element.label = label
      element.html = ''
      console.log(styles);
      if(field.image){ element.style = imageStyle(field.image) }
      else{ element.style = pointStyle(field.color) }
      elements.push(element)
    });
  }
  let label = updateLayerAlias
  if(styles.uniqueValueInfos.length){ label = 'Unassigned'}
  // Colors
  if(styles.line && styles.color){
    let element = {}
    element.html = ''
    element.label = label;
    element.style = pointStyle(styles.color)
    elements.push(element)
  }
  // Images
  if(styles.image){
    let element = {}
    element.html = ''
    element.label = label;
    element.style = imageStyle(styles.image) 
    elements.push(element)
  }
  // Update Opacity
  let updateOpacity = (layer, opacity) => {
    layer.eachLayer( layer => {
      typeof( layer.setOpacity ) == 'function' ?
        layer.setOpacity( opacity ) :
        layer.setStyle({ opacity: opacity, fillOpacity: opacity } );
    });
  }
  return L.control.htmllegend({
      position: 'bottomleft',
      legends: [{
          name: updateLayerAlias,
          layer: newLayer,
          elements: elements
      }],
      collapseSimple: true,
      detectStretched: true,
      collapsedOnInit: true,
      disableVisibilityControl : true,
      updateOpacity : updateOpacity,
      defaultOpacity: 1,
      visibleIcon: 'icon icon-eye',
      hiddenIcon: 'icon icon-eye-slash',
  })
}