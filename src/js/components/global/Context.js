import React, { Component } from 'react';
import { fetchData } from 'js/utils/utils';
import ReactDisqusComments from 'react-disqus-comments';
import {SimpleDetails, downloadCsv} from 'js/utils/utils';

export default class Context extends Component {
  displayName: 'Context';
  constructor(props) {
    super(props);
    this.state = { 
      heading: 0, 
      identifier : 'placeholder',
      coordinates: [0, 0],
    }
  }
  componentDidUpdate(prevProps, prevState){	
  	let details = this.props.state.details;
  	if(details && details !== prevProps.state.details){
  	  let feature = details.clickedRecord
  	  let props = feature.properties;
	  let coords = '';
	  let flag = false;
	  if(feature.geometry.coordinates.length == 2){ flag=true; coords = feature.geometry.coordinates; }
	  else{ coords = feature.geometry.coordinates[0]; }
  	  let coordinates = coords[0] && coords[0].length ? [ coords[0][0], coords[0][1] ] : coords;
  	  coordinates = flag ? [ coords[0] , coords[1] ] : coordinates;
      let identifier = 'Coordinates : '+coordinates[1]+'&'+coordinates[1];
      const notEmpty = (value) => { return value && value.length > 3; }
      if( notEmpty(props.BL) ){ identifier = 'BlockLot : '+ props.BL}
      if( notEmpty(props.BLOCKLOT) ){ identifier = 'BlockLot : '+ props.BLOCKLOT}
      else if ( notEmpty(props.ADDRESS) ){ identifier = 'Address : '+ props.ADDRESS}
      else if( notEmpty(props.NAME) ) { identifier = 'Name : '+ props.NAME}
	  this.setState({ coordinates, identifier })
  	}
  }
  // Discuss Comment Alert
  async handleNewComment(comment) {
    console.log(comment.text);
  }
  // Street View Utility
  async rotateView(rotateBy) { this.setState({ heading : this.state.heading + rotateBy }) }

