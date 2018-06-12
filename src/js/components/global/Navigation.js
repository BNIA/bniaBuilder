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
  componentDidMount(){ addNavigationListeners()  }

  render () {
    const { state, stateFunctions } = this.props;
    let dictionaries = state.dictionaries;
    // Map the groups, subgroups and layers into corresponding 'Details' panes
    let controller = sortDictionaries(dictionaries).map( function(group, i){
      // Layer Stands Alone
      if (group.length == 1 && group[0].length == 1) { 
        return ( < Details  key={i} layer = { group[0][0] } stateFunctions= { stateFunctions } /> 
      ) }
      // Multiple Layers in Group
      let detailContent = group.map(function(subgroup, i){
      	// Layer is not a SubGroup
        if (subgroup[0]['subgroup'] == false){ return subgroup.map( (item, i) => {return < Details  key={i} layer = { item } state={state} stateFunctions={stateFunctions} /> }) }
        // Layer is a subgroup
        let subgroupContent = subgroup.map( (item, i) => { return <Details key={i} layer={ item } state={state} stateFunctions={stateFunctions}/> } )
        return SimpleDetails(subgroup[0]['subgroup'], subgroupContent);
      });
      return SimpleDetails(group[0][0]['group'], detailContent);
    });
    let toggleTableView = !state.configuration.dataTable ? '' : 
      <button id='toggle_view'> 
        <div className='view_1'>
          Show on Table
        </div>
        <div className='view_2'>
          Show on Map
        </div>
      </button>;
	// RETURN Controls
    return (
      <aside id='navigation_drawer'>
	    <section> {controller} </section>
	    {toggleTableView}
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