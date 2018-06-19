import {fetchData, groupBy} from 'js/utils/utils';

// Get API SubGroup Data
export async function handleReset(event, records, dictionary){
  // Reset all Inputs
  event.target.form.reset
  // Remove field.data from all fields
  let newDictionaries = records.map( dictionary => { return dictionary.fields.map( field => { return field.data = [] } ) } )
  return records
}

// Searchbox Suggestions/ Handling
export async function handleChange(event, dictionaries) {
  let newData = dictionaries;
  newData = (typeof(newData) =='undefined') ? {} : newData;
  let key = event.target.form.dataset.key;
  let fieldName = event.target.dataset.field;
  // Get the Layer matching our key.
  let layer = newData.filter(function(k) { return k.key === key  })[0];
  // Get the Specific Field were looking at.
  let field = layer['fields'].find(function(obj) { return obj.name.trim() === fieldName } );
  var text = event.target.value;
  // Just like with this
  if (text == '') { text = 'Enter Text' }
  field['filter'] = text;
  // DISTINCT Suggestions
  if (layer.host == 'bniaApi') {
    let queryString = 'https://charleskarpati.com/api?' +
      'table' + '=' + layer.layer.replace(/ /g, "%20") + '&' +
      'fields' + '=' + fieldName.replace(/ /g, "%20") + '&' +
      'fieldsVals' + '=' + text.replace(/ /g, "%20") + '&' +
      'purpose' + '=' + 'suggestions';
    console.log('Retrieving Suggestions : ' + queryString);
    let distinctValues = await fetchData(queryString);
    field['curVal'] = text;
    field['data'] = Object.values(distinctValues);
  }
  if (layer.host == 'arcgis') {
    let root = 'https://services1.arcgis.com/' + layer.provider.replace(/ /g, "%20") + 
      '/ArcGIS/rest/services/' + layer.service.replace(/ /g, "%20") +
      '/FeatureServer/'+layer.layer.replace(/ /g, "%20")+
      '/query?';
    let queryString = root + "where="+ field.name+"+like%27%25"+text+'%25%27';
    queryString = queryString + '&returnGeometry=false';
    queryString = queryString + '&outFields='+field.name;
    queryString = queryString + '&returnDistinctValues=true';
    queryString = queryString + '&f=pjson';
    console.log('Retrieving Suggestions : ' + queryString);
    let distinctValues = await fetchData(queryString);
    distinctValues = distinctValues.features.map( (feature) => feature.attributes[field.name] );
    field['curVal'] = text;
    field['data'] = distinctValues;
  }
  return newData
}

function getInputValue( type, key, value){

}
  
