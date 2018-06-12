import React, { Component } from 'react';
import Leaflet from 'leaflet';
import L from 'leaflet';
var esri = require('esri-leaflet');
import geocoding from 'esri-leaflet-geocoder';
import { displayPoint, mapOptions, cityBoundries, cityBoundaryStyle, 
  onBoundryHover, onBoundryMouseOut, onBoundryMouseOver,  
  resetHighlight, highlightFeature, getStyles
} from 'js/utils/mapHelper';

// These are OK to declare in the global scope
let map = '';
let circle = L.circle([39.2854197594374, -76.61796569824219], 1000, { color: 'red', fillColor: '#f03', fillOpacity: 0.3, opacity: 0.3 });
let marker = L.marker([39.2854197594374, -76.61796569824219], { draggable: true }).on('dragend', function(e) {
    circle.setLatLng([marker.getLatLng().lat, marker.getLatLng().lng]);
    circle.redraw();
    geocoding.geocodeService().reverse().latlng([marker.getLatLng().lat, marker.getLatLng().lng]).run(function(error, result) {
        marker._popup.setContent('<strong>' + result.address.Match_addr + "</strong><br><button onclick='removeRadiusMarker()'>Remove Radius</button><button onclick='marker.closePopup();'>Close Popup</button>");
    });
    marker.openPopup();
});
let mapLayers = {

}
    
export default class Map extends Component {
  displayName: 'Map';
  constructor(props) {
    super(props);
    this.state = { };
  }

