import React, {Component} from 'react';

//Array.from()
//myElement.classList.toggle('some-class')
//el.classList.toggle('some-orange-class', theme === 'orange'); //conditional
//myElement.closest('article').querySelector('h1'); // get h1 from nearest article in parents
//if (myElement.matches('.some-class')) {
//if (!modalEl.contains(e.target)) modalEl.hidden = true;
// document.getElementById("myDialog").showModal() 
//https://codepen.io/giuseppesalvo/pen/wrYrVb
//https://codepen.io/sdurphy/pen/dPpawz

import Worker from 'js/utils/Worker.worker.js'
import Form from 'js/components/local/Form.js'

// Input : Layer, state, stateFunctions
// Output - Submit Event, Suggestion Event, Drawer fields setup as Inputs.
// Description : This Component is used in the Navigation Panel. 
// It is called once for every Layer of Data to construct a form.
export default class Details extends Component {
  displayName: 'Details';
  constructor(props) {
    super(props);
    this.state = {
      form : false,
      prepairedData : false,
      update : false,
    }
    this.giveDescription = this.giveDescription.bind(this);
  }

  // on keypress, while checking to see if an the component should rerender also construct the item to rerender.
  componentDidMount(){ this.updateForm( ) }
  componentWillReceiveProps(nextProps){ this.updateForm( ) }

  // Prepare the Form
  async updateForm( ){
    let newWorker = new Worker()
    newWorker.postMessage({'cmd': 'prepareSuggestions', 'msg': this.props.layer });
    newWorker.onmessage = async (m) => {    
      let update = true;
      if( update ){ this.setState( { 'prepairedData' : m.data.prepairedData, 'update' : true } ) } 
      else{ this.setState( { 'update' : false } ) } 
    }
    newWorker.terminate();
  } 
  
  // RENDER
  async giveDescription(description){alert(description); }
  render () {
    const { prepairedData } = this.state;
    const { layer, state, stateFunctions} = this.props;
    
    // Show the 'Remove' Button
    let removeButton = !layer['dataWithGeometry'] ? false :
      <button className='removeButton fa fa-times'
       onClick={stateFunctions.removed}
       title='Remove Layer'
       data-key={layer.key} />;

    // Otherwise show the 'Go' and 'Search' Buttons
    let goButton = !layer.labelbutton ? '':
      <button className='GoButton fa fa-angle-double-right'
       onClick={stateFunctions.submitted}
       title='Search Layer'
       data-key={layer.key} />;
    let searchButton = !layer.searchfields ? '' :
      <button type='submit' className='searchButton'
        onClick={stateFunctions.submitted}
        title='Search!'
        data-key={layer.key} >
        Search!
      </button>; 
    // Show the reset button if searchfields is true
    let resetButton = !layer.searchfields ? '' :
      <button type='reset' title='Clear Search' onClick={stateFunctions.reset} >Reset </button>;

    // Let the user know how many matches were found.
    let respLen = layer['currentFormsData'] ? layer['currentFormsData'].length : false; let alert = '';
    if( !layer.searchfields ) ''
    else if( respLen === 0) alert = <p> No Records Found </p>
    else if( respLen == 1 ) alert = <p> Exact Match! </p>
    else if( respLen >= 100 ) alert = <p> Top 100 Records by attribute </p>
    else if( respLen >= 2) alert = <p> {respLen} records found </p>
    else alert = <p> Enter Query </p>

    let layerDescription = layer.layerdescription ? layer.layerdescription : '';
    let infoButton = layerDescription ? '' : '';
     // <button className='fa fa-info'
     //  onClick={ this.alert() }
     //  title='Description' />;

    return <details>
        <summary title={ layerDescription } > {layer.alias} { infoButton }{ removeButton }{ goButton } </summary>
        <form data-key={layer.key}>
          { alert }
          <Form layer={layer} stateFunctions={stateFunctions} prepdSug={prepairedData}  /> 
          {searchButton}
          {resetButton}
        </form>
      </details>
  }
}




/*
      // Always update the first time
      if( !this.state.prepairedData ){ update = true }
      else if( !update ){  
        // check each field
        let obj = m.data.prepairedData;
        console.log(obj)
        Object.keys(obj).map( (key, index) => {
          ( 
            ( typeof(this.state.prepairedData[index]) != 'undefined'  ) && 
            ( obj[index].length != this.state.prepairedData[index].length ) 
          ) ? update = true : ''
        } )
      }
*/


// PHP install page.
// Prompt for Database Credentials 
// Create Database from domains filepath/url whatever mojobojomojoododadjos
// Create Tables 
// Create Admin account 

// 1) download code (bnia can provide it as a zip) 
// 2) goto domain.ext/path/to/file/install to get started 
// 3) visit the homepage and log in 