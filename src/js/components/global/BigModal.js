import React, { Component } from 'react';
const e = React.createElement;
import {SimpleDetails, sortDictionaries} from 'js/utils/utils';
import ReactTable from "react-table";

export default class BigModal extends Component {
  displayName: 'Modal';
  constructor(props) {
    super(props);
    this.state = { 
      heading: 0, 
      identifier : 'placeholder',
      coordinates: [0, 0],
    }
  }
  // Add Modal Event Listeners after the component mounts
  componentDidMount(){ addModalListeners() }
  // Street View Utility
  async rotateView(rotateBy) { this.setState({ heading : this.state.heading + rotateBy }) }

  render() {
    const { state } = this.props;
    let details = state.details;
    let feature = details.clickedRecord;
    let props = feature.properties;
    let coords = '';
    if(feature.geometry.coordinates.length == 2){ coords = feature.geometry.coordinates }
    else{ coords = feature.geometry.coordinates[0]	}
    let coordinates = coords[0] && coords[0].length ? [ coords[0][0], coords[0][1] ] : coords;
    let [lng, lat] = coordinates;
    // Street View
    let styleContainer = { width: '50%', margin: 'auto', align : 'center' }
    let styleBtn = { width: '50px', height: '50px', border: '1px solid black', margin: '5px', borderRadius: '5px' }
    let streetViewApiKey = "&fov=100&heading=" + this.state.heading + "&pitch=10&key=AIzaSyBwEaG4Uj2rUeM5sjHPUobnUPQz_jHuq9s";
    let streetViewApiURL = "https://maps.googleapis.com/maps/api/streetview?size=800x600&location=";
    let googleStreetViewSrc = streetViewApiURL + lat + "," + lng + streetViewApiKey;
    let linkToGMaps = 'http://www.google.com/maps/place/'+lat+','+lng;
    let linkToGSV = 'http://maps.google.com/maps?q=&layer=c&cbll='+lat+','+lng;
	let givenName = 'Rotate View';
    // Details
    let controller = '';
    let clickedDetails = '';
    if (details) {
      // GSV address label
	  if( (props.name)  && props.name    != ' ' ){ givenName = props.name }
	  if( (props.Name)  && props.Name    != ' ' ){ givenName = props.Name }
	  if( (props.NAME)  && props.NAME    != ' ' ){ givenName = props.NAME }
	  if( props.address && props.address != ' ' ){ givenName = props.address }
	  if( props.ADDRESS && props.ADDRESS != ' ' ){ givenName = props.ADDRESS }

      // Construct the Clicked Detials
      clickedDetails = ClickedDetails( details )

      // sort (group/subgroup nesting) for foreign layers.
      let sortedForiegnLayers = sortDictionaries(details.foreignLayers)
      controller = DetailsPane( details, sortedForiegnLayers );
    }
    
    let style = {display:'none'}
    return ( 
      < div className = "modal_big_wrapper" style={style}>
		< section className='modal_big_content'>
          < details open> 
            < summary > STREET VIEW < /summary >
            <a href={linkToGMaps} style={{color:'blue',textDecoration:"underline"}} target="_blank" rel="noopener noreferrer" >Maps</a>
            <br/>
            <a href={linkToGSV} style={{color:'blue',textDecoration:"underline"}} target="_blank" rel="noopener noreferrer" >StreetView</a>
            <br/>
            < img alt="Google Street View Image" style = { styleContainer } src = { googleStreetViewSrc } /> 
            < div align = "center" > 
              <p key={'givenName'}>{givenName}</p>
              < button style = { styleBtn } onClick = { () => this.rotateView(-45) } > Left < /button> 
              < button style = { styleBtn } onClick = { () => this.rotateView(45) } > Right < /button> 
            < / div > 
          < /details> 
          < details open> 
            < summary > DETAILS < /summary > 
            { clickedDetails }
            { controller }
          < /details> 
		  < button className = "toggle_view close_big_modal" tabIndex = "0" > OK < /button> 
		< / section >
      < /div >
    );
  }
}

// CloseModalBtn
//toggleview -> TableBtn, MapBtn
//openbigmodal -> OpenBigModal

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