// Get API SubGroup Data
export async function handleSubmit(event, records, dictionaries) {
  event.preventDefault();
  let newData = (typeof(dictionaries) =='undefined') ? {} : dictionaries;
  // Get the form
  let target = event.target.form ? event.target.form : event.target.parentElement.nextSibling;
  let key = target.dataset.key;
  // Get the Layer matching our key.
  let layer = newData.filter(function(k) { return k.key === key  })[0];
  let newRecords = records ? records : {};
  // Search Buttons have Layer Information
  // Search Inputs have Field Information
  let fields = '';
  let fieldsVals = '';
  // Get Values for TextBoxes
  let inputs = target.getElementsByTagName('input');
  Object.keys(inputs).map((index, i) => {
    let input = inputs[index];
    fields += (input.dataset.field.trim() + 'END');
    fieldsVals += (input.value.trim() + 'END');
  });
  // get Values for Dropdowns
  let dropdowns = target.getElementsByTagName('select')
  Object.keys(dropdowns).map((index, i) => {
    let input = dropdowns[index];
    let value = input.options[input.selectedIndex].value.trim();
    fields += (input.dataset.field.trim() + 'END');
    fieldsVals += (value + 'END');
  });

  // Get filters from a foreign layer
  // This was written after and grabs the information from the dictionary.
  // This is how the initial layer should be handled.
  let flayer = dictionaries.filter(function(k) {
    let match = k.service + '&' + k.layer;
    return match === layer.getfiltersfrom  
  })[0];
  flayer == undefined ? console.log('Undefined Foreign Layer') : flayer.fields.map((field, i) => {
    let input = field.name.trim();
    let value = !field.curVal ? '' : field.curVal.trim();
    input = input == 'CSA' ? 'CSA2010' : input;
    if( field.curVal && field.curVal.length) {
      fields += (input + 'END');
      fieldsVals += (value + 'END'); 
    }
  });

  // Handle ArcGIS layers
  if (layer.host == 'arcgis') {
    // Total Number Of Records
    let totalNumberofRecords = 'https://services1.arcgis.com/' + layer.provider + 
      '/ArcGIS/rest/services/' + layer.service +
      '/FeatureServer/'+layer.layer+
      '/query?where=1%3D1&returnCountOnly=true&f=pjson';
    totalNumberofRecords = await fetchData(totalNumberofRecords).then(json => { return json.count });
    console.log('Total Number of Records ' + totalNumberofRecords)
    // Get Query for the Actual 
    let root = 'https://services1.arcgis.com/' + layer.provider + 
      '/ArcGIS/rest/services/' + layer.service +
      '/FeatureServer/'+layer.layer+
      '/query?';
    let allRecords = [];
    // This needs to be rewritten as it calls the search to many times for queried things.
    for ( let index = 0; index < totalNumberofRecords; index+=1000){
      let filterString = '';
      let queryString = root + "where=";
      if(fieldsVals != ''){
        let anyfilters = false;
        for (var i = 0; i < fields.split('END').length; i++) {
          if(fieldsVals.split('END')[i] != ''){
            anyfilters = true;
            filterString = filterString + fields.split('END')[i]+'+like%27%25'+fieldsVals.split('END')[i]+'%25%27+and+';
          }
        }
        if(anyfilters){ filterString = filterString.substring(0, filterString.length-5) }
        else{ filterString = '1=1'}
      }
      else{ filterString = '1=1' }
      queryString = queryString + filterString + '&outFields=*';
      queryString = queryString + '&outSR=4326';
      queryString = queryString + '&resultOffset=' + index;
      queryString = queryString + '&f=pgeojson';
      let temp = await fetchData(queryString).then(json => { if(json != undefined){ return json.features } return null });
      console.log('Query 1000 records : ' + queryString)
      if (temp != null){ allRecords = allRecords.concat(temp); if(temp.length<1000){index += totalNumberofRecords}}
    }
    newRecords[layer.host+'&'+layer.service+'&'+layer.layer] = allRecords;
  }

  // Handle Submit -> BNIA layer
  if (layer.host == 'bniaApi') {
    let queryString = 'https://charleskarpati.com/api?' +
      'table' + '=' + layer.layer.replace(/ /g, "%20") + '&' +
      'fields' + '=' + fields.replace(/ /g, "%20") + '&' +
      'fieldsVals' + '=' + fieldsVals.replace(/ /g, "%20") + '&' +
      'purpose' + '=' + 'display';
    console.log('Submit data : ' + queryString)
    let allRecords = await fetchData(queryString);
    if (allRecords.length == 0) { return }
    let parcel = allRecords.length == 1 ? await getParcelByBlocklot(allRecords[0].block_lot.replace(/ /g, "+")) : [];
    if(parcel.length){
      Object.assign(parcel[0].properties, allRecords[0]);
      newRecords[layer.host+'&'+layer.service+'&'+layer.layer] = parcel[0];
    }
    else {
      newRecords[layer.host+'&'+layer.service+'&'+layer.layer] = allRecords;
    }
  }
  return newRecords;
}

// Used to retrieve data for the handleSubmit function
async function getParcelByBlocklot(blocklotValue) {
  let queryString = "https://services1.arcgis.com/mVFRs7NF4iFitgbY/ArcGIS/rest/services/Parcels/FeatureServer/0/query?";
  queryString = queryString + 'where=Blocklot+%3D+%27' + blocklotValue + '%27';
  queryString = queryString + '&outFields=ADDRESS';
  queryString = queryString + '&outSR=4326';
  queryString = queryString + '&returnGeometry=true';
  queryString = queryString + '&returnCentroid=true';
  queryString = queryString + '&f=pgeojson';
  console.log('Parcel data : ' + queryString)
  return await fetchData(queryString).then(json => { return json.features; });
}


