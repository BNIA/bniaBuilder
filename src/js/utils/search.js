import {fetchData, clean, sortDictionaries, serializeFormInputs} from 'js/utils/utils';
import {BniaSearch} from 'js/utils/handles/bniaHandle';
import {EsriSearch} from 'js/utils/handles/esriHandle';
import {SocrataSearch} from 'js/utils/handles/socrataHandle';

import Nanobar from "nanobar";
const nanobar = new Nanobar( );


async function getCurVals(form){
  let vars = await serializeFormInputs(form)
  return vars
}
//
// Get all Records matching query on keypress. Query 100
// The first entry in our object is the active field and should be searched: "select * where field like 'value%' and field[n+1] in ['%value[n+1_a]%','%value[n+1_b]%'] "
//
export async function getFieldSuggestion(event, dictionaries) {
  event.preventDefault();
  startWait(nanobar)
  let form = event.target.form;
  console.log( event.target )
  let keyValuePairs = await getCurVals( form );

  let fieldValuePairs = {};
  // Get the active Layer & Field
  let newDictionary = (typeof(dictionaries) =='undefined') ? {} : dictionaries;
  let layer = newDictionary.filter( k => { return k.key === form.dataset.key  })[0];

  // Get the CurVal from the Input and store it in our dictionary.
  let activeField = layer['fields'].find( obj => { return clean(obj.name) === event.target.dataset.field } );

  activeField['filter'] = !event.target.value ? true : clean(event.target.value);
  typeof( activeField['filter'] ) === "boolean" ? null : (fieldValuePairs[activeField.name] = activeField.filter);

  // Get the other CurVals from the other Fields.
  let otherFields = layer['fields'].filter( obj => { return obj !== activeField } );
  otherFields.map( field => { typeof(field.filter) === "boolean" ? null : (fieldValuePairs[field.name] = field.filter) } )

  // Construct the Query using all our CurVals.
  nanobar.go( 70 );
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

  // Key Value Pairs Async Test
  let keyValuePairrs = await getCurVals(form);

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
  nanobar.go( 70 );
  layer['dataWithCoords'] = await queryDynamicDb( layer, 'getRecords', fieldValuePairs )
  stopWait(nanobar)
  return newDictionary;
}



//
// Populate the right drawer with more information about a specific record
//
export async function getDetails( event, state ){
  startWait(nanobar)
  let foreignLayers = []
  let prep = value => { return !value ? '' : value.trim().replace(/%20/g, '').replace(/\s+/g, '') }

  // Each record has a 'layer' attribute which points to its dictionary.
  let props = event.target.feature.properties;
  let layer = state.dictionaries.filter( dict => props.layer == dict.key )[0];

  // Get Clicked Layers Info.
  nanobar.go( 50 );
  if (layer.layer != 'basic_prop_info'){ layer['connectedRecords'] = await queryDynamicDb( layer, 'connect', props )  }

  // Get the Connected Dictionaries
  let connectedDictionaries = state.dictionaries.filter( dictionary => {
    let group = dictionary.group ? prep( dictionary.group ) : 'NA';
    let subgroup = dictionary.subgroup ?  prep( dictionary.subgroup ) : 'NA';
    let layerName = dictionary.layer ?  prep( dictionary.layer ) : 'NA';
    if( (layer.layer == dictionary.layer) && (layer.host == dictionary.host)){ return false }
    let cL = layer.connectlayers ? layer.connectlayers.split(' ') : [];
    return ( cL.includes(group) || cL.includes(subgroup) || cL.includes(layerName) )
  } )
  nanobar.go( 70 );
  // Get the Data for the Connected Dictionaries
  let foriegnLayersData = await Promise.all( connectedDictionaries.map( async flayer => { 
    flayer['connectedRecords'] = await queryDynamicDb( flayer, 'connect', props );
    foreignLayers.push(flayer);
    return { [flayer.service+flayer.layer+''] : flayer['connectedRecords'] } 
  }  ) )

  stopWait(nanobar)
  return {
    clickedRecord : event.target.feature,
    clickedLayer : layer,
    foreignLayers : sortDictionaries(foriegnLayersData),
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
  let loader = document.getElementsByClassName("loader")[0];
  loader.style.display = 'block';
  document.getElementsByTagName("BODY")[0].style.cursor = "wait !important"; 
  nanobar.go( 30 );
}
function stopWait() { 
  let loader = document.getElementsByClassName("loader")[0];
  loader.style.display = 'none';
  document.getElementsByTagName("BODY")[0].style.cursor = "pointer !important";
  nanobar.go( 100 );
}