  // Discussion Reload Toggle
  render() {
    const { state, stateFunctions } = this.props;
    let details = state.details;
    let [lng, lat] = this.state.coordinates;
    // Street View
    let styleContainer = { width: '50%', margin: 'auto' }
    let styleBtn = { width: '50px', height: '50px', border: '1px solid black', margin: '5px', borderRadius: '5px' }
    let streetViewApiKey = "&fov=100&heading=" + this.state.heading + "&pitch=10&key=AIzaSyBwEaG4Uj2rUeM5sjHPUobnUPQz_jHuq9s";
    let streetViewApiURL = "https://maps.googleapis.com/maps/api/streetview?size=800x600&location=";
    let googleStreetViewSrc = streetViewApiURL + lat + "," + lng + streetViewApiKey;
    let linkToGMaps = 'http://www.google.com/maps/place/'+lat+','+lng;
    let linkToGSV = 'http://maps.google.com/maps?q=&layer=c&cbll='+lat+','+lng;
    
    // Details
    let controller = ''; // html
    let clickedDetails = ''; // html
    let reactDiscus = ''; //html
    // Disqus
    let disqusShortname = state.configuration.disqus;
    let disqusUrl = "https://www.bniajfi.org/bold/#!"+this.state.identifier;
    let download = ''; //html
	let givenName = 'Rotate View';
	let modalButton = '';

    if (details) {
	  // BigModal button
	  if(state.configuration.showAllRecordsBtn){ 
	    modalButton = <button className='toggle_view open_big_modal' > Show All </button> 
	  }

      // GSV address label
	  let clickedRecord = details.clickedRecord.properties;
	  if( (clickedRecord.name)  && clickedRecord.name    != ' ' ){ givenName = clickedRecord.name }
	  if( (clickedRecord.Name)  && clickedRecord.Name    != ' ' ){ givenName = clickedRecord.Name }
	  if( (clickedRecord.NAME)  && clickedRecord.NAME    != ' ' ){ givenName = clickedRecord.NAME }
	  if( clickedRecord.address && clickedRecord.address != ' ' ){ givenName = clickedRecord.address }
	  if( clickedRecord.ADDRESS && clickedRecord.ADDRESS != ' ' ){ givenName = clickedRecord.ADDRESS }

      // Construct the Clicked Detials & Details Pane
      clickedDetails = ClickedDetails( details )
      controller = DetailsPane( state );
      // Download Details
      download = <button onClick = { () => downloadCsvs( state ) } className='downloadall'> Download All </button>;

    }
    return (
      < aside id = 'context_drawer' > 
        < section id = 'right-drawer' > 
          < details open key = { 'contexDetail1' } > 
            < summary > Street View < /summary >
            <a href={linkToGMaps} style={{color:'blue',textDecoration:"underline"}} target="_blank" rel="noopener noreferrer" >Maps</a>
            <br/>
            <a href={linkToGSV} style={{color:'blue',textDecoration:"underline"}} target="_blank" rel="noopener noreferrer" >StreetView</a>
            <br/>
            < img alt="Google Street View Image"  align = "center" style = { styleContainer } src = { googleStreetViewSrc } /> 
            < div align = "center" > 
              <p key={'givenName'}>{givenName}</p>
              < button style = { styleBtn } onClick = { () => this.rotateView(-45) } > Left < /button> 
              < button style = { styleBtn } onClick = { () => this.rotateView(45) } > Right < /button> 
            < / div > 
          < /details>
          < details open key = { 'contexDetail12' } > 
            < summary > Details < /summary > 
            <p> First Record will be shown </p>
            { clickedDetails}
            { controller } 
            { modalButton }{ download }
            <div id="downloadCsv" ></div>
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

// COMPONENT -> Get all clicked details
const ClickedDetails = (details) => {
  let clickedRecord = details.clickedRecord.properties;
  let dictionary = details.clickedLayer;
  let styleText = { padding: '3px', paddingLeft: '10px', width: '90%', textAlign: 'left' }
  let alias = dictionary.alias;

  details = dictionary.fields.map( (field, index) => {
	let alias = field.alias;
	let rightHand = field.righthand;
	// Find fields that match
	let name = Object.keys(clickedRecord).filter(word => Compare(word.toLowerCase(), field.name.toLowerCase()) > .88)[0];
	let val = rightHand ? name : false;
	// Display the field Value pair
	return !val ? false : ( 
		< div key = { index } style = { styleText } > 
		  < b > { field.alias } < /b> :  
		  { clickedRecord[name] }
		< /div>
	  )
  } )
  dictionary.showrecordtitleinpopup ? details.unshift(<h3 key={'detailsHeader'}>{alias}</h3>) : null;
  return details
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
  return 1 - (result + 4 * Math.abs(strA.length - strB.length)) / (2 * (strA.length + strB.length));
}




// COMPONENT -> ConnectDetails & SimpleDetails
const DetailsPane = ( state ) => {
  
  // Map through the all the groups
  let details = state.details
  let groups = details.foreignLayers
  let returnThis = groups.map( group => {

  	// Display alone if foreignLayer & subgroup length = 1
	// if (group.length == 1 && group[0].length == 1){ return ConnectDetails(details, group[0][0]) }

	// otherwise map through the entries in the group, typically layers but may contain subgroups
	return group.map( subgroup => { 
	  return subgroup.map( layerDetials => { 
	    let dictionary = state.dictionaries.filter( k => { return k.service+k.layer+'' === Object.keys(layerDetials)[0]  })[0];
	    return ConnectDetails(layerDetials, dictionary);
	  } ) 
	} )
  } );
  return returnThis
}

// Display all the connected details from a connected dictionary
const ConnectDetails = (details, dict) => {
  // dict = the connected layer to display 
  // pData = connecrd records 
  let styleText = { padding: '3px', paddingLeft: '10px', width: '90%', textAlign: 'left' }
  let alias = dict.alias;
  let detail = false;
  let pData = dict.connectedRecords;
  // If the connecteddictionary has parcel data.
  if(pData && pData.length){
  	// Sort Descending by 'YEAR' 
  	if(pData.length > 1){ pData.sort( (a, b) => { return b.Year - a.Year; }); }
  	pData = pData[0];
    detail = Object.keys(pData).map( (key, index) => {
	  // Find the Field Alias from our dictionary matching the Key of our new inbound data.
	  let field = dict.fields.filter(field => { return field.name.trim() == key.trim() } )
	  // Render only IFF a matching field from our dictionary
      let alias = field.length ? field[0].alias : false
      // Render only IFF that field tells us to
      alias = !alias ? alias : field[0].righthand ? alias : false;
	  return !alias ? false : ( 
		< div key = { index } style = { styleText } >  
		  < b > { alias } < /b> : { pData[key] } 
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

// DOWNLOAD CSVs - calls downloadCsv
function downloadCsvs( state ){
  let details = state.details;
  downloadCsv( details.clickedLayer )

  let groups = details.foreignLayers;
  let returnThis = groups.map( group => {
	return group.map( subgroup => { 
	  return subgroup.map( layerDetials => { 
	    let layer = state.dictionaries.filter( k => { return k.service+k.layer+'' === Object.keys(layerDetials)[0]  })[0];
	    console.log(layer);
	    downloadCsv( layer) 
	  } ) 
	} )
  } )
}