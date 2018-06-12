import React, {Component} from 'react';
//
// The following functions COULD be called from anywhere.
//

// Sort Your Dictionaries into Groups & Group>Subgroups
export function sortDictionaries(dictionaries) {
  let uniqueGroups = sortByValue( dictionaries, 'group')
  return uniqueGroups.map( group => {
    return sortByValue( group, 'subgroup')
  } );
}
function sortByValue( dictionaries, key ){
  // Get Unique Key Values.
  let uniqueGroupNames = [...new Set( dictionaries.map( dictionary => dictionary[key] )  )];
  // If a dictionary matches the key then append it to that group.
  return uniqueGroupNames.map(uniqueGroupName => 
    dictionaries.filter(function(dictionary){ if( dictionary[key] == uniqueGroupName ){ return true } } ) 
  )
}
// COMPONENT : Display information as a Details Dropdown
export function SimpleDetails (summary, details) {
  return ( 
    < details key = { summary } > 
      < summary > { summary } < /summary > 
      { details }
    < /details >
  )
};

// Optimized timed loop for rendering stylesheets. // Called from MAIN
export function loadCSS (url) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.type = 'text/css';
  stylesheet.href = url;
  requestAnimationFrame(() => {
    document.getElementsByTagName('head')[0].prepend(stylesheet);
  });
}

// All fetch requests are issued using this function. // Called from SEARCH
export async function fetchData(url) {
  try{
    const response = await fetch( url )
    .then((response) => { 
      if (response.ok) { return response.json() }
      else{console.log(response);}
    })
    return response;
  }
  catch(error) { console.log('error fetching data : '); console.log(error);}
}

// Upgrade for JSON.stringify permits arrays // Called from Context
export function downloadObjectAsJson(exportObj, exportName){(function(){
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
    if(oldJSONStringify(input) == '[]'){ return oldJSONStringify(convArrToObj(input)); }
    else return oldJSONStringify(input);
  };
})();
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Code Fragments.

// Just for referencing.
function default_config() {
  return {
    "modals":[  ],
    "speach":false,
    "map":false,
    "dataTable":false,
    "styleUrl": false,
    "style":{  },
    "theme":{  },
    "dictionaries":[  ],
    "records":{  },
    "logo":"",
    "shortName":"",
    "longName":"",
    "navigationLabel":"",
    "updateLayer": false,
    "clickedField": false,
    "feature" : false,
    "featuresDictionary" : false,
    "featuresConnectedDictionaries" : false
  }
}
// No longer needed.
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {  c = c.substring(1); }
    if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
  }
  return "";
}