import {fetchData, groupBy, clean} from 'js/utils/utils';
import {BniaSearch} from 'js/utils/handles/bniaHandle';
import {EsriSearch} from 'js/utils/handles/esriHandle';
import {SocrataSearch} from 'js/utils/handles/socrataHandle';


//
// Get all Records matching query on keypress. Query 100
// The first entry in our object is the active field and should be searched: "select * where field like 'value%' and field[n+1] in ['%value[n+1_a]%','%value[n+1_b]%'] "
//
export async function getFieldSuggestion(event, dictionaries) {
  startWait()
  let fieldValuePairs = {};

  // Get the active Layer & Field
  let newDictionary = (typeof(dictionaries) =='undefined') ? {} : dictionaries;
  let layer = newDictionary.filter( k => { return k.key === event.target.form.dataset.key  })[0];

  // Get the CurVal from the Input and store it in our dictionary.
  let activeField = layer['fields'].find( obj => { return clean(obj.name) === event.target.dataset.field } );
  activeField['filter'] = !event.target.value ? true : clean(event.target.value);
  typeof( activeField['filter'] ) === "boolean" ? null : (fieldValuePairs[activeField.name] = activeField.filter);

  // Get the other CurVals from the other Fields.
  let otherFields = layer['fields'].filter( obj => { return obj !== activeField } );
  otherFields.map( field => { typeof(field.filter) === "boolean" ? null : (fieldValuePairs[field.name] = field.filter) } )
  
/* Get CurVals from another Layer -> (Important for Vital Signs)
  let flayer = dictionaries.filter(function(k) { k.service + '&' + k.layer === layer.getfiltersfrom })[0];
  flayer == undefined ? console.log('No Foreign Layer') : flayer.fields.map((field, i) => {
    let input = field.name.trim();
    let value = !field.curVal ? '' : field.curVal.trim();
    input = input == 'CSA' ? 'CSA2010' : input;
    if( field.curVal && field.curVal.length) {
      fields += (input + '+');
      fieldsVals += (value + '+'); } }); 
*/

  // Construct the Query using all our CurVals.
  layer['currentFormsData'] = await queryDynamicDb( layer, 'getSuggestions', fieldValuePairs )
  stopWait()
  return newDictionary
}




//
// Get all Records matching query. Query 1000
//
export async function handleSubmit(event, records, dictionaries) {
  event.preventDefault();
  startWait()

  // Get the active Layer using the head of our Form to locate the layername
  let newDictionary = (typeof(dictionaries) =='undefined') ? {} : dictionaries;
  let form = event.target.form ? event.target.form : event.target.parentElement.nextSibling;
  let layer = newDictionary.filter( k => { return k.key === form.dataset.key  })[0];
  let fieldValuePairs = {}

  // Get the other CurVals.
  layer['fields'].map( field => { typeof(field.filter) === "boolean" ? null : (fieldValuePairs[field.name] = field.filter) } )

  // Construct the Query using all our CurVals.
  layer['dataWithGeometry'] = await queryDynamicDb( layer, 'getRecords', fieldValuePairs )

  stopWait()
  return newDictionary;
}



//
// Populate the right drawer with more information about a specific record
//
export async function getDetails( event, state ){
  startWait()
  // Each record has a 'layer' attribute which points to its dictionary.
  let props = event.target.feature.properties;
  let layer = state.dictionaries.filter( dict => props.layer == (dict.service + dict.layer) )[0];

  if (layer.layer != 'basic_prop_info'){ layer['connectedRecords'] = await queryDynamicDb( layer, 'connect', props )  }

  // The records dictionary contains information on connectedDictionaries which we want to retrieve information on.
  let connectLayers = layer.connectlayers ? layer.connectlayers.split(' ') : [];
  let connectedDictionaries = state.dictionaries.filter( dictionary => {
    let group = dictionary.group ? dictionary.group.replace(/%20/g, '').replace(/\s+/g, '') : 'xyz';
    let subgroup = dictionary.subgroup ? dictionary.group.replace(/%20/g, '').replace(/\s+/g, '') : 'xyz';
    let layerName = dictionary.layer ? dictionary.group.replace(/%20/g, '').replace(/\s+/g, '') : 'xyz';
    if( (layer.layer == dictionary.layer) && (layer.host == dictionary.host)){ return false }
    return (connectLayers.includes(group) || connectLayers.includes(subgroup) || connectLayers.includes(layerName))
  } )
  let foreignLayers = []
  let foriegnLayersData = await Promise.all( connectedDictionaries.map( async newlayer => { 
    let layer = newlayer;
    layer['connectedRecords'] = await queryDynamicDb( layer, 'connect', props );
    foreignLayers.push(layer);
    return { [layer.service+layer.layer+''] : layer['connectedRecords'] } 
  }  ) );
  let forlay = {}
  foriegnLayersData.map( (arrAtindex, index) =>{
    let key = Object.keys(arrAtindex);
    forlay[key] = [arrAtindex[key] ]
  } );

  stopWait()
  return {
    clickedRecord : event.target.feature,
    clickedLayer : layer,
    foreignLayers,
  }
}








// This will do the dirtywork for getRecord since it has to be called several times.
async function queryDynamicDb( layer, method, props ){
  let obj = ''; let event = ''; let field = '';
  if (layer.host=='bniaApi'){obj=new BniaSearch(layer); }
  if (layer.host=='arcgis') {obj=new EsriSearch(layer); }
  if (layer.host=='socrata'){obj=new SocrataSearch(layer); }
  console.log(layer, method, props);
  return obj[method](props);
}



// Functions to Toggle Loading Icons
function startWait(){ 
  document.getElementsByTagName("BODY")[0].style.cursor = "wait"; 
  toggle('loader', 'block'); // Shows
}
function stopWait() { 
  document.getElementsByTagName("BODY")[0].style.cursor = "pointer";
  toggle('loader', 'none'); // hides
}
function toggle(className, displayState){
  var elements = document.getElementsByClassName(className)
  for (var i = 0; i < elements.length; i++){ elements[i].style.display = displayState; }
}




/*  
  // Handle ArcGIS layers
  if (layer.host == 'arcgis') {
    // Total Number Of Records
    let totalNumberofRecords = 'https://services1.arcgis.com/' + layer.provider + '/ArcGIS/rest/services/' + layer.service + '/FeatureServer/'+layer.layer+ '/query?where=1%3D1&returnCountOnly=true&f=pjson';
    totalNumberofRecords = await fetchData(totalNumberofRecords).then(json => { return json.count });
    console.log('Total Number of Records ' + totalNumberofRecords)
    // Get Query for the Actual
    let root = 'https://services1.arcgis.com/' + layer.provider + '/ArcGIS/rest/services/' + layer.service + '/FeatureServer/'+layer.layer+ '/query?';
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
      queryString = queryString + filterString + '&outFields=*' + '&outSR=4326' + '&resultOffset=' + index + '&f=pgeojson';
      let temp = await fetchData(queryString).then(json => { if(json != undefined){ return json.features } return null });
      console.log('Query 1000 records : ' + queryString)
      if (temp != null){ allRecords = allRecords.concat(temp); if(temp.length<1000){index += totalNumberofRecords}}
    }
    newRecords[layer.host+'&'+layer.service+'&'+layer.layer] = allRecords;
  }
*/