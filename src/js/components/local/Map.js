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
    let {map, renderedData, layerStyles} = this.state;

    let dictionaries = state.dictionaries;
    dictionaries.map( async layer => {
      let mapLayers = this.state.mapLayers;
      let mapLayersKeyName = layer.service+layer.layer;
      // check Map Layers
      let layerData = layer.dataWithGeometry
      if( !layerData && mapLayers.includes(mapLayersKeyName) ){
        // delete layername from mapLayers, styles from layerStyles{ layerName : style }, layer from map
        map.hasLayer(renderedData[mapLayersKeyName]) ? map.removeLayer(renderedData[mapLayersKeyName]) : null;
        let d = this.state.renderedData; delete d[mapLayersKeyName];
        let s = this.state.layerStyles; delete s[mapLayersKeyName];
        let newMapLayers = this.state.mapLayers; newMapLayers = mapLayers.filter(e => e !== mapLayersKeyName)
        //console.log('mapLayers',newMapLayers); console.log('layerStyles',s); console.log('renderedData',d );
        this.setState({'map':map, 'mapLayers':newMapLayers, 'layerStyles':s, 'renderedData':d })
      }
      else if( layerData && !mapLayers.includes(mapLayersKeyName) ){

        // Update State MapLayers
        mapLayers.push(mapLayersKeyName);

        // Update State LayerStyles
        layerStyles[mapLayersKeyName] = await getStyles(layer);


        // Get Alias
        let layerAlias = layer.alias.replace(/_/g, " "); 
        layerAlias = layerAlias.charAt(0).toUpperCase() + layerAlias.slice(1);


        // Compile all those variables into an object
        let renderObject = { 
          map,
          layer : layer,
          stateFunc : this.props.stateFunctions,
          alias : layerAlias, 
          styles : layerStyles[mapLayersKeyName],
          layerKey : mapLayersKeyName,
          records : layerData, 
          context : layer.fields.filter((field) => { return field.righthand }),
          hover : layer.fields.filter((field) => { return field.revealonhover }),
        }

        // Pass that object into our Render Layer function
        let newLayer = renderLayer.call(this, renderObject );
        let renderedData = this.state.renderedData;
        renderedData[mapLayersKeyName] = newLayer;
        renderedData[mapLayersKeyName].addTo(map)
        
        
        // Zoom to the location if only one thing was rendered
        if( layerData && layerData.length == 1 ){
          let layer = map._layers[newLayer._leaflet_id];
          let layerId = Object.keys(layer._layers)[0];
          let feature = layer._layers[layerId];
          feature.fire('click');
          map.panBy([150, 0]);
        }

        this.setState({ layerStyles, map, mapLayers, renderedData });
      }
      else if( layerData ){
        // GeometryData exists and so deos MapLayers. Old Geom Data is not the same as the New Geom data though. 
        // I.E. this.props.state.dictionaries[name]GeometryData != prevProps.state.dictionaries[name]GeometryData
        // console.log('Update ', layer );
        // remove layer from map
        // add layer to map
      }
    } )
  }
  render() {
    return ( < div id = "mapid"  className='custom-popup' tabIndex = "-1" > < /div> )
  }
}