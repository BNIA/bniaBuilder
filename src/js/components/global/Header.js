import React, {Component} from 'react';

const e = React.createElement;

const config_header = {
  style : {},
  properties : {},
  sections: [ ]
};

export default class Header extends Component {
  displayName: 'Header';

  // add Header Event Listeners after the component mounts
  componentDidMount(){ addHeaderListeners()  }

  render () {
    // Get Settings from App
    const { state } = this.props;
    let modals = state.modals;
    let logo = state.configuration.logo == 'HYPERLINKGOESHERE' ? 'Logo' : state.configuration.logo;
    let style={ textAlign: 'left', position: 'absolute', left: '5px', top : '2px', height: '30px' }
    let location = './images/' + logo
    let longName = state.configuration.longName;
    let navigationLabel = state.configuration.navigationLabel;

    // The Modal Components onClick Event listener acts on these Menu labels.
    let menuContent = !modals ? '' : modals.map(function(x, i){
      if(x.buttonlabel != ''){ return (
        e('button', { key:i, className: 'open_modal', title:'modal_'+x.modalheader}, x.modalheader.replace(/_/g, ' ') )
      ) }
    })

    return (
      <header>
        <menu id='header_menu'>
          <figure> 
            <img src={location} className="hidden-md-down" alt={logo} style={style} /> 
          </figure>
          { menuContent }
        </menu>

        <nav id='global_navigation' className="global_navigation" role="navigation" aria-label="global_navigation">
          <button className='toggle_nav'>
            <div className='fa fa-bars'></div>
              {navigationLabel}
          </button>
        </nav>

        <figure> 
          <img src={location} className="hidden-md-up" alt={logo} width="50px" height="50px"/> 
          <small className="hidden-md-down">{longName}</small>  
        </figure>

        <button id='toggle_header_menu'> Menu </button>
      </header>
    )
  }
}

// onClick Event Listener (Mal-Practice) that toggles the View 
function addHeaderListeners(){
  window.addEventListener('click', function(event){
    var header_menu = document.getElementById('header_menu');
    var navigation_drawer = document.getElementById('navigation_drawer');
    var context_drawer = document.getElementById('context_drawer');

    if (event.target.id == 'toggle_header_menu') {
    if(header_menu.style.display === 'flex'){
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