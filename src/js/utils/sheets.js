import {fetchData} from 'js/utils/utils';

export async function getSheets(sheetsUrlKey){
  let sheetsUrl = 'https://spreadsheets.google.com/feeds/list/'+sheetsUrlKey+'/';
  let sheetNumber = 1;
  let sheetsData = [];
  let sheetUrl = '';
  let sheetData = [];
  if (sheetsUrlKey == 'null'){ return null }
  do {
    sheetUrl = sheetsUrl + sheetNumber + "/public/values?alt=json";
    //console.log(sheetUrl);
    sheetData = await readSpreadsheet(sheetUrl);
    //console.log(sheetData.title);
    //console.log(sheetData);
    //console.log('sheetsData ^ ');
    (sheetData != 'error') ? (sheetNumber++, sheetsData.push(sheetData) ) : sheetNumber = 'NaN'
  }
  while( typeof(sheetNumber) == 'number' &&  sheetNumber < 7 )
  // Stuff the Fields into the Layers. The index is hard codeded. This could be moved into the first sheet.
  let layers = sheetsData[4];
  let fields = Object.keys(sheetsData[5]['entry']).map(function (key) { return sheetsData[5]['entry'][key]; });
  let groupedFields = groupBy(fields, function(item) { return [item.key]; });
  //console.log('fields');
  //console.log(fields);
  //console.log('groupedFields');
  //console.log(groupedFields);
  Object.keys(layers['entry']).map(function(layer) {
    let fields = groupedFields.filter(function(group) { return group[0]['key'] == layers['entry'][layer]['key'] ? group : null });
    layers['entry'][layer]['fields'] = fields[0];
  } )
  // Delete the fields object, update layers
  sheetsData.splice(4, 2, layers);
  return sheetsData;
}

async function readSpreadsheet(url){
  // Gather Sheet Information
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

// Parse the Modals Json Object and return a usable verision of it
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

export function groupBy( array , f ) {
  var groups = {};
  array.forEach( function( o )
  {
    var group = JSON.stringify( f(o) );
    groups[group] = groups[group] || [];
    groups[group].push( o );  
  });
  return Object.keys(groups).map( function( group )
  { return groups[group]; })
}