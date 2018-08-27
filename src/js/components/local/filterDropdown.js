import React, {Component} from 'react';
import {clean} from 'js/utils/utils';

// Name : Dropdown List
// Purpose : Display in the left hand drawer
// Input : field.preloadfilter, layer, suggestions
// Output : Event : inputChange, Display : 'textboxdropdown'

export class Dropdownlist extends Component {
  displayName: 'Dropdown';
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
    if(typeof(suggestions)=='undefined'){ suggestions=[] }
    suggestions = suggestions.map( (suggestion, i) => { 
      return <option key={i} value={suggestion}> {suggestion} </option> 
    } )
    this.setState({ suggestions } )
  }

  // Now render it
  render () {
    let {suggestions} = this.state;
    let { inputChange, fieldName, layer} = this.props;

    if( suggestions.length == 1 ){
      return <input data-field={fieldName} disabled={true} value={suggestions[0][fieldName]} /> 
    }
    else if( suggestions.length > 1 ){
      return <select onChange={inputChange}  autoComplete={'off'} data-field={fieldName}> { suggestions } </select>
    }
    else{
      return <input data-field={fieldName} disabled={true} />
    }
  }
}