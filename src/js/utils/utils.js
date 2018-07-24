import React, {Component} from 'react';
//
// The following functions COULD be called from anywhere.
//

// Sort Your Dictionaries into Groups & Group>Subgroups
// Give it a set of dictionaries it sorts it as so ^
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
  //console.log('Simple Details', summary, details)
  return !summary ? null : (
    < details key = { summary } >
      < summary > { summary } < /summary >
      { details }
    < /details >
  )
};

// String Preparation
export function clean( value ) {
  return !value ? '' : value.trim().replace(/ /g, "%20")
}


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
export async function fetchData(input) {
  try{
    if( input.length == 2){
      const response = await fetch( input[0], {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        body: input[1], // body data type must match "Content-Type" header
      } )
      .then((response) => {
        if (response.ok) { return response.json() }
        else{console.log(response);}
      })
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
  catch(error) { console.log('error fetching data :', error);} 
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


// ZetCoby
// https://stackoverflow.com/questions/9600295/automatically-change-text-color-to-assure-readability
var getContrastYIQ = function (color){
            var hex   = '#';
            var r,g,b;
            if(color.indexOf(hex) > -1){
                r = parseInt(color.substr(0,2),16);
                g = parseInt(color.substr(2,2),16);
                b = parseInt(color.substr(4,2),16);
            }else{
                color = color.match(/\d+/g);
                r = color[0];
                g = color[1];
                b = color[2];
            }

            var yiq = ((r*299)+(g*587)+(b*114))/1000;
            return (yiq >= 128) ? 'black' : 'white';
        }
        
var invertColor = function (color) {
            var hex   = '#';
            if(color.indexOf(hex) > -1){
                color = color.substring(1);           
                color = parseInt(color, 16);         
                color = 0xFFFFFF ^ color;            
                color = color.toString(16);           
                color = ("000000" + color).slice(-6); 
                color = "#" + color; 
            }else{
                color = Array.prototype.join.call(arguments).match(/(-?[0-9\.]+)/g);
                for (var i = 0; i < color.length; i++) {
                    color[i] = (i === 3 ? 1 : 255) - color[i];
                }
                if(color.length === 4){
                    color = "rgba("+color[0]+","+color[1]+","+color[2]+","+color[3]+")";
                }else{
                    color = "rgb("+color[0]+","+color[1]+","+color[2]+")";
                }
            }         
            return color;
        }