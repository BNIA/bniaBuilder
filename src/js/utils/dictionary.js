import {fetchData, groupBy} from 'js/utils/utils';
import {EsriSearch} from 'js/utils/handles/esriHandle';

/*
Inputs : Recieves the dictionary.layers right from sheets.js' processing
Outputs : Populates dictionary.layers 
*/
export async function fillDictionaries(oldDataSets) {
  let dataSets = oldDataSets
  // For each Dataset 
  let newData = await Promise.all( dataSets.map( async (dataSet, i) => {
    let ending = "?f=pjson";
    // Handle ArcGis
    if (dataSet.host == 'arcgis') {
      let esriHandler = new EsriHandler();
      let serviceInfo = await esriHandler.getArcGisServiceInfo(dataSet); // get service
      dataSet = esriHandler.fixBrokenLinks( dataSet, serviceInfo ); // ensure it's quality
      let layerInfo = await esriHandler.getArcGisLayerInfo(dataSet, serviceInfo);
      dataSet = esriHandler.esriCopyrightText(layerInfo, dataSet);
      dataSet.layerdescription = layerInfo.description;
      dataSet.geometryType = layerInfo.geometryType;
      dataSet.drawinginfo = layerInfo.drawinginfo;
      return dataSet;
    }
    // Handle bniaApi, googleSpreadSheets (doNothing)
    if (dataSet.host == 'bniaApi') { return ( dataSet ) }
    if (dataSet.host == 'socrata') { return ( dataSet ) }
    if (dataSet.host == 'googleSpreadSheets') { return ( dataSet ) }
    return ( dataSet )
  } ) )
  return newData
}




function EsriHandler(){

  // Get Service Information
  this.getArcGisServiceInfo = async dataSet => {
    let serviceUrl = 'https://services1.arcgis.com/' 
      + dataSet.provider + '/ArcGIS/rest/services/'
      + dataSet.service +'/FeatureServer';
    return await fetchData(serviceUrl + '?f=pjson');
  }

  // Find and replace broken links IFF a user specifies a layername
  this.fixBrokenLinks = (dataSet, service) => {
    let ln = dataSet.layername; let sl = service.layers;
    if( ln && ln != sl[dataSet.layer].name){
      sl.map( a => { if( a.name == ln ){ dataSet.layer = a.id; } } );
    } return dataSet
  }

  // Main Function
  this.getArcGisLayerInfo = async (layer, serviceInfo) => {

    // Get layer Information
    let layerUrl = 'https://services1.arcgis.com/' 
      + layer.provider + '/ArcGIS/rest/services/'
      + layer.service +'/FeatureServer/'+layer.layer;
    let esriLayer = await fetchData(layerUrl + '?f=pjson');

    // Write basics to layer
    layer['serviceInformation'] = serviceInfo.serviceDescription
    layer['geometryType'] = serviceInfo.layers[layer.layer].geometryType
    layer['drawinginfo'] = esriLayer.drawingInfo;
    layer['description'] = esriLayer.description
    layer['copyrightText'] = esriLayer.copyrightText // gets passed to esriCopyrightText()
 
    // Loop through the Esri Fields
    let fields = await Promise.all( esriLayer.fields.map( async ( esriField ) => {
      let index = layer.fields.map(lf=>lf.name).indexOf(esriField.name);
      if(index == -1){ return null }
      // If a Specified Field matches an Esri Field
      let newField = layer.fields[index];
      newField.alias = newField.alias ? newField.alias : esriField.alias ;
      if(!newField.type){  newField.type = esriField.type; }
      // Preload Filter
      newField['preloadfilter'] = !newField.preloadfilter ? false : await getDistinctEsriVals(layer, newField); 
      console.log(newField);
      return newField
    } ) );
    fields = fields.filter( f => f != null )
    console.log(fields)
    layer['fields'] = fields;
    return layer
  }

  // Group Subgroup Label
  this.esriCopyrightText = (layerInfo, layer) => {
    if(!layer.alias){
      let groupings = layerInfo.copyrightText.split(", ");
      if(groupings.length == 3){
        layer.alias = layer.alias ? layer.alias : groupings[2];
        layer.group = layer.group ? layer.group : groupings[0];
        layer.subgroup = layer.subgroup ? layer.subgroup : groupings[1];
      }
      else if(groupings.length == 2){
        layer.alias = layer.alias ? layer.alias : groupings[1];
        layer.group = layer.group ? layer.group : groupings[0];
        layer.subgroup = layer.subgroup ? layer.subgroup : false;
      }
      else if(groupings.length == 1){
        layer.alias = layer.alias ? layer.alias : groupings[0];
        layer.group = layer.group ? layer.group : false;
        layer.subgroup = layer.subgroup ? layer.subgroup : false;
      }
    }
    return layer
  }
}

// get distinct field values from arcGis
async function getDistinctEsriVals(layer, field){
  let flag = false;
  let obj=new EsriSearch(layer)
  return await obj.getPreloads(field)
}