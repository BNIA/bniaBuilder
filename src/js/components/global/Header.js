import React, {Component} from 'react';

const e = React.createElement;

/*
#File: Header.js
#Author: Charles Karpati
#Date: Feb 2019
#Section: Bnia
#Email: karpati1@umbc.edu
#Description: 
#Purpose: Logo, Static Content, Account Stuffs
#input: State, State Functions
#output: the View
*/

export default class Header extends Component {
  displayName: 'Header';

  // add Header Event Listeners after the component mounts
  componentDidMount(){ addHeaderListeners()  }
  
  render () {
    // Get Settings from Appmodal
    const { state } = this.props;
    let modals = state.modals;
    let logo = state.configuration.logo == 'HYPERLINKGOESHERE' ? 'Logo' : state.configuration.logo;
    let shortName = state.configuration.shortName.trim().toLowerCase()
    let location = './images/' + shortName.replace(/\s/g, "_") + '/'+ logo
    let longName = state.configuration.longName;
    let navigationLabel = state.configuration.navigationLabel;

    // The Modal Components onClick Event listener acts on these Menu labels. These are just the buttons.
    let menuContent = !modals ? '' : modals.map( (x, i) => {
      if(x.buttonlabel != ''){ return (
        e('button', { key:i, 
          className: 'open_modal', 
          modalid:'modal_'+x.modalheader , 
          title:'Click for more'
          }, x.modalheader.replace(/_/g, ' ') )
      ) }
    }) 
    
    // Add Account button
    let loggInEnabled = state.auth.loginEnabled != 'false'
    let loggedOut = state.auth.userInfo == false || state.auth.userInfo == undefined
    if( loggInEnabled && loggedOut ){ 
      menuContent.push( e('button', { key:'login', className: 'open_account_modal', title:'Click for more'}, 'Login' ) )
    }
    else if ( loggInEnabled && !loggedOut ){
      menuContent.push( e('button', { key:'account', className: 'open_account_modal', title:'Click for more'}, 'Account' ) )
    }

    return (
      <header>
        <menu id='header_menu'>
          <figure> 
            <img alt={logo + 'logo'} src={location} title={'Logo Image'} className="hidden-md-down" style={{ textAlign: 'left', position: 'absolute', left: '5px', top : '2px', height: '30px' } } /> 
          </figure>
          { menuContent }
        </menu>
        <nav role="navigation">
          <button title={'Toggle navigation'} id='toggle_nav'>
            <div className='fa fa-bars'></div>
              {navigationLabel}
          </button>
        </nav>
        <figure> 
          <img  alt={logo+'logo'} title={'Site Name'} src={location} className="hidden-md-up" width="50px" height="50px"/> 
          <small title={'Site Name'} className="hidden-md-down">{longName}</small>  
        </figure>
        <button title={'Toggle Menu'} id='toggle_header_menu'> Menu </button>
      </header>
    )
  }
}


/*
#Description: onClick Event Listener (Mal-Practice) 'toggle_header_menu' 
  // affects CSS 'header_menu' Visibility (small screens only). 
  // affects css 'navigation_drawer', 'Context_drawer' top value.
#Purpose: It needs to be done.
#input:
#output: change in View
*/
function addHeaderListeners(){
  window.addEventListener('click', function(event){
    var header_menu = document.getElementById('header_menu');
    var navigation_drawer = document.getElementById('navigation_drawer');
    var context_drawer = document.getElementById('context_drawer');

    if (event.target.id == 'toggle_header_menu') {
      let disp = header_menu.style.display;
      if(disp === 'flex' || disp == ''){
        context_drawer.style.top = '50px';
        navigation_drawer.style.top = '50px';
        header_menu.style.display =  'none'
      }
      else{
        context_drawer.style.top ='85px';
        navigation_drawer.style.top ='85px';
        header_menu.style.display =  'flex';
      }
    }
    if (event.target.className == 'toggle_context_drawer') {
      var x = document.getElementById('context_drawer');
      if (x.style.display === "none" || x.style.display === "") {
        document.getElementById('context_drawer').style.display = "flex";
      }
      else { x.style.display = "none"; }
    }
  });
}