import React, {Component} from 'react';
const e = React.createElement;
import Details from 'js/components/local/Details';
import {SimpleDetails, sortDictionaries} from 'js/utils/utils';

export default class Login extends Component {
  displayName: 'Login';
  constructor(props) {
    super(props);
	this.state = { }
  }

  // Add navigation listeners after component mounts
  componentDidMount(){ 
    addLoginListeners()  
  }

  render () {
    const { state, stateFunctions } = this.props;
    let dictionaries = state.dictionaries;

    //let hi = await fetchData('./api/lol.php'); console.log(hi);
    let socialLogin = this.state.configuration.socialLogin;// - Checked in Modal
    console.log('socialLogin', socialLogin);

	// RETURN Controls
    return (
      <div id='login_modal'>
	    LOGIN
      </div>
    )
  }
}

// onClick Event Listener (Mal-Practice) that toggles the Login Modal
function addLoginListeners(){
  console.log('fuckinstarted');
  window.addEventListener("click", function(event) {
  	console.log('fuckinclicked')
  	console.log(event.target);
  	console.log(event.target.id);
    if (event.target == button) {
      console.log('fuckyea')
    }
  }	)
  var login_modal = document.getElementById('navigation_modal');
  var toggle_login = document.getElementById('toggle_login');
    toggle_login.addEventListener('click', function(){
      // Not sure if this segment can be reduced.
	  if(login_modal.style.display === ''){
	    if  (window.innerWidth < 801 ){ login_modal.style.display = 'none'; }
	    else { login_modal.style.display = 'flex'; }
	  }
	  // Toggle the Login Modal
	  if(login_modal.style.display === 'flex'){
	    login_modal.style.display = 'none'; 
	  } else{ login_modal.style.display = 'flex'; }
    });
}