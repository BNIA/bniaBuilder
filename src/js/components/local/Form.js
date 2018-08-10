import React, { Component } from 'react';
import {Datalist} from 'js/components/local/filterDatalist';
import {Dropdownlist} from 'js/components/local/filterDropdown';

export default class Form extends Component {

  render () {
    const { layer, stateFunctions, prepdSug } = this.props;
    
    if (!layer.fields){ return []; }
    let attempt = Object.keys(layer.fields).map( (field, i) => {
      field = layer.fields[field];
      if ( !field || field.filter == false ){ return }

       // Use Web-Worker Preped Data
      let prepd = prepdSug ? prepdSug[i] ? prepdSug[i] : [] : [];
      let fieldName = field.name.trim();

      // Create the Input -> eventhandler, layer, field, fieldname, suggestions
      let input = field.filtertype != 'dropdown' ? false :
        <Dropdownlist key={i+'l'} inputChange={stateFunctions.inputChange} field={field} layer={layer} fieldName={field.name.trim()} suggestions={prepd}  />

      input = input != false ? input : 
        <Datalist     key={i+'j'} inputChange={stateFunctions.inputChange} field={field} layer={layer} fieldName={field.name.trim()} suggestions={prepd} />

      let descr = !field.description ? 'Search by Field' : field.description;
      return ( [ <label key={i} title={ descr } > {field.alias} : </label>, input 
      ] )
    })
    return attempt
  }
}
