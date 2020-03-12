import React, {Component} from 'react';
import Select from 'react-select'
import CreatableSelect from 'react-select/lib/Creatable';
import Choices from 'choices.js';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const e = React.createElement;
import Details from 'js/components/local/Details';

/*
#File: Configuration.js
#Author: Charles Karpati
#Date: Jan 2020
#Section: 
#Email: karpati1@umbc.edu
#Description:  Editing the configuration file
#Purpose: Allows for reconfiguration and review
#input: 
#output: 
*/

export default class Configuration extends React.Component{
  constructor(props) {
	super(props);
	this.state = {
      dictionaries : null,
      configuration : null,
      modals : null,  
      style : null,
      theme : null,
      activeLayer: [], // dictionary layers
      activeDetails: [], //dict, config, modal, style, theme
      rendered: [],
	};
	this.onInputChange= this.onInputChange.bind(this)
	this.update = this.update.bind(this);
	this.updateConfig = this.updateConfig.bind(this)
	this.setDetails = this.setDetails.bind(this);
	this.setLayer = this.setLayer.bind(this);
	this.download = this.download.bind(this);
  }

  componentWillMount(){
    let {dictionaries, configuration, modals, style, theme, activeLayer, activeField} = this.props.state
    this.setState( {dictionaries, configuration, modals, style, theme } );
  } componentDidMount(){ this.update() }

  //
  // Update the VIEW
  // Called onMount, on setDetails and setLayers
  
  // If active layer -> fields = displayObj( {'fields' : dict.fields} , updateConfig )
  // If active layer -> content = displayObj(tempDict(del fields&drawinginfo), updateConfig )

  update() {
    let styling = {
    	maxHeight: '400px', 
    	overflow: 'auto', 
    }
    let {dictionaries, configuration, modals, style, theme, activeLayer, activeDetails, rendered} = this.state
  	let updateConfig = this.updateConfig;
  	if(!style || !theme || !dictionaries || ! configuration || !modals){ return null }

  	//
  	//  Create the Dictionary Drawer's Content 
  	// 
  	let renderedDictionaries = []
    for (var dict of dictionaries) {
      let content = '';
      let fields = '';
      let field = createFkey(dict) //dict['service'] + '&' + dict['layer']
      //
      // IF amongst Active Dictionaries
      if ( activeLayer != [] && activeLayer.includes(field.fkey) ){
      	let tempDict = Object.assign({}, dict)
      	delete tempDict.fields;
      	delete tempDict.drawinginfo;
      	console.log('Displaying Active {Dict.Fields}')
      	fields = displayObject( {'fields' : dict.fields }, updateConfig  );
      	console.log('Displaying Active Dict { layerOptions : {Key:Vals} }')
      	content = displayObject( tempDict, updateConfig )
      }
      // Render Dataset
      let renderedDict = 
        <details key={dict.key} style={ {border: '1px solid black', textAlign: 'left'} }>
          <summary onClick={this.setLayer} data-detail={field.fkey} > {field.flabel} </summary> 
          <div style={{ background: 'rgb(240,240,240)' } }>
          { fields }
          { content }
          </div>
        </details>
      renderedDictionaries.push(renderedDict) 
    };
    // Details
    renderedDictionaries = 
      <details style={styling} key='dictionariesSpec'>
        <summary onClick={this.setDetails}  data-detail={'dictionaries'} > Datasets </summary> 
        { activeDetails.includes('dictionaries') ? renderedDictionaries : '' } 
      </details>
  	
  	//
 	// Configuration.
    let renderedConfiguration = 
	  <details key='configurationSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} data-detail={'configuration'} > Configuration  </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { activeDetails.includes('configuration') ? displayObject( configuration, updateConfig ) : '' }
	    </div>
	  </details>

    //
  	// Modals.DONT WORRY ABOUT THIS UNTIL THE UPDATE
  	/*
    let renderedModals = 
	  <details key='modalSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} data-detail={'modals'} > Modals</summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { activeDetails.includes('modals') ? displayObject( modals, updateConfig ) : '' }
	    </div>
	  </details>
	*/

  	//
  	// Style
  	//
    let renderedStyle = 
	  <details key='styleSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} data-detail={'style'} > Styles </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { activeDetails.includes('style') ? displayObject( style, updateConfig ) : '' }
	    </div>
	  </details>

  	//
  	// Theme.
  	//
    let renderedTheme = 
	  <details key='themeSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} data-detail={'theme'} > Theme </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { activeDetails.includes('theme') ? displayObject( theme, updateConfig ) : '' }
	    </div>
	  </details>

  	//
  	// download
  	//
    let download = <button key='downloadButton' style={ {border: '1px solid black', textAlign: 'left'} } onClick={this.download} >Download Config</button>

	let returnThis = [renderedDictionaries, renderedConfiguration, renderedStyle, renderedTheme, download];
    this.setState( { rendered : returnThis } )
  }





