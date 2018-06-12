import React, { Component } from 'react';
import { fetchData } from 'js/utils/utils';
import ReactDisqusComments from 'react-disqus-comments';
import {SimpleDetails, sortDictionaries} from 'js/utils/utils';

export default class Context extends Component {
  displayName: 'Context';
  constructor(props) {
    super(props);
    this.state = { 
      heading: 0, 
      identifier : 'placeholder',
      coordinates: [0, 0],
      feature : false,
      featuresDictionary : [],
      featuresConnectedDictionaries : [],
      innerConntent : [],
    }
  }
  componentDidUpdate(prevProps, prevState){
  	console.log('componentDidUpdate');	
  	let feature = this.props.state.feature;
  	if(feature && feature !== prevProps.state.feature){
  	  let props = feature.properties;
  	  let coordinates = props.xcord ? [props.xcord, props.ycord] : feature.geometry.coordinates;
      let identifier = 'Coordinates : '+coordinates[1]+'&'+coordinates[1];
      const notEmpty = (value) => { return value && value.length > 3; }
      if( notEmpty(props.BLOCKLOT) ){ identifier = 'BlockLot : '+ props.BLOCKLOT}
      else if ( notEmpty(props.ADDRESS) ){ identifier = 'Address : '+ props.ADDRESS}
      else if( notEmpty(props.NAME) ) { identifier = 'Name : '+ props.NAME}
	  this.setState({ coordinates, identifier })
  	}
  }
  async handleNewComment(comment) {
    console.log(comment.text);
  }
  // Street View Utility
  async rotateView(rotateBy) { this.setState({ heading : this.state.heading + rotateBy }) }

  // Discussion Reload Toggle
  render() {

    const { state, stateFunctions } = this.props;
    let feature = state.feature;
    let [lng, lat] = this.state.coordinates;
    // Style
    let styleContainer = { width: '50%', margin: 'auto' }
    let styleBtn = { width: '50px', height: '50px', border: '1px solid black', margin: '5px', borderRadius: '5px' }
    // Street View
    let streetViewApiKey = "&fov=100&heading=" + this.state.heading + "&pitch=10&key=AIzaSyBwEaG4Uj2rUeM5sjHPUobnUPQz_jHuq9s";
    let streetViewApiURL = "https://maps.googleapis.com/maps/api/streetview?size=800x600&location=";
    let googleStreetViewSrc = streetViewApiURL + lat + "," + lng + streetViewApiKey;
    // Details
    let controller = '';
    let clickedDetails = '';
    let reactDiscus = '';
    let featuresDictionary = '';
    let featuresConnectedDictionaries = '';
    // Disqus
    let disqusShortname = state.configuration.disqus;
    let disqusUrl = "https://www.bniajfi.org/bold/#!"+this.state.identifier;
    let download = '';
    // Details
    if (feature) {
      let props = feature.properties;
      featuresDictionary = state.featuresDictionary;
      featuresConnectedDictionaries = state.featuresConnectedDictionaries;
      clickedDetails = ClickedDetails( featuresDictionary, props)
      
      // Details Pane
      controller = DetailsPane( featuresDictionary, sortDictionaries(featuresConnectedDictionaries), props);

      // Download Details
      download = <button onClick = { () => downloadAsCsv( featuresDictionary, featuresConnectedDictionaries ) } id='toggle_view'> Download All </button>;
    }

    // BigModal
    let modalButton = !state.configuration.showAllRecordsBtn ? '' : <button id='toggle_view' className='open_big_modal' > Show All  </button>;

    return (
      < aside id = 'context_drawer' > 
        < section id = 'right-drawer' > 
          < details open key = { 'contexDetail1' } > 
            < summary > Street View < /summary > 
            < img align = "center" style = { styleContainer } src = { googleStreetViewSrc } /> 
            < div align = "center" > 
              < button style = { styleBtn } onClick = { () => this.rotateView(-45) } > Left < /button> 
              < button style = { styleBtn } onClick = { () => this.rotateView(45) } > Right < /button> 
            < / div > 
          < /details> 
          < details open key = { 'contexDetail12' } > 
            < summary > Details < /summary > 
            { clickedDetails}
            { controller } 
            { download }
            { modalButton }
          < /details> 
          < details open key = { 'contexDetail13' } > 
            < summary > Discussion  < /summary > 
            <ReactDisqusComments
              shortname= {disqusShortname}
              identifier= {this.state.identifier}
              title= {this.state.identifier}
              url= {disqusUrl}
              onNewComment={this.handleNewComment}/>
          < /details> 
        < / section > 
      < /aside>
    )
  }
}