  // The render method does nothing but create the div to insert our map.
  // ComponentDidMount handles the setting up of our map.
  componentDidMount() {
    // Intialize The Map Enviornment
    map = new L.Map('mapid', mapOptions);
    document.getElementById("mapid").tabIndex = "-1";
    map.zoomControl.setPosition('topleft');
    L.control.scale({ imperial: false }).addTo(map);
    L.geoJSON().addTo(map).addData(cityBoundries).setStyle(cityBoundaryStyle);
    // Create The Legend
    var overlayLegend = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: function(map) {
        var container = L.DomUtil.create('div');
        container.className = "leaflet-bar leaflet-control leaflet-control-custom legendContainer";
        container.innerHTML = '';
        return container;
      }
    });  map.addControl(new overlayLegend());

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
    
    // Utility
    function milesToMeters(miles) { return miles * 1069; };
    function removeRadius() { map.removeLayer(circle); };
    function removeRadiusMarker() { map.removeLayer(circle); map.removeLayer(marker); };

    // Search Control Events
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
        map.fitBounds(circle.getBounds());
        document.getElementById("removeRadius").addEventListener("click", removeRadius);
        document.getElementById("removeRadiusMarker").addEventListener("click", removeRadiusMarker);
    });
  }
  
  // ComponentDidUpdate will handle changes to our layers
  async componentDidUpdate(prevProps, prevState) {
    let records = this.props.state.records;
    // exists only IFF a layer was added (ever)
    if( records ){
      // Remove any layers from the map if they do not exist in the records
      Object.keys(mapLayers).map( mapKey => {
        let layerDict = this.props.state.dictionaries.filter( layer => layer.key == mapKey )[0]
        let recordKey = layerDict.host+'&'+layerDict.service+'&'+layerDict.layer;
        let layerData = this.props.state.records[recordKey];
        !layerData ? map.removeLayer(mapLayers[mapKey]) : console.log('layerData', layerData); ;
      } )

      // Start by getting the Legend and clearing its innerHTML
      let legend = document.getElementsByClassName("legendContainer")[0];
      let legendContent = ''; legend.innerHTML = legendContent;

      // Then loop through through our records
      await Object.keys(records).map( async key => {

        // If the records in our state, 
        if(this.state[key]){
          // check if it should be displayed then append its Legend information. 
          let layerState = this.state[key];
          !layerState.display ? '' : 
          legend.innerHTML += addLayerToLegend( layerState.styles, layerState.alias);
          // BOLD TODO: update the state if the key exists but the records have been changed.
        }
        else{
          console.log('Adding ' + key + ' to the Legend with Styles : ');
          // Add a new object to our state containing all the layer information.
          let updateLayerDictionary = this.props.state.dictionaries.filter(
            dictionary => ((dictionary.service == key.split('&')[1]) && (dictionary.layer == key.split('&')[2])))[0];
          let styles = await getStyles(updateLayerDictionary);
          let updateLayerAlias = updateLayerDictionary.alias.replace(/_/g, " "); 
          updateLayerAlias = updateLayerAlias.charAt(0).toUpperCase() + updateLayerAlias.slice(1);
          let dictionaryKey = updateLayerDictionary.key;
          // Compile all those variables into an object
          let updateLayerInformation = { 
            styles, dictionaryKey,
            display : true, 
            records : records[key], 
            alias : updateLayerAlias, 
            context : updateLayerDictionary.fields.filter((field) => { return field.righthand }),
            hover : updateLayerDictionary.fields.filter((field) => { return field.revealonhover }),
          }



          
          // Pass that object into our Render Layer function
          let newLayer = renderLayer( updateLayerDictionary, updateLayerInformation , prevProps.stateFunctions );
          mapLayers[updateLayerDictionary.key] = newLayer;
          mapLayers[updateLayerDictionary.key].addTo(map)
          



          // Zoom to the location if only one thing was rendered
          if(!Array.isArray(updateLayerInformation.records)){
            let layer = map._layers[newMapLayer._leaflet_id];
            let layerId = Object.keys(layer._layers);
            let feature = mapLayer._layers[ layerId ];
            feature.fire('click');
          }
          this.setState({ [key] : updateLayerInformation })
        }
      })
      return null;
    }
  }
  // START RENDER : Display/remove the points/boundaries and update the Legend
  render() {
    const { state, stateFunctions } = this.props;
    return ( < div id = "mapid" tabIndex = "-1" > < /div> )
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

function renderLayer( updateLayerDictionary, layerState , stateFunctions ) {
  let styles = layerState.styles;
  let alias = layerState.alias;
  let dictionaryKey = layerState.dictionaryKey
  let updateLayerRecords = layerState.records;
  let showOnHovers = layerState.hover;  
  // USES => showOnHovers, styles, showDetails
  // Description : This will render each unit of information as a point
  if (styles.geometryType == "esriGeometryPoint" || styles.geometryType == 'point') {
    // Process BNIA Data into an array of Json Features
    if (styles.geometryType == 'point') {
      updateLayerRecords = updateLayerRecords.map( record => {
        var outGeoJson = {}
        outGeoJson['properties'] = record;
        outGeoJson['type']= "Feature";
        outGeoJson['geometry']= {"type": "Point", "coordinates": [record['xcord'], record['ycord']]}
        return outGeoJson
      } );
    }
    console.log(updateLayerRecords);
    return L.geoJSON(
      updateLayerRecords, 
      { 
        onEachFeature: function(feature, layer) {
          layer.on({
            mouseover: function(event) {
              layer = event.target ? event.target : event;
              feature = layer.feature;
              let pointsData = showOnHovers.map((field) => {
                return '<br><b>' + field.alias + '</b> : ' + feature.properties[field.name.trim()]; 
              });
              layer.bindTooltip('<h4>' + alias + '</h4>' + pointsData).openTooltip();
            },
            click: function(event) {
              document.getElementsByClassName('toggle_context_drawer')[0].style.display = 'block';
              document.getElementById('context_drawer').style.display = 'flex';
              stateFunctions.showDetails(event); 
            }
          });
        },
        pointToLayer: function(feature, latlng) {
          feature.properties['layer'] = dictionaryKey;
          if (styles.type == 'uniqueValue' && styles.uniqueValueInfos.length) {
            const index = styles.uniqueValueInfos.findIndex(filter => filter.label === feature.properties[styles.field]);
            let iconSettings = { iconUrl: styles.uniqueValueInfos[index].image, iconSize: [12, 12], iconAnchor:   [0, 0], popupAnchor: [6, 6], tooltipAnchor : [6, 6] }
            return L.marker(latlng, { 
              icon: L.icon( iconSettings ), 
              riseOnHover: true 
            })
          }
          else if (styles.symbol || styles.image) {
            let iconSettings = { iconUrl: styles.image, iconSize: [12, 12], iconAnchor:   [0, 0], popupAnchor: [6, 6], tooltipAnchor : [6, 6] }
            return L.marker(latlng, { 
              icon: L.icon( iconSettings ), 
              riseOnHover: true 
            } )
          }
          else if (styles.defaultSymbol) { 
            return L.circleMarker(latlng, { 
              fillColor: styles.color, 
              color: styles.line, 
              weight: 1, 
              radius: 8 
            } ) 
          }
          else{ 
            return L.circleMarker(latlng, { 
              radius: 8, 
              fillColor: "#ff7800", 
              color: "#000", 
              weight: 1, 
              opacity: 1, 
              fillOpacity: 0.8 
            } )
          }   
        }
      }
    )
  }
  // RENDER GEOMETRY : 
  // USES => onBoundryMouseOver, onBoundryMouseOut, zoomToFeatur, Style, updateLayer
  // Description : This will render each unit of information as a Boundary
  // *Sidenote : The layerName is appended to each point for Dictionary retrieval on click.
  if (styles.geometryType == "esriGeometryPolygon") {
    console.log(styles);
    return L.geoJSON(
      updateLayerRecords, 
      {
        onEachFeature: function(feature, layer) {
          feature.properties['layer'] = dictionaryKey;
          layer.on({
            mouseover: function(event){ onBoundryMouseOver(event, layerState, updateLayerDictionary) }, 
            mouseout: function(event){ onBoundryMouseOut(event, layerState, updateLayerDictionary) }, 
            click: function(event){ zoomToFeature(event, updateLayerDictionary, stateFunctions) }
          }); 
        },
        style: function(feature) {
          if ((styles.type == 'uniqueValue') || (styles.type == 'classBreaks') ) {
            // Set the default styling 
            let line = styles.line;
            let color = styles.color;
            // Unless there exists Unique Styling information.
            if(styles.uniqueValueInfos.length){
              let actualValue = feature.properties[styles.field] - 0.001;
              const index = styles.uniqueValueInfos.findIndex(filter => filter.classMaxValue >= actualValue );
              color = styles.uniqueValueInfos[index].color;
              line = styles.uniqueValueInfos[index].line;
            }
            return { fillColor: color, color: line, fillOpacity:1 }
          }
          else if (styles.type == 'simple') {
            return { fillColor: styles.color, color: styles.line, fillOpacity:1 }
          }
        }
      }
    )
  }
}



// Remove Layer
 function removeLayer (layerDom) { map.hasLayer(layerDom) ? map.removeLayer(layerDom) : null; }
// Zoom to Feature
function zoomToFeature (e, updateLayerDictionary, stateFunctions) {
  console.log('Zooming to Feature');
  let mobile = detectmob();
  updateLayerDictionary.contextonclick ? (
    mobile ? document.getElementById('navigation_drawer').style.display = 'none' : null,
    document.getElementsByClassName('toggle_context_drawer')[0].style.display = 'block',
    document.getElementById('context_drawer').style.display = 'flex',
    stateFunctions.showDetails(e)
  ) : null
  map.fitBounds ( e.target.getBounds(), { paddingTopLeft: [50, 0], paddingBottomRight: [50, 0] } )
}
function detectmob() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
