import React, {Component} from 'react';
const e = React.createElement;
import Details from 'js/components/local/Details';
import Configuration from 'js/components/local/Configuration';
import { getSheets } from 'js/utils/sheets'
import { downloadObjectAsJson } from 'js/utils/utils.js'
import { fillDictionaries } from 'js/utils/dictionary'
import {SimpleDetails, downloadCsv} from 'js/utils/utils';

/*
#File: Account.js
#Author: Charles Karpati
#Date: Feb 2019
#Section: Bnia
#Email: karpati1@umbc.edu
#Description: Control User Settings
// Visibility Toggles on close_account_modal, open_account_modal click
// The Content is designed using the css modal_big_wrapper
#Purpose: Login, Logout, Acc Recovery, Acc Creation, Change Passwords 
#input: State, State Functions
#output: Updated State

// http://localhost/bniaBuilder/src/api/install.php

//
// Terms and service -> Read More
// Small Modal? Header like seen on the small modals? Headers? Sticky header? 
// Login Tabs: https://www.w3schools.com/howto/howto_js_tabs.asp
//
*/

// Small menu open on start
// Open menu when switching from Small to Big
// Search Through Menu. Reveal only what Was Searched

// Filter by Active Layers
// CSS Active Notification: https://www.w3schools.com/howto/howto_css_notification_button.asp

// Draggable Legend:  https://www.w3schools.com/howto/howto_js_draggable.asp
// Google Translate : https://www.w3schools.com/howto/howto_google_translate.asp
// Include HTML : https://www.w3schools.com/howto/howto_html_include.asp

export default class Account extends Component {
  constructor(props) {
    super(props);
    this.getSheets = this.getSheets.bind(this);
    this.state = { }
  }

  // Add Modal Event Listeners after the component mounts
  componentDidMount(){ addModalListeners() }

  // Download the google spreadsheet

  // 1) { getSheets } from 'js/utils/sheets'
  // 2) { fillDictionaries } from 'js/utils/dictionary'
  // 3) { downloadObjectAsJson } from 'js/utils/utils.js'

  async getSheets(event){
  	event.preventDefault();
  	console.log('Get Sheets');
    let target = event.target;
    let dropdowns = target.getElementsByTagName('select'); 
    // Get the sheets
    let resp = await getSheets( dropdowns[0].value );
    let jsonObject = {}
    if( resp == null){return null}
    else{
      resp.map( sheet => { jsonObject[sheet.title] = sheet.entry } )
      console.log('dictionary', jsonObject )
      let filledDictionaries = await fillDictionaries(jsonObject.layers);
      jsonObject.dictionaries = filledDictionaries;
      delete jsonObject.layers;
      downloadObjectAsJson( jsonObject, 'json_config' );
    }
  }

