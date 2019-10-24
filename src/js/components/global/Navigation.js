import React, {Component} from 'react';
const e = React.createElement;
import Details from 'js/components/local/Details';
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';
import {SimpleDetails, sortDictionaries} from 'js/utils/utils';

/*
#File: Navigation.js
#Author: Charles Karpati
#Date: Feb 2019
#Section: Bnia
#Email: karpati1@umbc.edu
#Description: Toggles Main Views and controller of content. 
// Dictionaries are sorted for visualization purposes.
#Purpose: Access 'Map' 'Table' 'Dashboard' views and Perform Queries
#input: State, State Functions
#output: Updated State, View
*/

export default class Navigation extends Component {
  displayName: 'Navigation';
  constructor(props) {
    super(props);
	this.state = { }
  }

  // Add navigation listeners after component mounts
  componentDidMount(){ 
    addNavigationListeners()  
  }

  render () {
    const { state, stateFunctions } = this.props;
    let dictionaries = state.dictionaries;

    // Map the groups, subgroups and layers into corresponding 'Details' panes
    let controller = sortDictionaries(dictionaries).map( (group, i) => {
      // Layer Stands Alone
      if (group.length == 1 && group[0].length == 1) { 
        return < Details  key={i} layer = { group[0][0] } state = {state} stateFunctions= { stateFunctions } /> 
      } 
      // Multiple Layers in Group
      let detailContent = group.map( (subgroup, i)=>{
      	// Layer is not a SubGroup
      	let flag = subgroup[0]['subgroup'] == false
        if (flag){ 
          return subgroup.map( (item, i) => { return [< Details  key={i} layer = { item } state={state} stateFunctions={stateFunctions} /> ] } ) 
        }
        // Layer is a subgroup
        let subgroupContent = subgroup.map( (item, i) => { 
          return < Details  key={i} layer = { item } state={state} stateFunctions={stateFunctions} /> 
        } )
        return SimpleDetails(subgroup[0]['subgroup'], subgroupContent)
      } )
      return SimpleDetails(group[0][0]['group'], detailContent)
    } )

    // 
    // Table / Map 
    // CONNECTS BODY USING DATA-LOCALVIEW 
    // Dashboard Only on userInfo ( logged in )
    let prompt = <div>{ ReactHtmlParser( this.props.state.configuration.navPrompt) }</div>;

	let table = !state.configuration.dataTable ? false : <button key='togtab' className='toggle_view' data-localview='table'> Table </button> ;
	let map = !state.configuration.map ? false : <button key='togmap' className='toggle_view' data-localview='map'> Map </button>;
	//let dashboard = !state.auth.userInfo ? false : <button key='togdas' className='toggle_view' data-localview='dashboard'> Dashboard </button>;
	let dashboard = <button key='togdas' className='toggle_view' data-localview='dashboard'> Dashboard </button>;
	
	// If more than 3 existt show tabs otherwise show the prompt
	let count = 0;
	table ? count++ : false;
	map ? count++ : false;
	dashboard ? count++ : false;
	// console.log('TOGGLE VIEW', table, dashboard, count);
	// console.log('TOGGLE THIS', state.auth)
    let toggleTableView = count == 1 ? prompt : [
      <h3 key='togh3'>Display : </h3>,
      table, map, dashboard
    ]


    // 
    // Dashboard 
    // CONNECTS TO SCRIPT IN BODY USES DATA-LOCALVIEW 
    // Only on userInfo ( logged in ) 
    // 

	// RETURN Controls  <button id='toggle_login'> LOGIN </button>
    return (
      <aside id='navigation_drawer'>
	    <section> {controller} </section>
	    <div id='mainNav'>
	     <div title='Loading...' className="loader"></div>
         {toggleTableView}
	    </div>
      </aside>
    )
  }
}
/*
#Description: onClick 'toggle_nav' Event Listener (Mal-Practice) effects the 'navigation_drawer'
#Purpose: It needs to be done.
#input: 
#output: Change in View
*/
function addNavigationListeners(){
  var navigation_drawer = document.getElementById('navigation_drawer');
  var toggle_nav = document.getElementById('toggle_nav');
    toggle_nav.addEventListener('click', function(){
      // Not sure if this segment can be reduced.
	  if(navigation_drawer.style.display === ''){
	    if  (window.innerWidth < 801 ){ navigation_drawer.style.display = 'none'; }
	    else { navigation_drawer.style.display = 'flex'; }
	  }
	  // Toggle the Navigation Drawer
	  if(navigation_drawer.style.display === 'flex'){
	    navigation_drawer.style.display = 'none'; 
	  } else{ navigation_drawer.style.display = 'flex'; }
    });
}