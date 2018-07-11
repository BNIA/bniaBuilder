import React, {Component} from 'react';

import Body from 'js/components/global/Body';
import Header from 'js/components/global/Header';

import {getFieldSuggestion, handleSubmit, getDetails, handleReset} from 'js/utils/search'
import * as myConfig from '../../json_config.json';

export default class App extends Component {
  displayName: 'App';
  constructor(props) {
    super(props);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.showDetails = this.showDetails.bind(this);
    this.state = myConfig
  }

  // The currentFormsData is retrieved on input keypres using getFieldSuggestion()
  async handleChange(event){
    let update = await (getFieldSuggestion(event, this.state.dictionaries) );
    this.setState({ 
      dictionaries: update, 
      'event': 'handleChange',
    });
  }
  
  // When a user clicks 'Search' our 'STATE.RECORDS' += layer['currentFormsData'] 
  async handleSubmit(event){
    let updates = await handleSubmit(event, this.state.records, this.state.dictionaries);
    this.setState({
      dictionaries: updates,
      'userHasSearched' : true,
      'event': 'handleSubmit',
    });
  }

  // Query all Connected Records at Block_lot. get Parcel?
  async showDetails(event){
    console.log('showDetails')
    let update = await ( getDetails(event, this.state ) );
    let details = update;
    this.setState( {
      'details' : details,
      'event': 'showDetails',
    } );
  }

  // Reset Suggestions & Form Field Curvals
  async handleReset(event){
    let form = event.target.form;
    let key = form.dataset.key;
    let newDictionary = this.state.dictionaries;
    let layer = newDictionary.filter( k => { return k.key == key  })[0];
    form.reset;
    layer.fields.map( field => {
      if (field.filter && typeof(field.filter) !== "boolean") {
        field.filter = true
      }
    } )
    if(layer.currentFormsData) delete layer.currentFormsData;
    this.setState({ 
      dictionaries : newDictionary, 
      'event': 'handleReset'
    });
  }

  // Remove a Clicked Layer.
  async handleRemove(event){
    let key = event.target.dataset.key;
    let dictionaries = this.state.dictionaries;
    let layer = dictionaries.filter(function(k) { return k.key === key  })[0];
    delete layer['dataWithGeometry'];
    this.setState( {
      dictionaries,
      'event': 'handleRemove'
    } );
  }

  // Toggles Text to Speach
  async componentDidMount(){ 
    this.state.configuration.speech ? await import('js/utils/annyang.min.js') : ''; 
    const BigModal = !this.state.configuration.showAllRecordsBtn ? false : await import('js/components/global/BigModal');
    this.setState( { BigModal : BigModal.default } )
  }
  render () {

    if (navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/))){ alert("Please dont use IE."); }
    
    // These functions are crucial for the app to work.
    let stateFunctions = {
      inputChange : this.handleChange,
      submitted : this.handleSubmit,
      removed : this.handleRemove,
      reset : this.handleReset,
      showDetails : this.showDetails
    };

    // CSS Variables allow for dynamic Style and Theming.
    let merge = {...this.state.style, ...this.state.theme}
    let bigModal = ''; 
    if(this.state.details && this.state.configuration.showAllRecordsBtn && this.state.BigModal){ 
	  bigModal = <this.state.BigModal state={this.state}/> 
	}

    return (
    <div style={merge}>
      {bigModal}
      <Header state={this.state}  modal={this.state.modals} appName={this.state.configuration.longName} />
      <Body stateFunctions={stateFunctions} state={this.state}/>
    </div>
    );
  }
}