//
//
// COMPONENT 
const ClickedDetails = (details) => {
  let styleText = { padding: '3px', paddingLeft: '10px', width: '90%', textAlign: 'left' }
  let styleConnectedArticle = { margin : '2px', padding:'4px', border : 'thick solid #ccc' }
  let alias = details.clickedLayer.alias;
  let pData = details.clickedLayer.connectedRecords;
  if (pData == undefined ){ return ''}
  let returnThis = []
  // Sort Descending by 'YEAR'
  if(pData && pData.length > 1){ pData.sort( (a, b) => { return b.Year - a.Year; }); }
  let styleClickedArticle = { margin : '2px', padding:'4px', border : 'thick solid #ccc' }  
  // If the dictionary has only one connected record
  if(pData && pData.length == 1){
  	let record = pData[0];
    let detail = Object.keys(record).map( (key, index) => {
	  // Find the Field Alias from our dictionary matching the Key of our new inbound data.
	  let field = details.clickedLayer.fields.filter(field => { return field.name.trim() == key.trim() } )
	  // Render only IFF a matching field from our dictionary
	  let alias = field.length ? field[0].alias : false
	  // Render only IFF that field tells us to
	  alias = !alias ? alias : field[0].righthand ? alias : false;
	  return !alias ? false : ( 
	    < div key = {index} style = { styleText } >  
		  < b > { alias } < /b> : { record[key] } 
	    < /div>
	  )
    } );
    detail = <article key='bigmodaltitle' style={styleConnectedArticle} > { detail } </article>
    returnThis.unshift(detail)
  }
  // If the dictionary has more than one record.
  else if(pData && pData.length > 1){
    // Sort Descending by 'YEAR'
  	if(pData.length > 1){ pData.sort( (a, b) => { return b.Year - a.Year; }); }
    // if field.righthand assign property attributes into a new object.
    let revealthese = details.clickedLayer.fields.filter(field => field.righthand == true).map(field => ({ Header: field.alias, accessor: field.name }))
    returnThis.push( <ReactTable key={'reactTable'} data={ pData } columns={ revealthese } defaultPageSize={5} className="-striped -highlight" /> )
  }
  
  returnThis.unshift(<h2 key={'detailsHeader'}>{alias}</h2>)
  return returnThis
};










//
// COMPONENT -> ConnectDetails & SimpleDetails
const DetailsPane = ( details, sortedForiegnLayers ) => {
  return sortedForiegnLayers.map(function(group, i) {
	if (group.length == 1 && group[0].length == 1) { return ConnectDetails(details, group[0][0]); }
	let detailContent = group.map(function(subgroup, i) {
	  if (subgroup[0]['subgroup'] == false) {
		let subGroupItems = subgroup.map(function(dict, i) { return ConnectDetails(details, dict); } )
		return subGroupItems
	  }
	  let subgroupContent = subgroup.map(function(dict, i) { return ConnectDetails(details, dict); } )
	  return subgroupContent;
	} );
	return detailContent;
  } );
}

//
//
// Display all the connected details from a connected dictionary
//
const ConnectDetails = (details, dict) => {
  let styleText = { padding: '3px', paddingLeft: '10px', width: '90%', textAlign: 'left' }
  let styleConnectedArticle = { margin : '2px', padding:'4px', border : 'thick solid #ccc' }
  let alias = dict.alias;
  let pData = dict.connectedRecords;
  // If the dictionary has only one connected record
  if(pData && pData.length == 1){
  	let record = pData[0];
    let detail = Object.keys(record).map( (key, index) => {
	  // Find the Field Alias from our dictionary matching the Key of our new inbound data.
	  let field = dict.fields.filter(field => { return field.name.trim() == key.trim() } )
	  // Render only IFF a matching field from our dictionary
	  let alias = field.length ? field[0].alias : false
	  // Render only IFF that field tells us to
	  alias = !alias ? alias : field[0].righthand ? alias : false;
	  return !alias ? false : ( 
	    < div key = { index } style = { styleText } >  
		  < b > { alias } < /b> : { record[key] } 
	    < /div>
	  )
    } );
    return (
     <details key={'bigmodal'+alias} open> 
       <summary> {alias} </summary>
       <article style={styleConnectedArticle} > { detail } </article>
     </details>
    )
  }
  // If the dictionary has parcel data.
  else if(pData && pData.length > 1){
    // Sort Descending by 'YEAR'
  	if(pData.length > 1){ pData.sort(function(a, b) { return b.Year - a.Year; }); }
    // if field.righthand assign property attributes into a new object.
    let revealthese = dict.fields.filter(field => field.righthand == true).map(field => ({ Header: field.alias, accessor: field.name }))
    return (
      <details key={'bigmodal'+alias} open> 
        <summary> {alias} </summary>
	    <ReactTable 
	      data={ pData }
	      columns={ revealthese }
	      defaultPageSize={5}
	      showPageSizeOptions = {false}
	      className="-striped -highlight"
	    /> 
      </details>
    )
  }
  return false
};