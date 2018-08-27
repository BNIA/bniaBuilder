import {fetchData, groupBy, clean} from 'js/utils/utils';
import {BniaSearch} from 'js/utils/handles/bniaHandle';
import {EsriSearch} from 'js/utils/handles/esriHandle';
import {SocrataSearch} from 'js/utils/handles/socrataHandle';
import Nanobar from "nanobar";
const nanobar = new Nanobar( );
//
// Get all Records matching query on keypress. Query 100
// The first entry in our object is the active field and should be searched: "select * where field like 'value%' and field[n+1] in ['%value[n+1_a]%','%value[n+1_b]%'] "
//
export async function getFieldSuggestion(event, dictionaries) {
  startWait(nanobar)
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

  // Construct the Query using all our CurVals.
  layer['currentFormsData'] = await queryDynamicDb( layer, 'getSuggestions', fieldValuePairs )
  stopWait(nanobar)
  return newDictionary
}




//
// Get all Records matching query.
//
export async function handleSubmit(event, records, dictionaries) {
  event.preventDefault();
  startWait(nanobar)

  // Get the active Layer using the head of our Form to locate the layername
  let newDictionary = (typeof(dictionaries) =='undefined') ? {} : dictionaries;
  let form = event.target.form ? event.target.form : event.target.parentElement.nextSibling;
  let layer = newDictionary.filter( k => { return k.key === form.dataset.key  })[0];
  let fieldValuePairs = {}

  // Get the CurVals obtained from getFieldSuggestion.
  layer['fields'].map( field => { 
    typeof(field.filter) == "boolean" ? null : (fieldValuePairs[field.name] = field.filter) 
  } )

  /* Get CurVals from another Layer */
  let flayer = dictionaries.filter( fL => fL.key == layer.getfiltersfrom )[0];
  flayer == undefined ? null : flayer.fields.map((f, i) => {
    let name = f.name;
    let value = f.filter;
    name = name == 'CSA' ? 'CSA2010' : name;
    if( value && !typeof(value) == 'boolean' ) { fieldValuePairs[name] = value } 
  });

  // Construct the Query using all our CurVals.
  layer['dataWithCoords'] = await queryDynamicDb( layer, 'getRecords', fieldValuePairs )
  
  stopWait(nanobar)
  return newDictionary;
}



//
// Populate the right drawer with more information about a specific record
//
export async function getDetails( event, state ){
  startWait(nanobar)
  // Each record has a 'layer' attribute which points to its dictionary.
  let props = event.target.feature.properties;
  let layer = state.dictionaries.filter( dict => props.layer == dict.key )[0];
  if (layer.layer != 'basic_prop_info'){ 
    layer['connectedRecords'] = await queryDynamicDb( layer, 'connect', props )  
  }

  // The records dictionary contains information on connectedDictionaries which we want to retrieve information on.
  let connectLayers = layer.connectlayers ? layer.connectlayers.split(' ') : [];
  let connectedDictionaries = state.dictionaries.filter( dictionary => {
    let group = dictionary.group ? dictionary.group.replace(/%20/g, '').replace(/\s+/g, '') : 'xyz';
    let subgroup = dictionary.subgroup ? dictionary.subgroup.replace(/%20/g, '').replace(/\s+/g, '') : 'xyz';
    let layerName = dictionary.layer ? dictionary.layer.replace(/%20/g, '').replace(/\s+/g, '') : 'xyz';
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

  stopWait(nanobar)
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
  console.log(method, props);
  return obj[method](props);
}



// Functions to Toggle Loading Icons
function startWait(){ 
  document.getElementsByTagName("BODY")[0].style.cursor = "wait !important"; 
  nanobar.go( 30 );
}
function stopWait() { 
  document.getElementsByTagName("BODY")[0].style.cursor = "pointer";
  nanobar.go( 100 );
}
