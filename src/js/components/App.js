import React, {Component} from 'react';
import {fetchData} from 'js/utils/utils';
import Body from 'js/components/global/Body';
import Header from 'js/components/global/Header';
import {getFieldSuggestion, handleSubmit, getDetails} from 'js/utils/search'
import * as myConfig from '../../json_config.json';
import * as authRules from '../../auth_rules.json';
let style = { ...myConfig.style, ...myConfig.theme };
let config = Object.assign(myConfig, authRules);
config = Object.assign(myConfig, { activeModal : "Welcome" });

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

import {account_login, account_logout, account_update, account_recovery, account_create, handleRemove, handleChange, handleReset, showDetails} from 'js/utils/stateFunctions'

export default class App extends Component {
  displayName: 'App';

  //
  // The state is passed from the config doc
  // All major application functionalities are listed here
  // we stuff all state-altering functions into the 'stateFunctions' object 
  // so that they may be passed down components for calling
  //
  // handleReset : this.handleReset.bind(this), is used if the bound function is a method.
  constructor(props) {
    super(props);
    this.stateFunctions = {
      account_login : account_login.bind(this),
      account_logout : account_logout.bind(this),
      account_update : account_update.bind(this),
      account_recovery : account_recovery.bind(this),
      account_create : account_create.bind(this),
      inputChange : handleChange.bind(this),
      handleReset : handleReset.bind(this),
      handleSubmit : handleSubmit.bind(this),
      handleRemove : handleRemove.bind(this),
      showDetails : showDetails.bind(this),
      activeModal : this.activeModal.bind(this)
    };
    this.state = config
  }

  async activeModal(activeModal){ 
    // console.log('Clicked Event: ', activeModal)
    this.setState( { activeModal } )
  }
  //
  // Load the Login / BigModal components if config doc says so.
  //
  async componentDidMount(){ 
    let sessionId = await fetchData('./api?purpose=visiting');
    let loginRequired = this.state.configuration.loginRequired;
    // this.state.configuration.speech ? await import('js/utils/annyang.min.js') : ''; 
    /* Code Splitting works and now only request the resources on button click */
    const Account = this.state.auth.loginEnabled == 'false' ? false : 
      await import (/* webpackChunkName: "account" */ 'js/components/global/Account');
    const BigModal = this.state.configuration.showAllRecordsBtn == 'false' ? false : 
      await import(/* webpackChunkName: "bigmodal" */ 'js/components/global/BigModal');
    this.setState( { Account : Account.default , BigModal : BigModal.default } )
  }
  //
  // Load the Header and Body. As well Account/ Bigmodal conditionally
  //
  render () { 
    let state = this.state
    let stateFunctions = this.stateFunctions
    let returnThis = [
      <Header key='header' stateFunctions={stateFunctions} state={state} />,
      <Body key='body' stateFunctions={stateFunctions} state={state} />
    ]
    if(state.details && state.configuration.showAllRecordsBtn && state.BigModal){ 
      returnThis.push(<state.BigModal key='bigModal' state={state}/> 
      ) 
    }
    return <div style={style}> { returnThis } </div>
  }
}