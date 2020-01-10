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
	this.updateConfig = this.updateConfig.bind(this)
	this.update = this.update.bind(this);
	this.download = this.download.bind(this);

	this.setDetails = this.setDetails.bind(this);
	this.setLayer = this.setLayer.bind(this);
  }

  componentWillMount(){
    let {dictionaries, configuration, modals, style, theme, activeLayer, activeField} = this.props.state
    this.setState( {dictionaries, configuration, modals, style, theme } );
  } componentDidMount(){ this.update() }

  onInputChange(e){

  }

  //
  // Update the ConfigDoc when a field is updated
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
  	  let deets = this.state[container] 
  	}
  	else{
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

  //
  // Update the VIEW
  update() {
    let styling = {
    	maxHeight: '400px', 
    	overflow: 'auto', 
    }
    let {dictionaries, configuration, modals, style, theme, activeLayer, activeDetails, rendered} = this.state
  	let upd = this.updateConfig;
  	if(!style || !theme || !dictionaries || ! configuration || !modals){ return null }

  	// Create the Dictionary Drawer's Content
  	let renderedDictionaries = []
    for (var dict of dictionaries) {
      let content = '';
      let fields = '';
      let field = createFkey(dict) //dict['service'] + '&' + dict['layer']
      //
      // IF Active Dictionary
      if ( activeLayer != [] && activeLayer.includes(field.fkey) ){
      	let tempDict = Object.assign({}, dict)
      	delete tempDict.fields;
      	delete tempDict.drawinginfo;
      	fields = displayObject( {'fields' : dict.fields }, upd  );
      	content = displayObject( tempDict, upd )
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
    } ;
    // Stuff the content into a Dictionaries Drawer
    renderedDictionaries = <details style={styling} key='dictionariesSpec'>
        <summary onClick={this.setDetails}  data-detail={'dictionaries'} > Datasets </summary> 
        { activeDetails.includes('dictionaries') ? renderedDictionaries : '' } 
      </details>
  	
  	//
 	// Configuration.
    let renderedConfiguration = 
	  <details key='configurationSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} data-detail={'configuration'} > Configuration  </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { activeDetails.includes('configuration') ? displayObject( configuration, upd ) : '' }
	    </div>
	  </details>

    //
  	// Modals.DONT WORRY ABOUT THIS UNTIL THE UPDATE
  	/*
    let renderedModals = 
	  <details key='modalSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} data-detail={'modals'} > Modals</summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { activeDetails.includes('modals') ? displayObject( modals, upd ) : '' }
	    </div>
	  </details>
	*/

  	//
  	// Style.
    let renderedStyle = 
	  <details key='styleSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} data-detail={'style'} > Styles </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { activeDetails.includes('style') ? displayObject( style, upd ) : '' }
	    </div>
	  </details>

  	//
  	// Theme.
    let renderedTheme = 
	  <details key='themeSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} data-detail={'theme'} > Theme </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { activeDetails.includes('theme') ? displayObject( theme, upd ) : '' }
	    </div>
	  </details>

  	//
  	// download
    let download = <button key='downloadButton' style={ {border: '1px solid black', textAlign: 'left'} } onClick={this.download} >Download Config</button>

	let returnThis = [renderedDictionaries, renderedConfiguration, renderedStyle, renderedTheme, download];
    this.setState( { rendered : returnThis } )
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


  // activeLayer
  // activeDetails
  // 
  setDetails(e){
  	let {activeDetails} = this.state
  	let target = e.target.nodeName == 'B' ? e.target.parentElement : e.target;
  	let newVal = target.dataset.detail
  	if( activeDetails.includes(newVal) ){ activeDetails = activeDetails.filter(e => e !== newVal)}
  	else{ activeDetails.push( newVal ) }
  	this.setState( {activeDetails} )
  	this.update()
  }

  // 
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
  

  render(){ return this.state.rendered }
}








// Created for use in the update function.
let createFkey = (obji, objKey = false) => {
  let flabel, fieldKey = false
  // Search object for Config Style or Theme Attributes.
  // if( obji.hasOwnProperty('author') ){ fieldKey = 'config'; }
  // else if( obji.hasOwnProperty('--font-color-1') ){ fieldKey = 'style'; }
  // else if( obji.hasOwnProperty('--scrollbar-bar') ){ fieldKey = 'theme'; }
  // 
  // If !objKey -> Fields Object; Else objKey is an Input
  if ( obji.hasOwnProperty('filter') ){ 
    //'fields' 
    fieldKey = objKey.alias;
    flabel = objKey.alias;
  } 
  else if ( obji.hasOwnProperty('host') ){ 
    // 'layers'
    fieldKey = obji.alias;
    flabel = obji.alias;
  }
  else { 
    // 'one of the other ones '
    fieldKey = objKey;
    flabel = objKey;
  }
  return {'flabel' : flabel, 'fkey' : fieldKey}	
}




// 
// Displays Fields in of an object using Select Boxes
// Calls on itself recursively to handle both Objects and Arrays.
// Special Cases:
//  -- array -> preload filter returns null
//  -- object -> FIELD and LABELS
//
// Does not render 'preload filter' attribute, 
// Does not render if fields is empty.
// Does not render 'Drawing Info' attribute
// 
function displayObject(obji, func) {
  if ( obji == null || typeof(obji) == 'undefined'){ return null }
  if ( obji.hasOwnProperty("fields") && obji.fields==undefined ){ return null }

  // Render Object for each objKey : value pair
  return Object.keys(obji).map(objKey => {
	let keyVal = obji[objKey]
	if( Array.isArray( keyVal ) ){
      // USE: Display Fields Array from the Dictionary
	  if( objKey == 'preloadfilter' ){ return null }
	  let fieldsform = displayObject(keyVal, func);
	  return <details key={Math.random()} className='settingsDetails'> <summary> {objKey} </summary> {fieldsform} </details>
	}
	else if (typeof keyVal === 'object' ){
	  // USE: Style, Theme, Config, layer, fields
      let field = createFkey(keyVal); 
	  let fieldsform = displayObject(keyVal, func);
	  return <details key={Math.random()} className='settingsDetails'> 
	    <summary data-detail={field.fkey} > {field.flabel} </summary> {fieldsform} </details> 
	}
	else{
	  // Render Input
	  let input = <CreatableSelect 
	      isClearable onChange={func}
          placeholder={ JSON.stringify(keyVal).replace(/['"]+/g, '') } />
      let field = createFkey(obji, objKey)
	  return <div key={Math.random()*100} className={'settingsTextBoxWrapper'} data-detail={field.fkey} ><label> {field.flabel} </label> : {input} </div>
	}
  } )
}

//let ops = JSON.stringify(value).replace(/['"]+/g, '')
//ops = [ { value : ops, label: ops } ]
// let ops = []
// let arr = JSON.stringify(value).replace(/['"]+/g, '').split(",").filter(e => e !== ' ' && e !== '')
// for( var x in arr ){ ops.push( { value : arr[x], label: arr[x]} ) }

	// Download CSV calls downloadCsv
	function downloadCsv( csv, filename ) {  
		var data, filename, link;
		if (csv == null) return;
		filename = filename + '.csv';
		if (!csv.match(/^data:text\/csv/i)) {
			csv = 'data:text/csv;charset=utf-8,' + csv;
		}
		data = encodeURI(csv);
		link = document.createElement('a');
		link.setAttribute('href', data);
		link.setAttribute('download', filename);
		link.click();
	}
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
// 
// developing an intuition for data. -> depends on size of features /(kinda also # observations)
// data learning - dataset figures out what is important.
// - what kind of features do you have
// - where is the information hiding that links your input to output. 
// - what kind of transformation do you have to apply to you dataset to enable modeling
// do all work upfront. models are dime a dozen. skilearn model.fit x1000 then model ontop of that.
// all the work is in thinking about how to bulid features and constructing the pipeline.
// process before implementation
// ask what you are being interviewed for before being interviewed. thats ok.
// 

/*
SearcbForLeaderNode
ConnectToLeaderNode
AdvertiseAsLeader
search for default network
-- configure LeaderNodeName
-- Leader - Send broadcast
-- Leader - Send command
-- Slave - Send Data
-- Leader - Receive Broadcast
-- Leader - Receive Node Data
-- Leader/ Slave - Receive User Command
only the leader broadcasts
*/
/*
graph TD
  user[User] --> |Visits|Website[Website]
    Website --> |Clicks|btbutton(BTButton)
    btbutton --> |Begining|scan4Nodes{scan4Nodes}
    scan4Nodes --> |NoNodesAdvertising|showNodes(Exit)
    scan4Nodes -->| Connect|advert(advertisement)

  user -->|turnsOn|node1[node]
    node1 --> prop1[AdvertName]
    node1 --> initNode{Decides What To Do}
    node1 --> |property|prop2[leaderName]
    node1 --> |property|prop3[leaderPass]
  initNode--> |NoLeaderExist.Initialize|advert
    advert--> |Connect|btcon[EstablishedBTConnection]
    initNode-->cn2l(ConnectNode2Leader)
    initNode --> searchLeader(searchLeader)
    searchLeader --> prop2
    btcon --> |...|BTWebsite
    btcon --> |CreatesLeader|BTNode

  BTWebsite --> |can play music from an| mp3BT
  mp3BT--> |SendsFeatures2|BTNode
  mp3BT-->|Checks for|btcon

cn2l --> BTNode 
*/

