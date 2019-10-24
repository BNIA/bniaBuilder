import React, {Component} from 'react';
import {fetchData} from 'js/utils/utils';
import Body from 'js/components/global/Body';
import Header from 'js/components/global/Header';
import {getFieldSuggestion, handleSubmit, getDetails, handleReset} from 'js/utils/search'
import * as myConfig from '../../json_config.json';
import * as authRules from '../../auth_rules.json';
let style = { ...myConfig.style, ...myConfig.theme };
let config = Object.assign(myConfig, authRules);

/*
#File: App.js
#Author: Charles Karpati
#Date: Feb 2019
#Section: Bnia
#Email: karpati1@umbc.edu
#Description: The root component. Called from Main.js 
#Purpose: Loads needed components, passes down needed functions to components, handles state 
#input: Fetch utility, [Body, Header, BigModal, Account] components, configuration/authRules 
#output: The Website
*/

import {account_login, account_logout, account_update, account_recovery, account_create, handleRemove, showDetails} from 'js/utils/stateFunctions'

export default class App extends Component {
  displayName: 'App';

  //
  // The state is passed from the config doc
  // All major application functionalities are listed here
  // we stuff all state-altering functions into the 'stateFunctions' object 
  // so that they may be passed down components for calling
  //
  constructor(props) {
    super(props);
    this.stateFunctions = {
      account_login : account_login.bind(this),
      account_logout : account_logout.bind(this),
      account_update : account_update.bind(this),
      account_recovery : account_recovery.bind(this),
      account_create : account_create.bind(this),
      inputChange : this.handleChange.bind(this),
      handleReset : this.handleReset.bind(this),
      handleSubmit : handleSubmit.bind(this),
      handleRemove : handleRemove.bind(this),
      showDetails : showDetails.bind(this)
    };
    this.state = config
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
    this.setState({ dictionaries : newDictionary });
  }
// Get Search Suggestions
async handleChange(event){
    // The currentFormsData is retrieved on input keypres using getFieldSuggestion()
    // onkeypress="this.style.width = ((this.value.length + 1) * 8) + 'px';"
    let update = await (getFieldSuggestion(event, this.state.dictionaries) );
    this.setState({ dictionaries: update } );
  }


  //
  // Load the Login / BigModal components if config doc says so.
  //
  async componentDidMount(){ 
    let sessionId = await fetchData('./api?purpose=visiting');
    let loginRequired = this.state.configuration.loginRequired;
    // this.state.configuration.speech ? await import('js/utils/annyang.min.js') : ''; 
    /* Code Splitting works but now only request the resources on button click */
    const Account = this.state.auth.loginEnabled == 'false' ? false : await import (/* webpackChunkName: "account" */ 'js/components/global/Account');
    const BigModal = this.state.configuration.showAllRecordsBtn == 'false' ? false : await import(/* webpackChunkName: "bigmodal" */ 'js/components/global/BigModal');
    this.setState( { Account : Account.default , BigModal : BigModal.default } )
  }
  //
  // Load the Header and Body. As well Account/ Bigmodal conditionally
  //
  render () { 
    let returnThis = [
      <Header key='header' state={this.state}  modal={this.state.modals} appName={this.state.configuration.longName} />,
      <Body key='body' stateFunctions={this.stateFunctions} state={this.state} />
    ]
    if(this.state.auth.loginRequired && this.state.auth.loginEnabled && this.state.Account){
      returnThis.push( <this.state.Account key='account' stateFunctions={this.stateFunctions} state={this.state}/> 
      ) 
    }
    if(this.state.details && this.state.configuration.showAllRecordsBtn && this.state.BigModal){ 
      returnThis.push(<this.state.BigModal key='bigModal' state={this.state}/> 
      ) 
    }
    return <div style={style}> { returnThis } </div>
  }
}