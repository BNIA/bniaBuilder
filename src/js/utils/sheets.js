import {fetchData, splitObjectArrayByKey} from 'js/utils/utils';

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
    sheetData = await readSpreadsheet(sheetUrl);
    layersIndex = sheetData.title == 'layers' ? sheetNumber-1 : layersIndex;
    fieldsIndex = sheetData.title == 'fields' ? sheetNumber-1 : fieldsIndex;
    (sheetData != 'error') ? (sheetNumber++, sheetsData.push(sheetData) ) : sheetNumber = 'NaN'
  } while( typeof(sheetNumber) == 'number' &&  sheetNumber < 7 )

  // Read the Fields and Layers Sheet
  let layers = sheetsData[layersIndex]['entry'];
  let fields = Object.keys(sheetsData[fieldsIndex]['entry']).map(key=>{ return sheetsData[fieldsIndex]['entry'][key] });

  // Group the Fields by key
  // (creates an array of array of objects for array of objects)
  let groupedFields = splitObjectArrayByKey(fields, function(item) { return [item.key] });
  
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
  if( ( data.title.$t == 'configuration' ) || 
      ( data.title.$t == 'style' ) || 
      ( data.title.$t == 'theme' ) ) { returnData['entry'] = {}; }
  // Get Sheet Update Date
  returnData['updated'] = data.updated.$t;
  // Get Title  // Get Author
  for (let index in data.author){
    returnData['name'] = data.author[index].name.$t;
    returnData['email'] = data.author[index].email.$t; }
    returnData['title'] = data.title.$t;
  // Get columns. Used transposing Layer Field and Modal Sheets into objects 
  let columns = Object.keys(data.entry[0]).filter(function(k) { return k.toLowerCase().indexOf("gsx$") >= 0 }); 
  // Structured as Key : Value pairs
  // Get Rows for each Sheet
  for (let index in data.entry){
    let record = data.entry[index];
    // Handle Configuration // Style // Theme
    if( ( data.title.$t == 'configuration' ) || ( data.title.$t == 'style' ) || ( data.title.$t == 'theme' ) ) {
      // Everything is a key-value pair
      let keyVal = record['gsx$key']['$t'];
      let value = record['gsx$value']['$t'];
      returnData['entry'][keyVal] = value;
    }
    // Handle Modals
    else if( data.title.$t == 'modals' ) {  
      // Columns are Columns. Rows are Rows
      returnData['entry'][index] = {}
      columns.map(function(column) {
        let value = record[column]['$t']
        if( value == 'TRUE' ){  value = true }
        else if( value == '' ){ value = false }
        returnData['entry'][index][column.replace("gsx$", '')] = value;
      } )
    }
    // Handles Layers and Fields. Row for each canonical, a Column for each layer/field
    else if( ( data.title.$t == 'layers' ) || ( data.title.$t == 'fields' ) ) {
      // filter for gsx$
      let key = '';
      let filtered = columns.filter(function(column) {
        if( column == 'gsx$key' ){ 
          key = record[column]['$t'];
          key = key.trim().toLowerCase()
          return false 
        }
        if ( column.substring(0, 4) == 'gsx$' ){ return true }
        return false
      } );
      if( index == 0 ){
        // console.log(record);    
        filtered.map(function ( column, position ) {
          returnData['entry'][position] = {};
          let cleanString = column.replace("gsx$", '');
          cleanString = cleanString.replace(/_[0-9]+$/g, "");
          cleanString = cleanString.trim();
          returnData['entry'][position]['key'] = cleanString;
        } )
      }
      // for each remaining gsx$ insert into its object the current value at key gsx$key $t
      filtered.map(function ( column, postion ) {
        let value = record[column]['$t']
        value = value.trim();
        if( value == 'TRUE' ){  value = true }
        else if( value == '' ){ value = false }
        returnData['entry'][postion][key] = value;
      } )
    }
  }
  // Handle Modal Sheet  
  if ( data.title.$t == 'modals' ){ returnData['entry'] = readModal(returnData); }
  return returnData
}

/*
Inputs : 
Outputs : 
Description : Parse the Modals Json Object and return a usable verision of it
*/
function readModal(givenData){
  let returnObject = []; 
  Object.keys(givenData['entry']).map(function(index) {
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

export function isEmpty(strIn) {
  if (strIn === undefined) { return true; }
  else if(strIn == null) { return true; }
  else if(strIn == "") { return true; }
  else { return false; }
}