// Retrieve all available information when a user clicks on a point.
export async function showDetails( feature, state ){
  let props = feature.properties;
  // Get the clicked layer's dictionary
  let featuresDictionary = state.dictionaries.filter( dictionary => {
    let testCombination = dictionary.service.replace(/_/g, '').toLowerCase() + dictionary.layer.replace(/_/g, '').toLowerCase() + '';
    return ( props.layer.toLowerCase() == testCombination )
  } )[0];
  featuresDictionary = await queryForData( featuresDictionary, props, featuresDictionary);
  // Get the connectedDictionaries
  let connectLayers = featuresDictionary.connectlayers ? featuresDictionary.connectlayers.split(' ') : [];
  let connectedDictionaries = state.dictionaries.filter(function(dictionary) {
    let group = dictionary.group ? dictionary.group.replace(/ /g, '') : 'xyz';
    let subgroup = dictionary.subgroup ? dictionary.subgroup.replace(/ /g, '') : 'xyz';
    let layer = dictionary.layer ? dictionary.layer.replace(/ /g, '') : 'xyz';
    return (connectLayers.includes(group) || connectLayers.includes(subgroup) || connectLayers.includes(layer))
  })
  connectedDictionaries = await Promise.all( connectedDictionaries.map( dictionary => { return queryForData( dictionary, props, featuresDictionary); } ) );
  return { 
    feature : feature,
    featuresDictionary : featuresDictionary,
    featuresConnectedDictionaries : connectedDictionaries,
  }
}

// Used to retrieve data for the showDetails function
async function queryForData( dictionary, props, featuresDictionary){
  let newData = dictionary;
  // Perform a Query for clickedParcelData, append it to the dictionary
  let blocklot = props.block_lot ? props.block_lot : 'false';
  let host = dictionary.host ? dictionary.host : 'false';
  let provider = dictionary.provider ? dictionary.provider : 'false';
  let service = dictionary.service ? dictionary.service : 'false';
  let layerName = dictionary.layer ? dictionary.layer : 'false';
  let fetch = '';
  if (dictionary.host == 'bniaApi') {
    // Get to the layer
    let queryString = 'https://charleskarpati.com/api?' 
      + 'database' + '=' + provider.toString().replace(/ /g, "%20") + '&' 
      + 'table' + '=' + layerName.toString().replace(/ /g, "%20") + '&' 
      + 'fields' + '=block_lot&' 
      + 'fieldsVals' + '=' + blocklot.replace(/ /g, "%20")
      + '&' + 'purpose' + '=' + 'display';
    // perform the query
    fetch = fetchData(queryString)
    console.log('show Bnia Details : ' + queryString);
    newData.clickedParcelData = await fetch;
    return newData;
  }
  if (dictionary.host == 'arcgis') {
    // url to our layer
    let queryString = '';
    let ending = '&returnGeometry=false' + '&outFields=*' + '&f=pjson';
    let root = 'https://services1.arcgis.com/' + provider.replace(/ /g, "%20") + 
      '/ArcGIS/rest/services/' + service.replace(/ /g, "%20") +
      '/FeatureServer/'+layerName.replace(/ /g, "%20")+
      '/query?';
    if( (props.NAME) && props.NAME != ' ' ){ 
      queryString = root + "where=NAME+like%27%25"+props.NAME.replace(/ /g, "%20")+'%25%27'; 
    }
    if( (props.Name) && props.Name != ' ' ){ 
      queryString = root + "where=Name+like%27%25"+props.Name.replace(/ /g, "%20")+'%25%27'; 
    }
    else if( props.ADDRESS && props.ADDRESS != ' ' ){ 
      queryString = root + "where=ADDRESS+like%27%25"+props.ADDRESS.replace(/ /g, "%20")+'%25%27'; 
    }
    else {
      queryString = root + 'where=1=1' 
    }
    // final Query Specifications
    queryString = queryString + ending 
    console.log('Show ArcGis Details : ' + queryString);
    let fetch = await fetchData(queryString)
    newData.clickedParcelData = fetch.features;
    return newData
  }
}

// CHECK FOR BL
// IF BL EXISTS THEN DO THE SEARCH BY BLOCKLOT