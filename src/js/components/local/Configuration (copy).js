import React, {Component} from 'react';
import Select from 'react-select'
import Choices from 'choices.js';

const e = React.createElement;
import Details from 'js/components/local/Details';

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
      controllers : null,
      initialLoad: false,
      componentDidUpdateFlag: false,
	};
	this.update = this.update.bind(this);
	this.download = this.download.bind(this);

	this.setDetails = this.setDetails.bind(this);
	this.setLayer = this.setLayer.bind(this);
  }

  componentWillMount(){
    let {dictionaries, configuration, modals, style, theme, activeLayer, activeField} = this.props.state
    this.setState( {dictionaries, configuration, modals, style, theme } );
  }
  componentDidMount(){ this.update() }


  setLayer(e){
  	let {activeLayer} = this.state
  	let target = e.target.nodeName == 'B' ? e.target.parentElement : e.target;
  	let newVal = target.getAttribute("layer")
  	if( !( activeLayer.includes(newVal) ) ){ activeLayer.push( target.getAttribute("layer") ) }
  	this.setState( {activeLayer} )
  }

  // activeDetails
  // 
  setDetails(e){
  	let {activeDetails} = this.state
  	let target = e.target.nodeName == 'B' ? e.target.parentElement : e.target;
  	let newVal = target.getAttribute("layer")
  	if( !( activeDetails.includes(newVal) ) ){ activeDetails.push( target.getAttribute("layer") ) }
  	this.setState( {activeDetails} )
  	console.log('setDetails', event)
  	this.update()
  }

  //
  // Download the ConfigDoc
  //
  download() {
  }

  //
  // Update the ConfigDoc whenever edited
  //
  update() {
    let styling = {
    	maxHeight: '400px', 
    	overflow: 'auto', 
    }
    let {dictionaries, configuration, modals, style, theme, activeLayer, activeField, rendered} = this.state
  	if(!style || !theme || !dictionaries || ! configuration || !modals){ return null }

 	// Work with Configuration.
    let renderedConfiguration = 
	  <details key='configurationSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} > <b>Configuration</b> </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { displayObject( configuration ) }
	    </div>
	  </details>

  	// Work with Dictionaries
  	let renderedDictionaries = []
    for (var item of dictionaries) {
      let content = '';
      let fields = '';
      let drawingInfo = '';
      if ( activeLayer.includes(item.key) ){
      	let fields = displayObject( item.fields );
      	delete item.fields;
      	let drawingInfo = displayArray( item.Drawinginfo );
      	delete item.Drawinginfo;
      	console.log(item);
      	content = displayObject( item )
      }
      let innerHtml = 
        <div key={item.key} style={ {border: '1px solid black', textAlign: 'left'} }>
          <p onClick={this.setLayer} layer={item.key} > <b>{item.alias}</b> </p> 
          <div style={{ background: 'rgb(240,240,240)' } }>
          { content }
          { fields }
          { drawingInfo }
          </div>
        </div>
      renderedDictionaries.push(innerHtml) 
    } ;
    renderedDictionaries = <details style={styling} key='dictionariesSpec'><summary onClick={this.setDetails} >Site Configuration</summary> {renderedDictionaries} </details>

  	// Work with Modals.
    let renderedModals = 
	  <details key='modalSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} > <b>Modals</b> </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { displayObject( modals ) }
	    </div>
	  </details>

  	// Work with Style.
    let renderedStyle = 
	  <details key='styleSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} > <b>Styles</b> </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { displayObject( style ) }
	    </div>
	  </details>

  	// Work with Theme.
    let renderedTheme = 
	  <details key='themeSpec' style={ {border: '1px solid black', textAlign: 'left'} }> 
	    <summary onClick={this.setDetails} > <b>Theme</b> </summary> 
	    <div style={{ background: 'rgb(240,240,240)' } }>
	      { displayObject( theme ) }
	    </div>
	  </details>
	

	let returnThis = [renderedDictionaries, renderedConfiguration, renderedModals, renderedStyle, renderedTheme];

    this.setState( { rendered : returnThis } )
  }

  // how many people do i think i can sawy per year? low thousands.
  // how many people had i in 1 year? 16 or 12 times 2

  // limit the ability to percieve complexity

  componentDidUpdate(){
    let getChoices = () => {
  	  return new Choices('.settingsTextBox', {
	    delimiter: ',',
	    editItems: true,
	    maxItemCount: 1,
	    removeItemButton: true,
	  } );
    }
    // we do this next part because all hell breaks loose when new choices are created after each update.
  	if(!this.state.initialLoad ){
	  let choic = new Choices('.settingsTextBox', {
	    delimiter: ',',
	    editItems: true,
	    maxItemCount: 1,
	    removeItemButton: true,
	  } )
	  console.log('choci', choic)
	  this.setState({ controllers: choic, initialLoad : true })	
  	}
  	else if(!this.state.componentDidUpdateFlag){
  	  let controll = this.state.controllers
  	  console.log(controll)
  	  controll.destroy()
	  //let choic = getChoices()
	  //this.setState({ controllers: choic })	
  	}

  }

  // 
  // show onClick detail container content.
  // 
  // Show the entire ConfigDoc. Allow values to be editable.
  // 
  render(){ console.log(this.state); return this.state.rendered }
}




function displayArray(obji) {
  if ( obji == null){ return null }
  return obji.map( value => {
  	
	// Dealing with an array
	if(Array.isArray(value ) ){
	  let fieldsform = displayArray(value);
	  return <div key={Math.random()} style={styles} > <details> <summary> {key} </summary> {fieldsform} </details> </div>
	}
	// Dealing with an Object
	else if (typeof value === 'object' ){
	  return <div key={Math.random()} style={styles} > <details> <summary> {key} </summary> {JSON.stringify(value)} </details> </div>
	}
	else{
	  return  <p key={Math.random()} style={styles}><b>{key}</b> : {JSON.stringify(value)} </p>
	}
  } )
}
function displayObject(obji) {
  if ( obji == null){ return null }
  return Object.keys(obji).map(key => {
	let value = obji[key]

	// Dealing with an array
	if(Array.isArray(value ) ){
	  let fieldsform = displayObject(value);
	  return <div key={Math.random()} className='settingsDetails'> <details> <summary> {key} </summary> {fieldsform} </details> </div>
	}
	// Dealing with an Object
	else if (typeof value === 'object' ){
	  let fieldsform = displayObject(value);
	  return <div key={Math.random()} className='settingsDetails'> <details> <summary> {key} </summary> {fieldsform} </details> </div>
	}
	else{
	  //str.slice(1, -1);
	  let input =  <input className='settingsTextBox' type="text" value={ JSON.stringify(value).replace(/['"]+/g, '') } placeholder="Enter something" />
	  let element = <div className='settingsTextBoxWrapper' key={Math.random()}><label><b>{key}</b></label> : {input} </div>
      return element
	}
  } )
}