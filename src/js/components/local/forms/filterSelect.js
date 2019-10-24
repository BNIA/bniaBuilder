import React, {Component} from 'react';
import {clean} from 'js/utils/utils';
import Select from 'react-select';

// Name : Dropdown List -> No Textbox
// Purpose : Display in the left hand drawer
// Input : field.preloadfilter, layer, suggestions
// Output : Event : inputChange, Display : 'textboxdropdown'

export class FilterSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suggestions : [],
    }
  }

  //  Updater
  componentDidMount(){ this.updateField( this.props ) }
  componentWillReceiveProps(nextProps){ this.updateField( nextProps ) }
  
  // Prepare the data
  updateField( props ){

    let  { layer, field, fieldName, suggestions } = props;
    let options = []
    if(typeof(suggestions)=='undefined'){ suggestions=[] }
    suggestions = suggestions.map( (suggestion, i) => { 
      options.push( { value: suggestion, label: suggestion } )
      return <option key={i} value={suggestion}> {suggestion} </option> 
    } )
    this.setState({ suggestions, options } )

  }

  // Now render it
  render () {
    let {suggestions, options} = this.state;
    let { inputChange, fieldName, layer} = this.props;
    
    if( suggestions.length == 1 ){
      return <input data-field={fieldName} disabled={true} type='text' name={fieldName} value={suggestions[0][fieldName]} /> 
    }
    else if( suggestions.length > 1 ){
      return <Select
        // defaultValue={[options[0], options[1]]}
        isMulti
        name={fieldName} 
        options={options}
        className="basic-multi-select"
        classNamePrefix="select"
      />
      return <select onChange={inputChange}  autoComplete={'off'} data-field={fieldName}> { suggestions } </select>
    }
    else{
      return <input data-field={fieldName} disabled={true} />
    }
  }
}

