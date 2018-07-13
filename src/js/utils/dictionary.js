import {fetchData, groupBy, isEmpty} from 'js/utils/utils';

// Rertrieve Dictionaries and Buff out your Context
export async function fillDictionaries(oldDataSets) {
  console.log(oldDataSets);
  let dataSets = oldDataSets
  if(typeof(dataSets)=='undefined'){ return dataSets}
  // For each Dataset
  let newData = dataSets.map( async function(dataSet, i){
    if(typeof(dataSet.host)=='undefined'){ console.log('noHost') }
    let ending = "?f=pjson";
    // Handle ArcGis
    if (dataSet.host == 'arcgis') {
      if(typeof(dataSet.provider)=='undefined'){ console.log('noProvider') }
      if(typeof(dataSet.service)=='undefined'){  console.log('noService') }
      // getArcGisLayerInfo Function Call
      let layerInfo = await getArcGisLayerInfo(dataSet);
      // This is a BNIA ARCGIS thing only.
      if(!dataSet.alias){
        let groupings = layerInfo.copyrightText.split(", ");
        if(groupings.length == 3){
          dataSet.alias = groupings[2];
          dataSet.subgroup = groupings[1];
          dataSet.group = groupings[0];
        }
        else if(groupings.length == 2){
          dataSet.alias = groupings[1];
          dataSet.subgroup = false;
          dataSet.group = groupings[0];
        }
        else if(groupings.length == 1){
          dataSet.alias = groupings[0];
          dataSet.subgroup = false;
          dataSet.group = false;
        }
      }
      dataSet.layerdescription = layerInfo.description;
      dataSet.geometryType = layerInfo.geometryType;
      dataSet.drawinginfo = layerInfo.drawinginfo;
      return dataSet;
    }
    // Handle bniaApi, googleSpreadSheets (doNothing)
    if (dataSet.host == 'bniaApi') { return ( dataSet ) }
    if (dataSet.host == 'googleSpreadSheets') { return ( dataSet ) }
    return ( null )
  });
  return dataSets
}

async function getArcGisLayerInfo(dataSet){
  // Get Service Information
  let serviceUrl = 'https://services1.arcgis.com/' 
    + dataSet.provider + '/ArcGIS/rest/services/'
    + dataSet.service +'/FeatureServer';
  let layerUrl = 'https://services1.arcgis.com/' 
    + dataSet.provider + '/ArcGIS/rest/services/'
    + dataSet.service +'/FeatureServer/'+dataSet.layer;
  console.log(serviceUrl);
  let serviceInformation = await fetchData(serviceUrl + '?f=pjson');
  let layerInformation = await fetchData(layerUrl + '?f=pjson');
  let layer = {};
  //console.log(layerUrl);
  //console.log(serviceUrl);
  layer['serviceInformation'] = serviceInformation.serviceDescription
  //layer['name'] = layerInformation.name
  // Determines what gets painted and how
  console.log(serviceInformation);
  layer['geometryType'] = serviceInformation.layers[dataSet.layer].geometryType
  // Paint Points
  layer['drawinginfo'] = layerInformation.drawingInfo;
  // Description
  layer['description'] = layerInformation.description
  // Group Subgroup Label
  layer['copyrightText'] = layerInformation.copyrightText

  // For each Field in the ARCGIS Layer
  let usableFields = layerInformation.fields.filter( function(field, i) {
    // return the arcGis Field if can be found matching a field from our Dictionary
    let arcGisField = field.name.toUpperCase().trim();
    var dataSetField = dataSet.fields.map(function(e) { return e.name.toUpperCase().trim(); })
    let exists = dataSetField.indexOf( arcGisField )
    return exists >= 0 ? true : false;
  } );
  let fieldInformation = usableFields.map( async function(field, i) {
    var dataSetField = dataSet.fields.map(function(e) { return e.name.toUpperCase(); }).indexOf(field.name.toUpperCase());
    let mergedField = dataSet.fields[dataSetField];
    mergedField.alias = field.alias;
    if(!mergedField.type){  mergedField.type = field.type; }
    return mergedField.preloadfilter ? await getArcGisFieldDistinctValues(dataSet, mergedField) : mergedField; 
  } );
  layer['fields'] = fieldInformation;
  return layer
}

async function getArcGisFieldDistinctValues(dataSet, field){
  let flag = false;
  let root = 'https://services1.arcgis.com/' + dataSet.provider + '/ArcGIS/rest/services/' + dataSet.service + '/FeatureServer/' + dataSet.layer + '/query?';
  
  // Total Number Of Records
  let totalNumberofRecords = root + 'where=1%3D1&returnCountOnly=true&f=pjson';
  totalNumberofRecords = await fetchData(totalNumberofRecords).then(json => { return json.count });
  // Get Actual data. Calling as many times as we need to. 
  let allRecords = [];
  do{
    //"+dataSet.primarykey+"+
    let queryString = root + "where=1%3D1&returnGeometry=false&outFields="+field.name+"&resultOffset%3D" + allRecords.length + "&returnDistinctValues=true&f=pjson"
    let response = await fetchData(queryString).then(json => { if(json != undefined){ return json.features } return null });
    if (response != null){ allRecords = allRecords.concat(response) }
    console.log(dataSet);
    console.log('Queried : ' + queryString, response)
    if( response.length < 1000 ){ flag = true; }
  }
  while( flag == false );
  field['data'] = allRecords;
  field['db'] = allRecords;
  return field;
}
