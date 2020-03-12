import React, { Component } from 'react';

var L = require('leaflet');
var esri = require('esri-leaflet');
var geocoding = require('esri-leaflet-geocoder');
//require ('js/utils/leafletConditionalRender');
require ('leaflet-html-legend');

import { displayPoint, cityBoundaryStyle, 
  onBoundryHover, onBoundryMouseOut, onBoundryMouseOver,  
  resetHighlight, highlightFeature, getStyles,
  circle, marker, renderLayer
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
    let mapOptions = { 
      'center': this.props.state.configuration.geoposition.split(", "),
      'zoom': 12,
      'layers' : new L.TileLayer( 
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 
          { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'} 
        ),
    };
    let map = new L.Map('mapid', mapOptions);

    document.getElementById("mapid").tabIndex = "-1";
    map.zoomControl.setPosition('topleft');
    L.control.scale({ imperial: false }).addTo(map)

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
          showTitle : layer.showrecordtitleinpopup,
          records : layersData[key].reduce( (a, b) =>{ return a.concat(b) } ), 
          context : layer.fields.filter((field) => { return field.righthand }),
          hover : layer.fields.filter((field) => { return field.revealonhover }),
        }

        // Pass that object into our Render Layer function
        let newLayer = renderLayer.call(this, renderObject );
        newLayer.addTo(map);
        // newLayer = L.conditionalMarkers(newLayer['_layers'], {maxMarkers: 2});

        // Add Legend
        map.addControl(addLayerToLegend( layerStyles[key], alias, newLayer ))

        let rndrdDt = this.state.rndrdDt;
        rndrdDt[key] = newLayer;

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
    'height': '10px',
  } )
  let pointStyle = ( background, border ) => ( {
    'background': background,
    'width': '10px',
    'height': '10px',
    'border': '2px solid '+ border
  } )

  // Class Breaks 
  if(styles.uniqueValueInfos.length){
    styles.uniqueValueInfos.map( o => {
      let e = {}
      let label = o.label == ' ' ? 'Unassigned' : o.label;
      e.label = label
      e.html = ''
      if(o.image){ e.style = imageStyle(o.image) }
      else{ e.style = pointStyle(o.color, o.line) }
      elements.push(e)
    });
  }
  let label = updateLayerAlias
  if(styles.uniqueValueInfos.length){ label = 'Unassigned'}
  // Colors
  if(styles.line && styles.color){
    let e = {}
    e.html = ''
    e.label = label;
    e.style = pointStyle(styles.color, styles.line)
    elements.push(e)
  }
  // Images
  if(styles.image){
    let e = {}
    e.html = ''
    e.label = label;
    e.style = imageStyle(styles.image) 
    elements.push(e)
  }
  // Update Opacity
  let updateOpacity = (layer, opacity) => {
    console.log(layer),
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
        visibleIcon: 'icon icon-eye',
        hiddenIcon: 'icon icon-eye-slash'
  })
}