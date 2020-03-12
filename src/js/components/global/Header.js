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
  
  render () {
    // Get Settings from Appmodal
    const { state, stateFunctions } = this.props;
    let modals = state.modals;
    let logo = state.configuration.logo == 'HYPERLINKGOESHERE' ? 'Logo' : state.configuration.logo;
    let shortName = state.configuration.shortName.trim().toLowerCase()
    let location = './images/' + shortName.replace(/\s/g, "_") + '/'+ logo
    let longName = state.configuration.longName;
    let navigationLabel = state.configuration.navigationLabel;

    // The Modal Components onClick Event listener acts on these Menu labels. These are just the buttons.
    let turnOff = () => { stateFunctions.activeModal('NO') }
    let menuContent = []
    !modals ? '' : modals.map( (x, i) => {
      let modalHeader = x.modalheader.replace(/_/g, ' ')
      let viz = state.activeModal == modalHeader ? "block" : 'none';
      let innerContents = x.children.map(function(contentItem, i) {
        let style = (contentItem.properties && contentItem.properties.style) ? contentItem.properties.style : {};
        let href = (contentItem.properties && contentItem.properties.href) ? contentItem.properties.href : {};
        return ( e(contentItem.component, { key: i, style: style, href: href }, contentItem.children) )
      })
      if(x.buttonlabel != ''){
        menuContent.push( e('button', { key:i, 
          className: 'open_modal', 
          modalid:'modal_'+modalHeader , 
          onClick: () => { stateFunctions.activeModal(modalHeader) },
          title:'Click for more'
          }, modalHeader
        ) );
      }
      let modal = <div className = "modal_wrapper" style={ { display: viz } } key={'headerModal'+i} onClick={ turnOff } >
        <section className = 'modal_content' style={ { display: viz } }>
          <h2 > {this.props.state.configuration.longName} < /h2>
          <h3 style = { { 'top': '0px', 'position': 'sticky' } } > {modalHeader} < /h3> {innerContents} <br/>
          <button className = "toggle_view close_modal" onClick={ turnOff } tabIndex = "0" > OK < /button> 
        </section >
      </div>;
      menuContent.push( modal );
    } )

    // Add Account button
    let loggInEnabled = state.auth.loginEnabled != 'false'
    let loggedOut = state.auth.userInfo == false || state.auth.userInfo == undefined
    let labl = loggInEnabled && loggedOut ? "Login" : "Account"
    if ( loggInEnabled ){ menuContent.push( e('button', { key:labl, className: 'open_account_modal', onClick:()=>{stateFunctions.activeModal("Login") }, title:'Click for more'}, labl ) ) }
    if(state.auth.loginRequired && state.auth.loginEnabled && state.Account){
       menuContent.push( <state.Account key='account' stateFunctions={stateFunctions} state={state}/> ) 
    }

    // Description: 
    // affects CSS 'header_menu' Visibility (small screens only). 
    // affects css 'navigation_drawer', 'Context_drawer' top value.
    // Purpose: It needs to be done.
    // Output: change in View

    let toggleHeaderMenu = (event) => {
      var header_menu = document.getElementById('header_menu').style;
      var navigation_drawer = document.getElementById('navigation_drawer').style;
      var context_drawer = document.getElementById('context_drawer').style;
      let disp = header_menu.display;
      if(disp == 'flex' || disp == ''){
        context_drawer.top = '50px';
        navigation_drawer.top = '50px';
        header_menu.display =  'none'
      }
      else{
        context_drawer.top ='85px';
        navigation_drawer.top ='85px';
        header_menu.display =  'flex';
      }
    }
    let toggleNav = (event) => {
      var style = document.getElementById('context_drawer').style.display
      style = style == "none" || style == "" ? "flex" : style = "none";
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
          <button title={'Toggle navigation'}  onClick={ toggleNav } id='toggle_nav'>
            <div className='fa fa-bars'></div>
              {navigationLabel}
          </button>
        </nav>
        <figure> 
          <img  alt={logo+'logo'} title={'Site Name'} src={location} className="hidden-md-up" width="50px" height="50px"/> 
          <small title={'Site Name'} className="hidden-md-down">{longName}</small>  
        </figure>
        <button title={'Toggle Menu'}  onClick={ toggleHeaderMenu } id='toggle_header_menu'> Menu </button>
      </header>
    )
  }
}
