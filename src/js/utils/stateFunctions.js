import React, {Component} from 'react';

import { serializeFormInputs } from 'js/utils/utils.js'
import {fetchData} from 'js/utils/utils';

  //
  // Account Functions
  //

  // Account Creation
export async function account_create(event){ 
    console.log('Account Create')
    event.preventDefault()
    let form = event.target.form;
    let formVals = await serializeFormInputs(form)
    let update = await fetchData('./api?purpose=account_create&'+formVals);
    console.log(('./api?purpose=account_create&'+formVals));
    console.log(update)
    let auth = this.state.auth
    auth['account_created'] = update[0]
    this.setState( { auth } );
  }
  // Account Recovery
export async function account_recovery(event){ 
    console.log('Account Recover')
    event.preventDefault()
    let form = event.target.form;
    let formVals = await serializeFormInputs(form)
    let update = await fetchData('./api?purpose=account_recovery&'+formVals);
    console.log(('./api?purpose=account_recovery&'+formVals));
    console.log(update)
    let auth = this.state.auth
    auth['account_recovery'] = update[0]
    this.setState( { auth } );
  }
  // Login
export async function account_login(event){ 
    event.preventDefault()
    let form = event.target.form;
    let formVals = await serializeFormInputs(form)
    let update = await fetchData('./api?purpose=account_login&'+formVals);
    console.log('./api?purpose=account_login&'+formVals)
    let auth = this.state.auth
    // These Values come from the server
    if(update[0] != 'Account Blocked' && update[0] != 'Invalid Credentials'){
      auth['loggedIn'] = true
      auth['userInfo'] = update[0]  }
    else{ auth['loggedIn'] = update[0]; }
    console.log("auth['loggedIn'] : ", auth['loggedIn'])
    this.setState( { auth } );
  }
  // Change Password
export async function account_update(event){ 
    console.log(' Change Password')
    event.preventDefault()
    this.setState( { 'userInfo': false } );
  }
  // Logout
export async function account_logout(event){
    event.preventDefault()
    let auth = this.state.auth
    auth['userInfo'] = false
    this.setState( { auth } );
  }



  //
  // Query Functions
  //

  // Get Search Suggestions
export async function handleChange(event){
    // The currentFormsData is retrieved on input keypres using getFieldSuggestion()
    // onkeypress="this.style.width = ((this.value.length + 1) * 8) + 'px';"
    let update = await (getFieldSuggestion(event, this.state.dictionaries) );
    this.setState({ dictionaries: update } );
  }
  // Perform Query 
export async function handleSubmit(event){
    // When a user clicks 'Search' our 'STATE.RECORDS' += layer['currentFormsData'] 
    let updates = await handleSubmit(event, this.state.records, this.state.dictionaries);
    this.setState( { dictionaries: updates, 'userHasSearched' : true } );
  }
  // Retrieve Associated Records
export async function showDetails(event){
    // Query all Connected Records at Block_lot. get Parcel?
    console.log('showDetails', event)
    let update = await ( getDetails(event, this.state ) );
    let details = update;
    this.setState( { 'details' : details } );
  }
  // Reset Suggestions & Form Field Curvals
export async function handleReset(event){
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
  // Remove a Clicked Layer.
export async function handleRemove(event){
    let key = event.target.dataset.key;
    let dictionaries = this.state.dictionaries;
    let layer = dictionaries.filter(layer => { return layer.key == key  })[0];
    delete layer['dataWithCoords'];
    this.setState( { dictionaries } );
  }