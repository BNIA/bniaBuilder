import React, {Component} from 'react';
import Modal from 'js/components/global/Modal';

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
  shouldComponentUpdate(nextProps, nextState){ return false }
  
  render () {
    // Get Settings from Appmodal
    const { state} = this.props;
    let modals = state.modals;
    let logo = state.configuration.logo == 'HYPERLINKGOESHERE' ? 'Logo' : state.configuration.logo;
    let shortName = state.configuration.shortName.trim().toLowerCase()
    let style={ textAlign: 'left', position: 'absolute', left: '5px', top : '2px', height: '30px' }
    let location = './images/' + shortName + '/'+ logo
    let longName = state.configuration.longName;
    let navigationLabel = state.configuration.navigationLabel;

    // The Modal Components onClick Event listener acts on these Menu labels.
    let menuContent = !modals ? '' : modals.map(function(x, i){
      if(x.buttonlabel != ''){ return (
        e('button', { key:i, className: 'open_modal', modalid:'modal_'+x.modalheader , title:'click for more'}, x.modalheader.replace(/_/g, ' ') )
      ) }
    })

    return (
      <header>
        <menu id='header_menu'>
          <Modal modal={state.modals} appName={state.configuration.longName}/>
          <figure> 
            <img alt={logo + 'logo'} src={location} title={'Logo Image'} className="hidden-md-down" style={style} /> 
          </figure>
          { menuContent }
        </menu>
        <nav id='global_navigation' className="global_navigation" role="navigation" aria-label="global_navigation">
          <button title={'Toggle navigation'} id='toggle_nav'>
            <div className='fa fa-bars'></div>
              {navigationLabel}
          </button>
        </nav>
        <figure> 
          <img  alt={logo+'logo'} title={'Site Name'} src={location} className="hidden-md-up" width="50px" height="50px"/> 
          <small title={'Site Name'} className="hidden-md-down">{longName}</small>  
        </figure>
        <div title='Loading...' className="loader"></div>
        <button title={'Toggle Menu'} id='toggle_header_menu'> Menu </button>
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