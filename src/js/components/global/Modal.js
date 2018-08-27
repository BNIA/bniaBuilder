import React, { Component } from 'react';
const e = React.createElement;

export default class Modal extends Component {
  displayName: 'Modal';
  constructor(props) {
    super(props);
  }

  // Add Modal Event Listeners after the component mounts
  componentDidMount() { addModalListeners()  }
  shouldComponentUpdate(nextProps, nextState){ return false }
  render() {
    const { modal, appName } = this.props;
	// Get all the modals
	let modalContents = modal.map(function(modalContent, i) {
	  return ( 
	    < ModalContent key = { i } 
	      properties = { modalContent } 
	      appName = { appName } 
	    /> 
	  )
	} )

    // If not empty, create the Dropshadow and call the modal
    return !modalContents ? null : ( 
      < div className = "modal_wrapper" style={modal.style} >
        { modalContents }
      < /div >
    )
  }
}

class ModalContent extends Component {
  render() {
    const { properties, appName } = this.props;
    let Title = appName;
    let SubTitle = properties.modalheader;
    let SubtitleStyle = { 'top': '0px', 'position': 'sticky' }
    // Create the Content
    let innerContents = properties.children.map(function(contentItem, i) {
	  let style = (contentItem.properties && contentItem.properties.style) ? contentItem.properties.style : {};
	  let href = (contentItem.properties && contentItem.properties.href) ? contentItem.properties.href : {};
	  return ( e(contentItem.component, { key: i, style: style, href: href }, contentItem.children) )
	})
	// Create the Modal & Insert the Content
    return ( 
    < section className = 'modal_content' id = { 'modal_' + SubTitle } style = { properties.style } >
      < h2 > { Title } < /h2>
      < h3 style = { SubtitleStyle } > { SubTitle.replace(/_/g, ' ') } < /h3>  
      { innerContents} 
      <br/>
      < button className = "toggle_view close_modal" tabIndex = "0" > OK < /button> 
    < / section >
    )
  }
}

// Onclick Event Listener to remove AND open the Modal
function addModalListeners(){
  window.addEventListener('click', function(event) {
    var modal = document.getElementsByClassName('modal_wrapper')[0];
    // Close the modal
    if (event.target.classList.contains('close_modal')) { modal.style.display = "none" }
    if (event.target.classList.contains('modal_wrapper')) { event.target.style.display = "none"; }
  });
  // Add an event listener for all our buttons (the ones that open our modal);
  var modal_open = document.getElementsByClassName('open_modal');
  for (var i = 0; i < modal_open.length; i++) {
  	// add an event listener
	modal_open[i].addEventListener('click', function() {
	  // get all the modals and hide them
	  var modal_content_list = document.getElementsByClassName('modal_content');
	  for (var x = 0; x < modal_content_list.length; x++) {
		modal_content_list[x].style.display = 'none'
	  }
	  // find the modal with the id matching the onClick elements title and diplay it.
	  document.getElementById(this.getAttribute('modalid')).style.display = 'block';
	  document.getElementsByClassName('modal_wrapper')[0].style.display = "block"
	})
  }
}