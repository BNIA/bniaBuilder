import React, {Component} from 'react';

import Body from 'js/components/global/Body';
import Header from 'js/components/global/Header';
import Modal from 'js/components/global/Modal';
import BigModal from 'js/components/global/BigModal';

import {handleChange, handleSubmit, showDetails, handleReset} from 'js/utils/search'
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

  // Remove a field from the Clicked Layers component.
  async handleRemove(event){
    let key = event.target.dataset.key;
    let layer = this.state.dictionaries.filter(function(k) { return k.key === key  })[0];
    let recordId = layer.host+'&'+layer.service+'&'+layer.layer;
    let newRecords = this.state.records;
    delete newRecords[recordId]
    console.log('HEEEEYO');
    console.log(this.state.records)
    console.log(newRecords);
    this.setState({ records: newRecords });
  }

  // Query & Fetch data after a Form is submitted.
  async handleSubmit(event){
    document.getElementsByTagName("BODY")[0].style.cursor = "wait";
    let updates = await handleSubmit(event, this.state.records, this.state.dictionaries);
    document.getElementsByTagName("BODY")[0].style.cursor = "pointer";
    this.setState({ records: updates });
  }

  // Query & Fetch Search Suggestion as the user engages with a Form Input.
  async handleChange(event){
    document.getElementsByTagName("BODY")[0].style.cursor = "wait";
    let update = await (handleChange(event, this.state.dictionaries) );
    document.getElementsByTagName("BODY")[0].style.cursor = "pointer";
    this.setState({ dictionaries: update });
  }

  // Remove all Suggestions for the DataSet
  async handleReset(event){
    document.getElementsByTagName("BODY")[0].style.cursor = "wait";
    let update = await (handleReset(event, this.state.dictionaries) );
    document.getElementsByTagName("BODY")[0].style.cursor = "pointer";
    console.log(update);
    this.setState({ dictionaries: update });
  }

  // Query & Fetch Search Suggestion as the user engages with a Form Input.
  async handleChange(event){
    document.getElementsByTagName("BODY")[0].style.cursor = "wait";
    let update = await (handleChange(event, this.state.dictionaries) );
    document.getElementsByTagName("BODY")[0].style.cursor = "pointer";
    this.setState({ dictionaries: update });
  }

  // Query & Fetch additional information for a specific record.
  async showDetails(event){
    document.getElementsByTagName("BODY")[0].style.cursor = "wait";
    let update = await ( showDetails(event.target.feature, this.state ) );
    document.getElementsByTagName("BODY")[0].style.cursor = "pointer";
    this.setState({
      clickedField: event, 
      feature : update.feature,
      featuresDictionary : update.featuresDictionary,
      featuresConnectedDictionaries : update.featuresConnectedDictionaries
    });
  }

  // Toggles Text to Speach
  componentDidMount(){ this.state.configuration.speech ? ( require('js/utils/annyang.min.js') ) : null }

  render () {
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
    let bigModal = !this.state.configuration.showAllRecordsBtn ? '' : <BigModal state={this.state} />
    if (navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/))){ alert("Please dont use IE."); }
    return (
    <div style={merge}>
        <Modal modal={this.state.modals} appName={this.state.configuration.longName}/>
        { bigModal }
        <Header state={this.state} />
        <Body stateFunctions={stateFunctions} state={this.state}/>
    </div>
    );
  }
}