  render() {
  	let sf = this.props.stateFunctions

    let style = {display:'none'}
    let {state, stateFunctions} = this.props
    let loginEnabled = state.auth.loginEnabled
    let loginRequired = state.auth.loginRequired
    let loggedOut = state.auth.userInfo == false || state.auth.userInfo == undefined
    let innerContent = []
    let styling = {
    	maxHeight: '400px',
    	overflow: 'auto',
    }
    if( loginEnabled && loggedOut ){ 
      // Image
      let logo = <img src={state.configuration.image} key='accLoginImg' alt="Site Logo"/>
      innerContent.push(logo);

      // Log In
      let login_status = state.auth.loggedIn
      let account_login =
        <details key='details' open>
          <summary>Login</summary>
          {login_status}
		  <form className='acc_inputs'>
		    <label>Username</label> : <input type="text" name="username"/> <br/>
		    <label>Password</label> : <input type="password" autoComplete="on" name="password"/> <br/>
		    <button type='submit' className='account_login' onClick={ sf.account_login } title='Login!' >
			  Login!
		    </button>
		  </form>
	    </details>
	  innerContent.push(account_login)  


	  // Create
	  let status = '';
	  let created = state.auth['account_recovery']
	  status = created && created == 'success' ? 'Account Created!' : status 
	  status = created && created == 'failure' ? 'Account Not Created!' : status 
      let account_create =
	    <details key='acount_create'><summary>Account Creation</summary>
	      {status}
		  <form className='acc_inputs'>
		    <label>Email </label> : <input type="email" autoComplete="on" name="email"/> <br/>
		    <label>Company </label> : <input type="text" name="company"/> <br/>
		    <label>Firstname </label> : <input type="text" name="firstname"/> <br/>
		    <label>Lastname </label> : <input type="text" name="lastname"/> <br/>
		    <label>Phone </label> : <input type="text" name="phone"/> <br/>
		    <label>Username </label> : <input type="text" name="username"/> <br/>
		    <label>Password </label> : <input type="password" autoComplete="on" name="password" /> <br/>
		    <label>Verify Password </label> : <input type="password" autoComplete="on" name="repassword"/> <br/>
		    <button type='submit' onClick={ sf.account_create } title='account_create!' >
			  Create Account!
		    </button> 
		  </form>	      
		  {status}
	    </details>
	  innerContent.push(account_create)

	  // Recovery
	  status = '';
	  let sent = state.auth['account_recovery']
	  status = sent && sent == 'success' ? 'Email Sent!' : status 
	  status = sent && sent == 'failure' ? 'Email NOT Sent!' : status 
      let account_recovery =
	    <details key='account_recovery'><summary>Account Recovery</summary>
		  {status}
		  <form className='acc_inputs'>
		    <label> Username </label> : <input type="text" name="username"/> <br/>
		    <label> Email </label> : <input type="email" autoComplete="on" name="email" /> <br/>
		    <button type='submit' onClick={ sf.account_recovery } title='account_recovery!' >
			  Recover Account!
		    </button> 
		  </form>
		  {status}
	    </details>
	  innerContent.push(account_recovery)
	   
    }
    else{
      
      // Logout
      let account_logout = <button type='submit' 
        className = 'toggle_view logoutButton' onClick={ sf.account_logout } title='Logout!'  key='account_logout'>
          Logout!
        </button>; 
	  innerContent.push(account_logout)

      // Logout
      let close_menu = <button key='closeAccountModal' className = "toggle_view close_account_modal" tabIndex = "0" > Close Menu </button> 
	  innerContent.push(close_menu)


      // Image
      let logo = <img src={state.configuration.image} key='accLoginImg' alt="Site Logo"/>
      innerContent.push(logo);

      // Update User Info
      let ui = state.auth.userInfo
      let account_info = 
	    <details key='account_info' open><summary>Update User Information</summary>
		  <form className='acc_inputs'>    
		    <label> username </label> : <input type="text" name="username" placeholder={ui.username}/> <br/>
		    <label> firstname </label> : <input type="text" name="firstname" placeholder={ui.firstname}/> <br/>
	        <label> lastname </label> : <input type="text" name="lastname" placeholder={ui.lastname}/> <br/>
		    <label> email </label> : <input type="email" name="email" autoComplete="on" placeholder={ui.email}/> <br/>
		    <button type='submit' onClick={ sf.account_change } title='account_change!' >
			  Change Details!
		    </button> 
		  </form>
	    </details>
	  innerContent.push(account_info)

      // Change Password
      let account_change =
	    <details key='account_change'><summary>Change Password</summary>
		  <form className='acc_inputs'>    
		    <label> Username </label> : <input type="text" name="username"/> <br/>
		    <label> Old Password </label> : <input type="password" autoComplete="on" name="oldpassword"/> <br/>
	        <label> New Password </label> : <input type="password" autoComplete="on" name="password"/> <br/>
		    <label> New Password Repeated </label> : <input type="password" autoComplete="on" name="repassword"/> <br/>
		    <button type='submit' onClick={ sf.account_change } title='account_change!' >
			  Change Details!
		    </button> 
		  </form>
	    </details>
	  innerContent.push(account_change)

      // Download GSS
	  let downloadit = true;
      let downloadgss =
	    <details key='downloadgss'><summary>Downlaod Google Spreadsheet</summary>
	      <form key='dlgss' className='acc_inputs' onSubmit={this.getSheets}>
		    <select>
		      <option value="null">Select Spreadsheet</option>
		      <option value="104n5euHSIGZnKdcPozPRkPqFficwW8b2ERLCqy0px_c">BOLD</option>
		      <option value="1PpzuE3dwuXxN8HIckuaK2DbrXEbxOlVrDM5HWsVuDIw">GreenPatterns</option>
		      <option value="234">BIP</option>
		      <option value="1127B86Jm5nKxzbXRVEFR18F0z1Dv3tk6okTkRMZdtJU">Developers</option>
		    </select>
		    <button type='submit' title='downloadgss!'  > Download Spreadsheet! </button>
	      </form>
	    </details>
	  innerContent.push(downloadgss)
      
      // 
      // Configuration
      // 
      let config = <Configuration key='configuration' state={state}/>
	  innerContent.push( config )

    }

    return ( 
      < div className = "modal_big_wrapper" style={style}>
		< section className='modal_big_content'>
          {innerContent}
          <button className = "toggle_view close_account_modal" tabIndex = "0" > OK < /button> 
		< / section >
      < /div >
    ) 
  }
}

// Onclick Event Listener to remove AND open the Modal
function addModalListeners(){
  window.addEventListener('click', function(event) {
  	// Close Button was clicked
    if (event.target.classList.contains('close_account_modal')) { 
      document.getElementsByClassName('modal_big_wrapper')[0].style.display = "none" 
    }
    // The Outside of the modal was clicked
    if (event.target.classList.contains('modal_big_wrapper')) { 
      event.target.style.display = "none"; 
    }
    // The Show All Button was clicked.
    if (event.target.classList.contains('open_account_modal')) { 
      document.getElementsByClassName('modal_big_wrapper')[0].style.display = "block"
    }
  } );
}