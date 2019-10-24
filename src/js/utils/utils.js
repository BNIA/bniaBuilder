import React, {Component} from 'react';


/*
Contains
-- SimpleDetails,
-- serializeFormInputs
-- fetchData
-- sortDictionaries - Sort Your Dictionaries into Groups & those Group>Subgroups
-- splitObjectArrayByKey - Sorts an array of objects into groups according to values at a key
-- downloadCsv - Reads all records from dictionary to file
-- downloadObjectAsJson - 
-- styleSheet/ convertJsonToCssFormat - create and insert a stylesheet into the dom /and then/ append the json style specification

*/

//
// COMPONENT : Display information as a Details Dropdown 
// Called from Nav and Context
//
export function SimpleDetails (summary, details) {
  return !summary ? null : (
    < details key = { summary } className='detailInnerContent'>
      < summary > { summary } < /summary >
      { details }
    < /details >
  )
};

//
// mimicks $.serialize()
//
export async function serializeFormInputs(form){  
  var field, s = [];
  var len = form.elements.length;
  for (var i=0; i<len; i++) {
    field = form.elements[i];
    if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
	  if (field.type == 'select-multiple') {
	    for (var j=form.elements[i].options.length-1; j>=0; j--) {
		  if(field.options[j].selected){ s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[j].value) }
	    }
	  } 
	  else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) { 
	    s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value); 
	  }
    }
  }
  return s.join('&').replace(/%20/g, '+');
} 

// Called from Handlers
export function clean( value ) { return !value ? '' : encodeURI(value.trim()) }

//
// All fetch requests are issued using this function. // Called from SEARCH
//
export async function fetchData(input) {
  try{
    if( input.length == 2){
      // console.log('POST', input );
      const response = await fetch( input[0], {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        body: input[1], // body data type must match "Content-Type" header
      } )
      .then( (response) => {
        if (response.ok) { return response.json() }
        else{console.log(response);}
      } )
      return response;
    }
    else{
      const response = await fetch( input ).then((response) => {
        if (response.ok) { return response.json() }
        else{console.log(response);}
      })
      return response;
    }
  }
  catch(error) { console.log('error fetching data : ', error + ', Input : '+ input);} 
}

//
// Sort Your Dictionaries into Groups & those Group>Subgroups
//
export function sortDictionaries(dictionaries) {
  let uniqueGroups = splitObjectArrayByKey(dictionaries, function(dictionary){ return [dictionary.group] });
  return uniqueGroups.map( group => { return splitObjectArrayByKey(group, function(subgroup){ return [subgroup.subgroup] } ) } );
}

//
// Sorts an array of objects into groups according to values at a key.
//
export function splitObjectArrayByKey( array , f ) { var groups = {}
  array.forEach( o => { var group = JSON.stringify( f(o) ); // Fetch the value using the function pased in
    groups[group] = groups[group] || []; //Ensure group is created
    groups[group].push( o ); // Appends item to that Groups
  } ); return Object.keys(groups).map( group => { return groups[group] } )
}


//
// Reads all records from dictionary to file
// uses convertConnectedRecordsToCsv to do the heavy lifting
//
export function downloadCsv( dictionary ){
  let csv = convertConnectedRecordsToCsv( dictionary );
  if(!csv){return null} console.log('csv', csv);
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = dictionary.alias.replace(/ /g,'')+'.csv';
  document.getElementById('downloadCsv').appendChild(hiddenElement);
  hiddenElement.click();
}
// v is Sub function of the one above it ^
export function convertConnectedRecordsToCsv( dictionary ){
  const items = dictionary.connectedRecords;
  if(!items || !items.length){return false}
  const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
  const header = Object.keys(items[0])
  let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  let headerLabels = dictionary.fields.filter(field=>header.includes(field.name)).map(field=>field.alias)
  csv.unshift(headerLabels.join(','))
  csv = csv.join('\r\n')
  return csv
}

//
// Upgrade for JSON.stringify permits arrays
// Called from App
//
export function downloadObjectAsJson(exportObj, exportName){
  (function(){
    var convArrToObj = function(array){
      var thisEleObj = new Object();
      if(typeof array == "object"){
        for(var i in array){
          var thisEle = convArrToObj(array[i]);
          thisEleObj[i] = thisEle;
        }
      }else { thisEleObj = array; }
      return thisEleObj;
    };
    var oldJSONStringify = JSON.stringify;
    JSON.stringify = function(input){
      if(oldJSONStringify(input) == '[]'){ return oldJSONStringify(convArrToObj(input)) }
      else return oldJSONStringify(input);
    };
  })();
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj))
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

//
// Create a new StyleSheet. 
// Called from MAIN
//
export var styleSheet = (function() {
	var style = document.createElement('style');
	// style.setAttribute('media', 'screen')
	// style.setAttribute('media', 'only screen and (max-width : 1024px)')
	style.appendChild(document.createTextNode(''));
	document.head.appendChild(style);
	return style.sheet;
})();
// After a styleSheet is made, 'convertJsonToCssFormat' the styleconfig and inserted into said stylesheet. 
// https://stackoverflow.com/questions/45205593/how-to-convert-a-json-style-object-to-a-css-string
export function convertJsonToCssFormat(style){
  return Object.entries(style).reduce((styleString, [propName, propValue]) => {
    return `${styleString}${propName}:${propValue};`;
  }, '')
}
