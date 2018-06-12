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
    let contextDrawerBtn = state.configuration.map ? (  <button className='toggle_context_drawer'> Property Details </button>  ) : false;
    let mapData = state.configuration.map ? ( <Map state={state}  stateFunctions={stateFunctions}/> ) : false;
    let tableData = state.configuration.dataTable ? (   <DataTable response={state.records} />  ) : false;
    let dashBoard = ( !tableData && !mapData ) ? ( <Dashboard state={state} /> ) : false;


    return (
	  <main>
		<Navigation state={state} stateFunctions={stateFunctions} />
		<section className='view_1'> 
		{ contextDrawerBtn ? contextDrawerBtn : null }
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
    let view1 = document.getElementsByClassName("view_1");
	let view2 = document.getElementsByClassName("view_2");
	if ( event.target.classList.contains('view_1') ) {
	  for( let i=0; i < view1.length; i++){
	  	console.log( view1[i] )
	  	view1[i].style.display='none'
	  	view2[i].style.display='block'
	  }
	}
	if ( event.target.classList.contains('view_2') ) {
	  for( let i=0; i < view2.length; i++){
	  	console.log( view1[i] )
	  	view2[i].style.display='none'
	  	view1[i].style.display='block'
	  }
	}
  } )

}