  // On Input Change
  //
  onInputChange(e){} // does nothing called from nowhere

  //
  // called from displayObject ^^ above
  // Update the ConfigDoc when a field is updated
  //

  //
  // does this wwork????
  //
  //
  updateConfig(e){
  	// Get the label
  	let label = event.target.parentElement.parentElement.parentElement.parentElement;
  	if( event.type != 'click'){ label = label.parentElement.parentElement }
    // Get label details
  	let fkey = label.dataset.detail
  	let summary = label.closest('details').firstChild; 
  	// NO FKEY = Update to Config, Style, or Theme containers. Otherwise Update Dictionaries
  	console.log('~~~~~~~~NEW~~')
  	console.log('From label: ', fkey, 'From summary: ', summary.dataset.detail)
    let container = summary.dataset.detail

  	if( fkey == undefined){
  	  let dict = this.state.dictionaries
  	  let layerName = fkey.split('&')[0]
  	  let fieldName = fkey.split('&')[1]
  	  dict = dict.filter(e => e.key == layerName)
  	  // console.log('dict ', dict)
  	  if(fieldName == undefined){
  	    // UPDATE LAYER
  	  }
  	  else{
  	  	// UPDATE FIELD
  	  	let field = dict.filter(e => e.name == layerName)[0] 
  	  } 
  	} 	
  }


  // activeDetails
  setDetails(e){
  	let {activeDetails} = this.state
  	let target = e.target.nodeName == 'B' ? e.target.parentElement : e.target;
  	let newVal = target.dataset.detail
  	if( activeDetails.includes(newVal) ){ activeDetails = activeDetails.filter(e => e !== newVal)}
  	else{ activeDetails.push( newVal ) }
  	this.setState( {activeDetails} )
  	this.update()
  }

  // activeLayer
  setLayer(e){
  	let {activeLayer} = this.state
  	let target = e.target.nodeName == 'B' ? e.target.parentElement : e.target;
  	let newVal = target.dataset.detail
  	if( activeLayer.includes(newVal) ){ activeLayer = activeLayer.filter(e => e !== newVal)}
  	else{ activeLayer.push( newVal ) }
  	this.setState( {activeLayer} )
  	console.log('setLayer', activeLayer)
  	this.update()
  }

  //
  // Download the ConfigDoc
  //
  download() {

    // Seperate Layers and Fields
    let fields = []
    let layers = this.state.dictionaries.map( layer => {
      layer.fields.map( field => { fields.push( field ) } )
      delete layer.fields
      layer['drawinginfo'] = JSON.stringify( layer['drawinginfo'] )
      return layer
    } );

    // Download as Zip
	var zip = new JSZip();
    zip.file("spec_layers.csv", convertArrayOfObjectsToCSV( layers ) );
  	zip.file("spec_fields.csv", convertArrayOfObjectsToCSV( fields ) );
    zip.file("spec_style.csv", convertArrayOfObjectsToCSV( [ this.state.style ] ) );
  	zip.file("spec_theme.csv", convertArrayOfObjectsToCSV( [ this.state.theme ] ) );
   	zip.file("spec_modals.csv", convertArrayOfObjectsToCSV( this.state.modals )) ;
    zip.file("spec_configuration.csv", convertArrayOfObjectsToCSV( [ this.state.configuration ] ) );
    zip.generateAsync({type:"blob"}).then(function(content) { saveAs(content, "website_config.zip");  } );
  }

  render(){ return this.state.rendered }
}





