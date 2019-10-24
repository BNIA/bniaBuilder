import {fetchData} from 'js/utils/utils'; 
import {EsriSearch} from 'js/utils/handles/esriHandle'; 
import {SocrataSearch} from 'js/utils/handles/socrataHandle'; 
import {BniaSearch} from 'js/utils/handles/bniaHandle'; 

/* 
Inputs : Recieves the dictionary.layers right from sheets.js' processing 
Outputs : Populates dictionary.layers for bnia socrata, arcgis 

  -- Arcgis 
  -- -- Uses 'esriHandler()' class functions
  -- -- Get Service Information, Fix Broken Links, get Fields Information, get copyrightText
  -- -- The 'copyrightText' field may be used in esri to specify Group Subgroup and alias Labels
  -- -- preloadFilter ? getDistinctXYZVals () -> XYZSearch(layer) -> getPreloads(field)

  -- Bnia Api 
  -- -- preloadFilter ? getDistinctXYZVals () -> XYZSearch(layer) -> getPreloads(field)

  -- Socrata 
  -- -- does not use preloadFilter because getting distinct values by column in not possible.
  -- -- currentFormsData can be used instead to populate suggestions by fetching ... data from the set.

  -- Todo : G Spreadsheets - CSV's 
*/
export async function fillDictionaries(oldDataSets) {
  let dataSets = oldDataSets
  // For each Dataset 
  let newData = await Promise.all( dataSets.map( async (layer, i) => {
    let ending = "?f=pjson";
    // Handle ArcGis
    if (layer.host == 'arcgis') {
      let esriHandler = new EsriHandler();
      let serviceInfo = await esriHandler.getArcGisServiceInfo(layer); // get service
      layer = esriHandler.fixBrokenLinks( layer, serviceInfo ); // ensure it's quality
      let layerInfo = await esriHandler.getArcGisLayerInfo(layer, serviceInfo);
      layer = esriHandler.esriCopyrightText(layerInfo, layer);
      layer.layerdescription = layerInfo.description;
      layer.geometryType = layerInfo.geometryType;
      layer.drawinginfo = layerInfo.drawinginfo;
      return layer;
    }
    // Handle bniaApi
    if (layer.host == 'bniaApi') { 
      // Loop through the Bnia Fields
      let fields = await Promise.all( layer.fields.map( async ( field ) => {
        // Preload Filter
        field['preloadfilter'] = !field.preloadfilter ? false : await getDistinctBniaVals(layer, field); 
        console.log(field);
        return field
      } ) );
      fields = fields.filter( f => f != null )
      console.log(fields)
      layer['fields'] = fields;
      return layer
    }
    // Handle socrata
    if (layer.host == 'socrata') { 
      layer['currentFormsData'] = await getDistinctSocrataVals(layer, 'null');
      return layer
    }
    // Handle googleSpreadSheets
    if (layer.host == 'googleSpreadSheets') { 
      console.log('host = googleSpreadSheets')
      return ( layer ) 
    }
    // Handle CSV
    if (layer.host == 'csv') { 
      console.log('host = csv')
      return ( layer ) 
    }
    return ( layer )
  } ) )
  return newData
}

function EsriHandler(){

  // Get Service Information
  this.getArcGisServiceInfo = async layer => {
    let serviceUrl = 'https://services1.arcgis.com/' 
      + layer.provider + '/ArcGIS/rest/services/'
      + layer.service +'/FeatureServer';
    return await fetchData(serviceUrl + '?f=pjson');
  }

  // Find and replace broken links IFF a user specifies a layername
  this.fixBrokenLinks = (layer, service) => {
    let ln = layer.layername; let sl = service.layers;
    if( ln && ln != sl[layer.layer].name){
      sl.map( a => { if( a.name == ln ){ layer.layer = a.id; } } );
    } return layer
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
      if( !layer.fields){ console.log(layer, layer.fields) }
      let index = layer.fields.map(lf=>lf.name).indexOf(esriField.name);
      if(index == -1){ return null }
      // If a Specified Field matches an Esri Field
      let newField = layer.fields[index];
      newField.alias = newField.alias ? newField.alias : esriField.alias ;
      if(!newField.type){  newField.type = esriField.type; }
      // Preload Filter
      newField['preloadfilter'] = !newField.preloadfilter ? false : await getDistinctEsriVals(layer, newField); 
      //console.log(newField);
      return newField
    } ) );
    fields = fields.filter( f => f != null )
    //console.log(fields)
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
  let obj=new EsriSearch(layer)
  return await obj.getPreloads(field)
}

// get distinct field values from arcGis
async function getDistinctBniaVals(layer, field){
  let obj=new BniaSearch(layer)
  return await obj.getPreloads(field)
}

// get distinct field values from arcGis
async function getDistinctSocrataVals(layer, field){
  let obj=new SocrataSearch(layer)
  return await obj.getPreloads(field)
}