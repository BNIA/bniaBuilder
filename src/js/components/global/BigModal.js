import React, { Component } from 'react';
const e = React.createElement;
import ReactDisqus from 'react-disqus';
import {SimpleDetails, sortDictionaries} from 'js/utils/utils';

export default class BigModal extends Component {
  displayName: 'Modal';
  constructor(props) {
    super(props);
    this.state = { 
      heading: 0,
      coordinates: [0, 0],
    }
  }

  // Add Modal Event Listeners after the component mounts
  componentDidMount() { addModalListeners() }

  componentDidUpdate(prevProps, prevState){
  	let feature = this.props.state.feature;
  	if(feature && feature !== prevProps.state.feature){
  	  let coords = [feature.properties.xcord, feature.properties.ycord];
  	  this.setState({ coordinates: coords, firstTimeFiring : false })
  	}
  }

  // Street View Utility
  async rotateView(rotateBy) { this.setState({ heading : this.state.heading + rotateBy }) }

  render() {
    const { state } = this.props;
    if(!state.records){ return null}
  	console.log('loadingbigmodal');
    // Style
    let styleBtn = { width: '50px', height: '50px', border: '1px solid black', margin: '5px', borderRadius: '5px' }
    // Details
    let controller = '';
    let clickedDetails = '';
    let reactDiscus = '';
    let featuresDictionary = '';
    let featuresConnectedDictionaries = '';
    let shortname = 'bold-1';
    let feature = state.feature;
    let googleStreetViewSrc = '';
    let streetViewApiKey = '';
    let streetViwApiKey = '';
    let [lng, lat] = this.state.coordinates;
    if (feature) {
      // Street View
      let streetViewApiKey = "&fov=100&heading=" + this.state.heading + "&pitch=10&key=AIzaSyBwEaG4Uj2rUeM5sjHPUobnUPQz_jHuq9s";
      let streetViewApiURL = "https://maps.googleapis.com/maps/api/streetview?size=800x600&location=";
      googleStreetViewSrc = streetViewApiURL + lat + "," + lng + streetViewApiKey;

      // Data
      featuresDictionary = state.featuresDictionary;
      featuresConnectedDictionaries = state.featuresConnectedDictionaries;
      clickedDetails = ClickedDetails( featuresDictionary, feature.properties)

      // Map the groups, subgroups and layers into corresponding 'Details' panes
      controller = DetailsPane( featuresDictionary, sortDictionaries(featuresConnectedDictionaries), feature.properties);
      reactDiscus = < ReactDisqus shortname = { shortname }
      />;
    }
    
    let style = {display:'none'}
    return ( 
      < div className = "modal_big_wrapper" style={style}>
		< section className='modal_big_content'>
          < details open > 
            < summary > Street View < /summary > 
            < img align = "center" src = { googleStreetViewSrc } /> 
            < div align = "center" > 
              < button style = { styleBtn } onClick = { () => this.rotateView(-45) } > Left < /button> 
              < button style = { styleBtn } onClick = { () => this.rotateView(45) } > Right < /button> 
            < / div > 
          < /details> 
          < details open> 
            < summary > Details < /summary > 
            { clickedDetails} 
            { controller }
          < /details> 
          < details open> 
            < summary > Discussion  < /summary > 
            {reactDiscus}
          < /details>
		  < button  id='toggle_view' className = "close_big_modal" tabIndex = "0" > OK < /button> 
		< / section >
      < /div >
    );
  }
}

// Onclick Event Listener to remove AND open the Modal
function addModalListeners(){
  window.addEventListener('click', function(event) {
  	// Close Button was clicked
    if (event.target.classList.contains('close_big_modal')) { 
      document.getElementsByClassName('modal_big_wrapper')[0].style.display = "none" 
    }
    // The Outside of the modal was clicked
    if (event.target.classList.contains('modal_big_wrapper')) { 
      event.target.style.display = "none"; 
    }

    // The Show All Button was clicked.
    if (event.target.classList.contains('open_big_modal')) { 
      document.getElementsByClassName('modal_big_wrapper')[0].style.display = "block"
    }

  });
}





// COMPONENT 
const ClickedDetails = (dictionary, props) => {
  console.log('clickedDetails dictionary and props');
  console.log(dictionary, props);
  let styleText = { padding: '3px', paddingLeft: '10px', width: '90%', textAlign: 'left' }
  let alias = dictionary.alias;
  
  let rightHand = dictionary.returnparcel;

  let pData = dictionary.clickedParcelData;
  // Sort Descending by 'YEAR'
  if(pData.length > 1){ pData.sort(function(a, b) { return b.Year - a.Year; }); }
  let styleClickedArticle = { margin : '2px', padding:'4px', border : 'thick solid #ccc' }  
  // Loop through all our records
  let stackOfRecords = pData.map( (record, i) => {
  	// Use only the first record for now if there exists more.
  	console.log(record);
  	record = record['attributes'] ? record['attributes'] : record;
  	console.log(record);
  	// For each field
    let detail = Object.keys(record, i ).map( (key, i) => {
    	console.log(key);
      // Fallback value if we have an error.
      let alias = key;
      // This is one columns values in the record of information
      let parcelData = record[key];
	  // Find the Field Alias from our dictionary matching the Key of our new inbound data.
	  let name = dictionary.fields.filter(field => {
	  	return field.name.trim() == key.trim()
	  } )
	  // USE THE ALIAS FOR THE FIELDS THAT MATCH
	  if(name.length){ alias = name[0].alias; }

	  // Only show fields we want to show
	  let val = rightHand ? true : false;
	  return !val ? false : ( 
		< div key = { i } style = { styleText } > 
		  < b > { alias } < /b> : { parcelData }
		< /div>
	  )
    } );
    return <article key={ i } style={styleClickedArticle} > { detail } </article>
  } )
  return <div > {stackOfRecords} </div>
};

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
  let styleConnectedArticle = { margin : '2px', padding:'4px', border : 'thick solid #ccc' }
  let alias = dictionary.alias;
  let rightHand = dictionary.returnparcel;
  let detailedInfo = false;
  let pData = dictionary.clickedParcelData;
  // If the dictionary has parcel data.
  if(pData && pData.length){
  	// Sort Descending by 'YEAR'
  	if(pData.length > 1){ pData.sort(function(a, b) { return b.Year - a.Year; }); }
  	// Loop through all our records
  	let i = 0;
    detailedInfo = pData.map( ( parcelRecord , i) => {
      // Loop through all the record properties
      let record = Object.keys(parcelRecord).map( (key, i) => {
      	let fieldVal = parcelRecord[key];
      
		// Find the Field Alias from our dictionary matching the Key of our new inbound data.
	    let name = dictionary.fields.filter(dictField => {
		  return dictField.name.trim() == key.trim()
		} )
		// USE THE ALIAS FOR THE FIELDS THAT MATCH
		if(name.length){ 
		  alias = name[0].alias; 
		}
		// Only show fields we want to show
		let val = rightHand ? true : false;

		return !val ? false : ( 
		  < div key = { i } style = { styleText } > 
			< b > { alias } < /b> : {fieldVal}	
	      < /div>
		)
      } )
      return <article key={ i } style={styleConnectedArticle} > { record } </article>
    } );
    return (
      <details key={i}> 
        <summary> {alias} </summary>
       {detailedInfo}
     </details>
    )
  }
  return false
};