import React, { Component } from 'react';
import {FilterDatalist} from 'js/components/local/forms/filterDatalist';
import {FilterDropdown} from 'js/components/local/forms/filterDropdown';
import {FilterSelect} from 'js/components/local/forms/filterSelect';
import {FilterCheckbox} from 'js/components/local/forms/filterCheckbox';

//
// Called from Details
// Calls Forms/inputs
//

//
// returns an array of <Divs> with <labels> and <Inputs_with_Types_Choosen_Dynamically> 
// Inputs are of type 
// 'DROPDOWN' using component <FilterDropdown> 
// 'CHECKBOX' using components <FilterSelect> and <FilterCheckbox>, and default Datalists -> FilterSelect uses react-select
// Defaults use component <FilterDatalist>
// 
//

export default class Form extends Component {

  render () {     
    const { layer, stateFunctions, prepdSug } = this.props;
    // map through the fields
    if (!layer.fields){ return []; }
    let attempt = Object.keys(layer.fields).map( (field, i) => {

      field = layer.fields[field];
      if ( (!field || field.filter == false) && typeof(field.filter) != 'string' ){ return }

      let prepd = prepdSug ? prepdSug[i] ? prepdSug[i] : [] : []; 
      let fieldName = field.name.trim();

      // Create the Input -> eventhandler, layer, field, fieldname, suggestions
      
      // DropDownList
      let input = field.filtertype != 'dropdown' ? false :
        <FilterDropdown key={i+'l'} inputChange={stateFunctions.inputChange} field={field} layer={layer} fieldName={field.name.trim()} suggestions={prepd}  />

      // Radio Buttons
      input = input != false ? input : field.filtertype != 'checkbox' ? false :
        <FilterSelect key={i+'l'} inputChange={stateFunctions.inputChange} field={field} layer={layer} fieldName={field.name.trim()} suggestions={prepd}  />


      // Checkbox Buttons
      //input = input != false ? input : field.filtertype != 'checkbox' ? false :
      //  <FilterCheckbox key={i+'l'} inputChange={stateFunctions.inputChange} field={field} layer={layer} fieldName={field.name.trim()} suggestions={prepd}  />

      // DataList
      input = input != false ? input : 
        <FilterDatalist     key={i+'j'} inputChange={stateFunctions.inputChange} field={field} layer={layer} fieldName={field.name.trim()} suggestions={prepd} />

      let descr = !field.description ? 'Search by Field' : field.description;

      return (
        <div key={i} className='formField'> 
          <label key={i} title={ descr }> {field.alias} : </label>
          {input}
        </div>
      )
    })
    return attempt
  }
}
