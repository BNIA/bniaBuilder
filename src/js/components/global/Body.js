import React, {Component} from 'react';

import Navigation from 'js/components/global/Navigation';
import Context from 'js/components/global/Context';
import Dashboard from 'js/components/local/Dashboard';
import DataTable from 'js/components/local/DataTable'
import Map from 'js/components/local/Map'

/*
#File: Body.js
#Author: Charles Karpati
#Date: Feb 2019
#Section: Bnia
#Email: karpati1@umbc.edu
#Description: 
#Purpose: 
#input: State, State Functions
#output: the View
*/

export default class Body extends Component {
  displayName: 'Body';

  // Add navigation listeners after component mounts
  componentDidMount(){ changeViewListener()  }

  render () {
    const { stateFunctions, state} = this.props;
    let contextDrawerBtn = state.configuration.map ? (  <button className='toggle_context_drawer'> Property Details </button>  ) : null;
    let mapData = state.configuration.map ? ( <Map state={state}  stateFunctions={stateFunctions}/> ) : false;
    let tableData = state.configuration.dataTable ? (   <DataTable state={state} />  ) : false;
    let dashBoard = ( !tableData && !mapData ) ? ( <Dashboard state={state} /> ) : false;
    let toggleDashboard = state.userInfo != undefined ? ( <Dashboard state={state} /> ) : false;   

    return ( 
	  <main > 
		<Navigation state={state} stateFunctions={stateFunctions} />
		{ contextDrawerBtn }
		<section className='view_1'> 
          <Dashboard state={state} />
		  { mapData ? mapData : null }
		</section>
		<section className='view_2'> { (mapData && tableData ) ? tableData : null } </section>
		<Context state={state} stateFunctions={stateFunctions} />
	  </main>
    );
  }
}

/*
#Description: Event Listener Toggles Visibility of Body Content
// View 1 : Dashboard
// View 1 : Map 
// View 2 : Table
#Purpose: 
#input: 
#output: 
*/
function changeViewListener(){
  window.addEventListener('click', function( event ){
  	let goto = event.target.dataset ? true : false;
  	goto = (goto && event.target.dataset.localview) ? 
  	                event.target.dataset.localview : false;
    let view1 = document.getElementsByClassName("view_1");
	let map = document.getElementById("mapid")
	let dash = document.getElementById("dashboardid")
	let view2 = document.getElementsByClassName("view_2");
	if ( goto == 'table' ){
	  for( let i=0; i < view1.length; i++){
	  	view1[i].style.display='none'
	  	view2[i].style.display='block'
	  }
	}
	if ( goto == 'map' ){
	  console.log('goto map', map)
	  for( let i=0; i < view2.length; i++){
	  	view1[i].style.display='block'
	  	view2[i].style.display='none'
	  	dash.style.display='none'
	  	map.style.display='block'
	  }
	}
	if ( goto == 'dashboard' ){
	  console.log('dashactivated')
	  for( let i=0; i < view2.length; i++){
	  	view1[i].style.display='block'
	  	view2[i].style.display='none'
	  	dash.style.display='block'
	  	map.style.display='none'
	  }
	}
  } )
}