// COMPONENT 
const ClickedDetails = (dictionary, props) => {
  let styleText = { padding: '3px', paddingLeft: '10px', width: '90%', textAlign: 'left' }
  let alias = dictionary.alias;
  let details = dictionary.fields.map( (dictionaryField) => {
	let alias = dictionaryField.alias;
	let rightHand = dictionaryField.righthand;
	// Find fields that match
	let name = Object.keys(props).filter(word => Compare(word.toLowerCase(), dictionaryField.name.toLowerCase()) > .88)[0];
	let val = rightHand ? name : false;
	return !val ? false : ( 
		< div key = { dictionaryField.alias } style = { styleText } > 
		  < b > { dictionaryField.alias } < /b> :  
		  { props[name] }
		< /div>
	  )
  } )
  return details
}

// COMPONENT -> ConnectDetails & SimpleDetails
const DetailsPane = (featuresDictionary, availableGroups, properties) => {
  return availableGroups.map(function(group, i) {
	if (group.length == 1 && group[0].length == 1) { return ConnectDetails(featuresDictionary, group[0][0], properties); }
	let detailContent = group.map(function(subgroup, i) {
	  if (subgroup[0]['subgroup'] == false) {
		let subGroupItems = subgroup.map(function(dict, i) { return ConnectDetails(featuresDictionary, dict, properties); } )
		return subGroupItems
	  }
	  let subgroupContent = subgroup.map(function(dict, i) { return ConnectDetails(featuresDictionary, dict, properties); } )
	  return subgroupContent;
	});
	return detailContent;
  } );
}

// Display all the connected details from a connected dictionary
const ConnectDetails = (clickedDictionary, dictionary, props) => {
  let styleText = { padding: '3px', paddingLeft: '10px', width: '90%', textAlign: 'left' }
  let alias = dictionary.alias;
  let rightHand = dictionary.returnparcel;
  let detail = false;
  let pData = dictionary.clickedParcelData;
  // If the dictionary has parcel data.
  if(pData && pData.length){
  	// Sort Descending by 'YEAR'
  	if(pData.length > 1){ pData.sort(function(a, b) { return b.Year - a.Year; }); }
  	// Take the first value (most recent year);
  	pData = pData[0]
    detail = Object.keys(pData).map( (key) => {
      // Fallback value if we have an error.
      let alias = key;
      // This is one columns values in the record of information
      let parcelData = pData[key];
	  // Find the Field Alias from our dictionary matching the Key of our new inbound data.
	  let name = dictionary.fields.filter(field => {
	  	return field.name.trim() == key.trim()
	  } )
	  // USE THE ALIAS FOR THE FIELDS THAT MATCH
	  if(name.length){ alias = name[0].alias; }

	  // Only show fields we want to show
	  let val = rightHand ? true : false;

	  return !val ? false : ( 
		< div key = { alias } style = { styleText } > 
		  < b > { alias } < /b> : { parcelData }
		< /div>
	  )
    } )
    return (
      <details key={alias}> 
        <summary> {alias} </summary>
       {detail}
     </details>
   )
  }
  return false
};




// JSON -> CSV CONVERTER
function convertObject( dictionary ){
  const items = dictionary.clickedParcelData;
  console.log(items);
  if(!items.length){return ''}
  const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
  const header = Object.keys(items[0])
  let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  csv.unshift(header.join(','))
  csv = csv.join('\r\n')
  return csv
}

	// CSV DOWNLOAD
function downloadAsCsv( dictionary, connectedDictionaries ){
  let clickedLayer = convertObject( dictionary );
  if ( connectedDictionaries != undefined ){
	let connectedLayers = connectedDictionaries.map( dictionary => {
	  clickedLayer += convertObject( dictionary )
	})
  }
  var pom = document.createElement('a');
  var csvContent=clickedLayer; //here we load our csv data 
  var blob = new Blob([csvContent],{type: 'text/csv;charset=utf-8;'});
  var url = URL.createObjectURL(blob);
  pom.href = url; pom.setAttribute('download', 'bold.csv'); pom.click();
}

const e = React.createElement;
function Compare(strA, strB) {
  strA = strA.toLowerCase().trim();
  strB = strB.toLowerCase().trim();
  for (var result = 0, i = strA.length; i--;) {
    if (typeof strB[i] == 'undefined' || strA[i] == strB[i]) { false } 
    else if (strA[i].toLowerCase() == strB[i].toLowerCase()) { result++; } 
    else { result += 4; }
  }
  let value = 1 - (result + 4 * Math.abs(strA.length - strB.length)) / (2 * (strA.length + strB.length));
  return value
}