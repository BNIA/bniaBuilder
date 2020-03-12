import {fetchData, splitObjectArrayByKey, isEmpty} from 'js/utils/utils';
import {EsriSearch} from 'js/utils/handles/esriHandle'; 
import {SocrataSearch} from 'js/utils/handles/socrataHandle'; 
import {BniaSearch} from 'js/utils/handles/bniaHandle'; 

/*
Inputs : SheetID, 
Outputs : take a Google Sheet ID and return a configuration doc
Description : 
  -- Calls google Spreadsheets given a key
  -- Grabs a field called 'layers' and 'fields'
  -- group fields by a 'key'
  -- Stuff a grouping into layers that have the same 'key'
*/
export async function getSheets(sheetsUrlKey){
  let sheetsUrl = 'https://spreadsheets.google.com/feeds/list/'+sheetsUrlKey+'/';
  let sheetNumber = 1;
  let sheetsData = [];
  let sheetUrl = '';
  let sheetData = [];
  let layersIndex = 4;
  let fieldsIndex = 5;
  if (sheetsUrlKey == 'null'){ return null }

  // Get sheets
  do {
    sheetUrl = sheetsUrl + sheetNumber + "/public/values?alt=json";
    console.log(sheetUrl);
    sheetData = await readSpreadsheet(sheetUrl);
    // In case the preset index was off.
    layersIndex = sheetData.title == 'layers' ? sheetNumber-1 : layersIndex;
    fieldsIndex = sheetData.title == 'fields' ? sheetNumber-1 : fieldsIndex;
    sheetData != 'error' ? (sheetNumber++, sheetsData.push(sheetData) ) : sheetNumber = 'NaN'
  } 
  while( typeof(sheetNumber) == 'number' &&  sheetNumber < 7 )

  // Read the Fields and Layers Sheet
  console.log(sheetsData);
  let layers = sheetsData[layersIndex]['entry'];
  let fields = Object.keys(sheetsData[fieldsIndex]['entry']).map(
    key=>{ return sheetsData[fieldsIndex]['entry'][key] }
  );

  // Group the Fields by key
  // (creates an array of array of objects for array of objects)
  let groupedFields = splitObjectArrayByKey(fields, (item) => { return [item.key] } );
  
  // Insert Into Layers a Group if it matches Key
  Object.keys(layers).map( i  => {
    let fields = groupedFields.filter( group =>{ 
      return group[0]['key'] == layers[i]['key'] ? group : [ ] 
    } );
    layers[i]['fields'] = fields[0];
  } )

  sheetsData = sheetsData.filter( x => x.title != 'fields' )
  return sheetsData;
}

/*
Inputs : 
Outputs : 
Description : 
  -- Gather Sheet Information
*/
async function readSpreadsheet(url){
  let returnData = [];
  let data = await fetchData(url); data = data.feed;
  returnData['entry'] = [];
  // Get Sheet Update Date
  returnData['updated'] = data.updated.$t;
  // Get Title  // Get Author
  for (let index in data.author){
    returnData['name'] = data.author[index].name.$t;
    returnData['email'] = data.author[index].email.$t; }
  returnData['title'] = data.title.$t;

  // Get columns. Used transposing Layer Field and Modal Sheets into objects 
  let columnNames = Object.keys( data.entry[0]).filter( col => { return col.toLowerCase().indexOf("gsx$") >= 0 }); 

  // Handle Configuration // Style // Theme
  if( ( data.title.$t == 'configuration' ) || 
      ( data.title.$t == 'style' ) || 
      ( data.title.$t == 'theme' ) ) { 
      returnData['entry'] = {};
      for (let index in data.entry){
        let record = data.entry[index];
        // Everything is a key-value pair
        let keyVal = record['gsx$key']['$t'];
        let value = record['gsx$value']['$t'];
        returnData['entry'][keyVal] = value;
      }
  }
  // Handle Modals
  else if( ( data.title.$t == 'modals' ) ) { 
      for (let index in data.entry){
        let record = data.entry[index];
        // Columns are Columns. Rows are Rows
        returnData['entry'][index] = {}
        columnNames.map( (column) => {
          let value = record[column]['$t'].trim()
          if( value.toLowerCase() == 'true' ){  value = true }
          else if( value.toLowerCase() == 'false' || value == '' ){  value = false }
          returnData['entry'][index][column.replace("gsx$", '')] = value;
        } )
      }
      returnData['entry'] = readModal(returnData);
  }
  // Handles Layers and Fields. Row for each canonical, a Column for each layer/field
  else if( ( data.title.$t == 'layers' ) || ( data.title.$t == 'fields' ) ) { 
    for (let index in data.entry){
      let record = data.entry[index];
      // filter for gsx$
      let key = '';
      let filtered = columnNames.filter( column => {
        if( column == 'gsx$key' ){ key = record[column]['$t'].trim().toLowerCase(); return false }
        if ( column.substring(0, 4) == 'gsx$' ){ return true }
        return false
      } );
      if( index == 0 ){
        // console.log(record);    
        filtered.map( ( column, position ) => {
          returnData['entry'][position] = {};
          returnData['entry'][position]['key'] = column.replace("gsx$", '').trim(); //.replace(/_[0-9]+$/g, "")
        } )
      }
      // for each remaining gsx$ insert into its object the current value at key gsx$key $t
      filtered.map( ( column, postion ) => {
        let value = record[column]['$t'].trim();
        if( value.toLowerCase() == 'true' ){  value = true }
        else if( value.toLowerCase() == 'false' || value == '' ){  value = false }
        returnData['entry'][postion][key] = value;
      } )
    }
  }
  return returnData
}







/*
Inputs : 
Outputs : 
Description : Parse the Modals Json Object and return a usable verision of it
*/
function readModal(givenData){
  let returnObject = []; 
  Object.keys(givenData['entry']).map( index => {
    let modal = {}
    let row = givenData['entry'][index];
    let key = row.key;
    // Modal attributes
    if( ( !isEmpty(row.modalheader) ) && ( isEmpty(row.children) ) ){
      modal['key'] = row.key;
      modal['modalheader'] = row.modalheader;
      modal['actionrequired'] = Boolean(row.actionrequired);
      modal['buttonlabel'] = row.buttonlabel;
      modal['children'] = [];
      returnObject.push(modal)
    }
    // Modal Content
    else if( ( isEmpty(row.modalheader) ) && ( !isEmpty(row.children) ) ){
      returnObject[returnObject.length-1]['children'].push({ 
       'children' : row.children,
       'component' : row.component,
       'onstart' : Boolean(row.onstart),
       'properties' : JSON.parse(row.properties),
      });
    }
  } )
  return returnObject;
}




















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
  console.log(dataSets);
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