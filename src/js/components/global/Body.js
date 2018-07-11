import React, {Component} from 'react';

import Navigation from 'js/components/global/Navigation';
import Context from 'js/components/global/Context';
import Dashboard from 'js/components/local/Dashboard';
import DataTable from 'js/components/local/DataTable'

import Map from 'js/components/local/Map'

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


    return (
	  <main>
		<Navigation state={state} stateFunctions={stateFunctions} />
		{ contextDrawerBtn }
		<section className='view_1'> 
		{ mapData ? mapData : 'null' }
		{ (!mapData && tableData ) ? tableData : null } 
		{ dashBoard }
		</section>
		<section className='view_2'> { (mapData && tableData ) ? tableData : null } </section>
		<Context state={state} stateFunctions={stateFunctions} />
	  </main>
    );
  }
}


function changeViewListener(){
  window.addEventListener('click', function( event ){
  	let goto = event.target.dataset ? true : false;
  	goto = (goto && event.target.dataset.localview) ? 
  	                event.target.dataset.localview : false;
    let view1 = document.getElementsByClassName("view_1");
	let view2 = document.getElementsByClassName("view_2");
	if ( goto == 'table' ){
	  for( let i=0; i < view1.length; i++){
	  	view1[i].style.display='none'
	  	view2[i].style.display='block'
	  }
	}
	if ( goto == 'map' ){
	  for( let i=0; i < view2.length; i++){
	  	view2[i].style.display='none'
	  	view1[i].style.display='block'
	  }
	}
  } )
}