// Created for use in the update function.
let createFkey = (obji, objKey = false) => {
  let flabel, fieldKey = false
  if ( obji.hasOwnProperty('filter') ){ fieldKey = flabel = objKey.alias; }  //'fields'
  else if ( obji.hasOwnProperty('host') ){ fieldKey = flabel = obji.alias; }  // 'layers'
  else { fieldKey = flabel = objKey; }
  return {'flabel' : flabel, 'fkey' : fieldKey}	
}




// 
// Description: Recurses through an object to display all Fields as Select Boxes
// Purpose: 

// Input updateFunction
//

// Does not render if 'Drawing Info' or 'preload filter' attribute, or if fields is empty.
// Special Cases:
// - array -> preload filter returns null
// - object -> FIELD and LABELS
// 
// Recieves and treats object and arrays the same.
//
// Loops through each key/index
//
// Value at key/index is txt? key:value => prompt:inputs 
// Value at key/index is Array? 
//
// Recieves Style, Theme, Configuration => Processed by last 
function displayObject(obji, func) {
  if ( obji == null || typeof(obji) == 'undefined'){ return null }
  if ( obji.hasOwnProperty("fields") && obji.fields==undefined ){ return null }

  // RECIEVE OBJECT
  // console.log('Display', obji)

  // Render Object for each objKey : value pair
  return Object.keys(obji).map(objKey => {
	let keyVal = obji[objKey];

    let isArr = Array.isArray( keyVal );
	let isObj = typeof keyVal === 'object'; 
	// Within a Layers Drawer Create a Drawer to house the a Drawer for each field.
	if( isArr ){
      // USE: Display Fields Array from the Dictionary
	  if( objKey == 'preloadfilter' ){ return null }
	  console.log( '-- Creating Fields Drawer From Array' )
	  return <details key={Math.random()} className='settingsDetails' open> 
	    <summary> {objKey} </summary> 
	    {displayObject(keyVal, func)} 
	  </details>
	}
	else if ( isObj ){
	  // USE: layer, fields
      let field = createFkey(keyVal); 
      if(keyVal.hasOwnProperty("alias")){ field.fkey=keyVal.key+'_'+keyVal.name ; field.flabel=keyVal.alias }
	  console.log( `-- -- Creating "${field.flabel}" Drawer for Field from Object`)
	  return <details key={Math.random()} className='settingsDetails'>
	    <summary data-detail={field.fkey} > {field.flabel} </summary> 
	    {displayObject(keyVal, func)} 
	  </details> 
	}
	else{
      // its not an array and its not an obj.
 	  // Render Input
	  let input = <CreatableSelect isClearable placeholder={ JSON.stringify(keyVal).replace(/['"]+/g, '') }  onChange={func}/>
      let field = createFkey(obji, objKey)
	  return <div key={Math.random()*100} className={'settingsTextBoxWrapper'} data-detail={field.fkey} ><label> {objKey} </label> : {input} </div>
	}
  } )
}
// Give it the Dataset Dictionary
// 



//
// Called from Download()
// Save JSON OBJ AS CSV
//
   
// Utility Function of downloadCsv calls escapeHTML
function convertArrayOfObjectsToCSV(data) { 
	var result, ctr, keys, columnDelimiter, lineDelimiter, data;
	if (data == null || !data.length) { return null; }
	// Set Delimiters, get Columns
	columnDelimiter =  "`" ;
	lineDelimiter = '\n';
	keys = Object.keys(data[0]);
	// Start CSV
	result = '';
	result += keys.join(columnDelimiter);
	result += lineDelimiter;
	// Loop through records
	data.forEach(function(item) {
		ctr = 0;
		keys.forEach(function(key) {
			if (ctr > 0) result += columnDelimiter;
			console.log(item[key] )
			result += escapeHTML ( JSON.stringify( item[key] ) ); 
			ctr++;
		});
		result += lineDelimiter;
	});
	return result;
}
// String Security
function escapeHTML (unsafe_str) {
  let s = unsafe_str
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/#/gi, '%23')
  // stripEndQuotes
  var t=s.length;
  if (s.charAt(0)=='"') s=s.substring(1,t--);
  if (s.charAt(--t)=='"') s=s.substring(0,t);
  return s;
}
