import React, {Component} from 'react';
const e = React.createElement;
import Details from 'js/components/local/Details';
import {SimpleDetails, sortDictionaries} from 'js/utils/utils';

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
        return ( < Details  key={i} layer = { group[0][0] } state = {state} stateFunctions= { stateFunctions } /> 
      ) }
      // Multiple Layers in Group
      let detailContent = group.map((subgroup, i)=>{
      	// Layer is not a SubGroup
        if (subgroup[0]['subgroup'] == false){ return subgroup.map( (item, i) => {return < Details  key={i} layer = { item } state={state} stateFunctions={stateFunctions} /> }) }
        // Layer is a subgroup
        let subgroupContent = subgroup.map( (item, i) => { return <Details key={i} layer={ item } state={state} stateFunctions={stateFunctions}/> } )
        return SimpleDetails(subgroup[0]['subgroup'], subgroupContent);
      } );
      return SimpleDetails(group[0][0]['group'], detailContent);
    } );
    let promptStyle={padding:'10%', width: '80%'}
    //( sorted by most recent year )

    let prompt = 
      <div style={promptStyle}>
        <p> <b> Please Note : </b> </p>
        <ul>
          <li> Searching <b>Property Events</b> and <b>Property Information</b> should take no longer than 10 seconds and yield no more than <u>500 records</u> per request</li>
        </ul>
      </div>
    // only show tableview if table webadmin set tableview  to true
    let toggleTableView = !state.configuration.dataTable ? prompt : [
      <h3 key='togh3'>Display : </h3>,
      <button key='togtab' className='toggle_view' data-localview='table'> Table </button>, 
      <button key='togmap' className='toggle_view' data-localview='map'> Map </button>, 
      ]
    toggleTableView = state.userHasSearched ? toggleTableView : prompt; // no records no tableview!
	// RETURN Controls
    return (
      <aside id='navigation_drawer'>
	    <section> {controller} </section>
	    <div id='mainNav'>
         {toggleTableView}
	    </div>
      </aside>
    )
  }
}

// onClick Event Listener (Mal-Practice) that toggles the Navigation Drawer
function addNavigationListeners(){
  var navigation_drawer = document.getElementById('navigation_drawer');
  var toggle_nav = document.getElementsByClassName('toggle_nav');
    for (var i = 0; i < toggle_nav.length; i++) {
    toggle_nav[i].addEventListener('click', function(){
      // Style properties are == '' by default. 
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
}

// The offset is what is taking esri so long.