import App from 'js/components/App';
import Leaflet from 'leaflet';
import L from 'leaflet';
var geocoding = require('esri-leaflet-geocoder');
require('leaflet-responsive-popup');

export const mapOptions = { 
  'center': [39.2854197594374, -76.61796569824219],
  'zoom': 12,
  'layers' :
    new L.TileLayer( 
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 
      { attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'} 
    ),
};

// GeoCoder - Marker and Radius
export const circle = L.circle([39.2854197594374, -76.61796569824219], 1000, { color: 'red', fillColor: '#f03', fillOpacity: 0.3, opacity: 0.3 });
export const marker = L.marker([39.2854197594374, -76.61796569824219], { draggable: true }).on('dragend', e => {
    circle.setLatLng([marker.getLatLng().lat, marker.getLatLng().lng]);
    circle.redraw();
    geocoding.geocodeService().reverse().latlng([marker.getLatLng().lat, marker.getLatLng().lng]).run( (error, result) => {
    var popup = L.responsivePopup().setContent('<strong>' + result.address.Match_addr + "</strong><br><button onclick='removeRadiusMarker()'>Remove Radius</button><button onclick='marker.closePopup();'>Close Popup</button>");
    marker.bindPopup(popup)
    });
    marker.openPopup();
});

// Create The Legend
export const overlayLegend = L.Control.extend( {
  options: { position: 'bottomleft' },
  onAdd: map => {
    var container = L.DomUtil.create('div');
    container.className = "leaflet-bar leaflet-control leaflet-control-custom legendContainer";
    container.innerHTML = '';
    return container;
  }
} ); 


// Get Styles
export async function getStyles(layer) {
  
  let type = false; let field = false; 
  let line = false; let color = false; 
  let image = false;
  let drawingInfo = layer.drawinginfo;
  let geometryType = layer.geometryType;
  let styles = drawingInfo.renderer;
  let uniqueValueInfos = [];
  let transparency = 100;

  let prepareColor = (color, trans) => {
    if ( color[3] && color[3] != 0 ){
      color[3] = trans; 
    } return 'rgba(' + color + ')'
  }
  
  // Esri Layer
  if(geometryType && geometryType.substring(0, 4) == 'esri'){
    let labelingInfo = drawingInfo.labelingInfo;
    transparency = ((100-drawingInfo.transparency)/100);
    type = styles.type;

    // ESRI POINTS
    if(geometryType == "esriGeometryPoint"){

      // Default Point Styles
      // Used when type == 'simple' or Unique Values (below) do not apply
      if (styles.symbol) { image = 'data:image/png;base64,' + styles.symbol.imageData }
      if (styles.defaultSymbol) {
        line = prepareColor(styles.defaultSymbol.outline.color, transparency);
        color = prepareColor(styles.defaultSymbol.color, transparency);
      }

      // Unique Values -> Stormwater
      if (type == 'uniqueValue' && styles.uniqueValueInfos) {
        field = styles.field1;
        styles.uniqueValueInfos.map((uniqueInfo, i) => {
          let img = styles.uniqueValueInfos[i].symbol.imageData;
          if(img != false){img = 'data:image/png;base64,'+img}
          uniqueValueInfos.push({
            image : img, 
            label : uniqueInfo.label,
            description : uniqueInfo.description,
          })
        });
      }
      

    }
    // ESRI POLYGONS
    if(geometryType == "esriGeometryPolygon"){

      // Class Breaks -> Vital Signs
      if(type == 'classBreaks' && styles.classBreakInfos ){
        // console.log('Geom - classBreaks')
        field = styles.field;
        styles.classBreakInfos.map((classBreak) => {
          uniqueValueInfos.push(
            { 
            line : prepareColor(classBreak.symbol.outline.color, transparency),
            color : prepareColor( classBreak.symbol.color, transparency),
            label : classBreak.label,
            description : classBreak.description,
            classMaxValue : classBreak.classMaxValue
            }
          )
        })
      }
      // Simple Design -> Neighborhoods, Watersheds, etc
      else if (type == 'simple') {
        //console.log('Geom - Simple', layer)
        color = prepareColor( styles.symbol.outline.color, transparency );
        line = prepareColor( styles.symbol.color, transparency );
      } 
    }
  }


  // Style from the Config
  if( drawingInfo && !styles ){
    geometryType = 'point';
    const imagee = require('images/drawinginfo/'+drawingInfo)
    if(imagee){ image = imagee }
  }

  return {
    'type': type,
    'field' : field,
    'geometryType' : geometryType,
    'uniqueValueInfos' : uniqueValueInfos, 
    'line' : line, 
    'color' : color, 
    'image' : image,
  }
}

// getPopupInnerContent => TOOLTIP / POPUP InnerContent => Called from ONHOVER/ ONCLICK
function getPopupInnerContent(marker, renderObject ){
  let hovered = marker.feature.properties;
  let name = false;
  let address = false;
  let matched = [ false, false]
  if( (hovered.name)  && hovered.name    != ' ' ){ name = hovered.name; matched[0]='name';}
  if( (hovered.Name)  && hovered.Name    != ' ' ){ name = hovered.Name; matched[0]='Name';}
  if( (hovered.NAME)  && hovered.NAME    != ' ' ){ name = hovered.NAME; matched[0]='NAME';}
  if( hovered.address && hovered.address != ' ' ){ address = hovered.address; matched[1]='address';}
  if( hovered.ADDRESS && hovered.ADDRESS != ' ' ){ address = hovered.ADDRESS; matched[1]='ADDRESS';}
  let details = renderObject.hover.map( (field, index) => {
    if(matched[0] && field.name == matched[0] ){ return null }
    if(matched[1] && field.name == matched[1] ){ return null }
    let alias = field.alias;
    return ( "<b>"+ alias +"</b> : "+ hovered[field.name.trim()]+"</br>")
  } )
  !name ? null: details.unshift("<b>Given Name</b> : "+name+"</br>")
  !address ? null: details.unshift("<b>Address</b> : "+address+"</br>")
  details.unshift("<h3>"+renderObject.alias+"</h3>")
  details = details.join('')
  return details;
}

// ONHOVER
export function hoverEvent(event, renderObject ){
  let marker = event.target;
  if(renderObject.layer.hoverinfo){
    let details = getPopupInnerContent(marker, renderObject )
    !details.length ? null : marker.bindTooltip(''+details).openTooltip();
    if( typeof(marker.setStyle) == 'function' ){ marker.setStyle({ weight: 8 } ) }
  }
}

// ONCLICK
function onFeatureClick (event, renderObject) {
  let marker = event.target;
  let map = renderObject.map;
  let detectmob=()=> {var check=false;( a => {if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera); return check; }

  // contextonclick
  !renderObject.layer.contextonclick ? null : (
    detectmob() ? document.getElementById('navigation_drawer').style.display = 'none' : null,
    document.getElementsByClassName('toggle_context_drawer')[0].style.display = 'block',
    document.getElementById('context_drawer').style.display = 'flex',
    renderObject.stateFunc.showDetails(event)
  )
  
  // zoomonclick
  if (renderObject.layer.zoomonclick){
    if( typeof( marker.getLatLng ) == 'function' ){console.log('gah', marker.getLatLng());
      var latLngs = [ marker.getLatLng() ];
      var markerBounds = L.latLngBounds(latLngs);
      map.fitBounds(markerBounds);
    }
    else if( typeof( marker.getBounds ) == 'function' ){console.log('sAH', marker.getBounds());
      let zoomPosition = marker.getBounds()
      let zoomPadding = { paddingTopLeft: [50, 0], paddingBottomRight: [50, 0] }
      map.fitBounds ( zoomPosition, zoomPadding );
    }
  }

  // popuponclick
  if (renderObject.layer.popuponclick){
    let details = getPopupInnerContent(event.target, renderObject )
    var popup = L.responsivePopup().setContent(''+details);
    marker.bindPopup(popup).openPopup();
  }
}


// RENDER LAYER
export function renderLayer( renderObject ) {
  let layer = renderObject.layer
  let styles = renderObject.styles;
  let alias = renderObject.alias;
  let layerKey = renderObject.key
  let updateLayerRecords = renderObject.records;
  let stateFunctions =  renderObject.stateFunc;
  let showOnHovers = renderObject.hover;  
  // Description : This will render each unit of information as a point
  if (styles.geometryType == "esriGeometryPoint" || styles.geometryType == 'point' || renderObject.layer.name == 'property_details') {
    updateLayerRecords = updateLayerRecords.filter(rec => { return rec.geometry.coordinates ? rec.geometry.coordinates[0] != undefined : rec.geometry.rings[0] != undefined } )
    return L.geoJSON(
      updateLayerRecords, 
      { 
        onEachFeature: (feature, layer) => {
          feature.properties['layer'] = layerKey;
          layer.on({
            mouseover: event => { hoverEvent(event, renderObject) },
            click: event => {  onFeatureClick(event, renderObject) }
          });
        },
        pointToLayer: (feature, latlng) => { // Style
          if (styles.type == 'uniqueValue' && styles.uniqueValueInfos.length) {
            const index = styles.uniqueValueInfos.findIndex(filter => filter.label === feature.properties[styles.field]);
            let iconSettings = { iconUrl: styles.uniqueValueInfos[index].image, iconSize: [12, 12], iconAnchor:   [0, 0], popupAnchor: [6, 6], tooltipAnchor : [6, 6] }
            return L.marker(latlng, { icon: L.icon( iconSettings ), riseOnHover: true })
          }
          else if (styles.symbol || styles.image) {
            let iconSettings = { iconUrl: styles.image, iconSize: [12, 12], iconAnchor:   [0, 0], popupAnchor: [6, 6], tooltipAnchor : [6, 6] }
            return L.marker(latlng, { icon: L.icon( iconSettings ), riseOnHover: true } )
          }
          else if (styles.defaultSymbol) { return L.circleMarker(latlng, { fillColor: styles.color, color: styles.line, weight: 1, radius: 8 } ) }
          else{ return L.circleMarker(latlng, { radius: 8, fillColor: "#ff7800", color: "#000", weight: 1, opacity: 1, fillOpacity: 0.8 } ) } 
        }
      }
    )
  }
  // RENDER GEOMETRY : 
  if (styles.geometryType == "esriGeometryPolygon") {
    return L.geoJSON(
      updateLayerRecords, 
      {
        onEachFeature: (feature, layer) => {
          feature.properties['layer'] = layerKey;
          layer.on({
            mouseover: event => { hoverEvent(event, renderObject) }, 
            mouseout: event => { event.target.setStyle({ weight: 4 }) }, 
            click: event => {  onFeatureClick(event, renderObject) }, 
          }); 
        },
        style: feature =>{
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
            } return { fillColor: color, color: line, fillOpacity:1 }
          }
          else if (styles.type == 'simple') { return { fillColor: styles.color, color: styles.line, fillOpacity:1 } }
        }
      }
    )
  }
}