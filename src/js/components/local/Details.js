import React, {Component} from 'react';


// This Component is used in the Navigation Panel. It is called on for every Layer of Data.
export default class Details extends Component {
  displayName: 'Details';
  constructor(props) { 
	super(props);
	this.giveDescription = this.giveDescription.bind(this);
  }

  // Describe the Layer
  async giveDescription(description){alert(description); }
  render () {
    const { layer, state, stateFunctions} = this.props;
    //  Create the form
    let formStuff = constructFormStuff(layer, stateFunctions);
    // Check if the layer already contains data. If so. Grab it.
    let removeButton = state.records ? true : false;
    removeButton = !state.records ? false : state.records[layer.host + '&' + layer.service + '&' + layer.layer];
    removeButton = !removeButton ? false :
      <button className='removeButton fa fa-times'
       onClick={stateFunctions.removed}
       title='Remove Layer'
       data-key={layer.key} />;

    let goButton = !layer.labelbutton ? '':
      <button className='GoButton fa fa-angle-double-right'
       onClick={stateFunctions.submitted}
       title='Search Layer'
       data-key={layer.key} />;
    let searchButton = 
      <button type='submit' className='searchButton'
        onClick={stateFunctions.submitted}
        title='Search!'
        data-key={layer.key} >
        Search! 
      </button>;

    // Reset Button
    let resetButton = !layer.searchfields ? '' :
      <button type='reset' title='Clear Search' onClick={stateFunctions.reset} >Reset </button>
    let layerDescription = layer.layerdescription ? layer.layerdescription : ''
    return (
	  <details>
	    <summary title={ layerDescription } > {layer.alias} { removeButton }{ goButton } </summary>
	    <form data-key={layer.key}>
	      { formStuff }
	  	  {searchButton}
	  	  {resetButton}
	    </form>
	  </details>
    )
  }
}



// handle every field in the form and construct its input (when appropriate).
function constructFormStuff(layer, stateFunctions) {
	return Object.keys(layer.fields).map( (field, i) => {
	  field = layer.fields[field];
	  // Check data at field
	  if ( field == undefined || field == null || (Object.keys(field).length === 0 && field.constructor === Object ) || field.filter == false ){ return }

	  // Prepair bound suggestions
	  let suggestionData = [];
	  if ( field.data ){ suggestionData = field.data; }    
	  if( field.boundto ){
		let boundToField = layer.fields.filter(function(k) { return k.name.trim() == field.boundto.trim()  })[0];
		let boundToName = boundToField.name.trim();
		let boundToData = boundToField.data ? boundToField.data : [];
		let curVal = field.curVal ?  field.curVal.trim().toUpperCase() : 'Enter Text';
		curVal = curVal == 'Enter Text' ? '' : curVal;
		// Only swap if datasets the input value exists in the foreign dataset
		let primaryFilter = boundToData.filter(function(k) { return k[boundToName].toUpperCase().includes(curVal)  });
		if( primaryFilter.length >= 1 ){
		  suggestionData = primaryFilter; 
		}
	  }
	  
	  // Create the Input
	  let input = field.filtertype == 'dropdown' ? 
		<Dropdownlist key={i+'l'} 
		  inputChange={stateFunctions.inputChange} 
		  field = {field} layer={layer} 
		  suggestions={suggestionData}/>
		  : 
		<Datalist key={i+'l'} 
		  inputChange={stateFunctions.inputChange} 
		  field = {field} layer={layer} 
		  suggestions={suggestionData}/>;
	  let descr = !field.description ? 'Search by Field' : field.description;
	  return ( [ <label key={i} title={ descr } > {field.alias} : </label>, input ] )
	})
}

// Return only objects with distinct Key:Value's
// Used for Removing duplicate suggestions & preping the actual values
function removeDuplicates(myArr, prop) {
  // strip out false values - except for 0
  myArr = myArr.filter(function(e){ return e === 0 || e });
  return myArr;
  return !myArr ? [] : myArr.filter((obj, pos, arr) => {
	return arr.map(mapObj => {
	  return mapObj[prop.trim()]
	}).indexOf(obj[prop.trim()]) === pos;
  })
}

// Dropdown Input
class Dropdownlist extends Component {
  render () {
  	const { inputChange, field, layer, suggestions } = this.props;
    let fieldName = field.name.trim();
	let placeholdertext = 'N/A';
	let suggestionData = removeDuplicates(suggestions, fieldName);
	if( suggestionData.length == 1 ){
	  let val = suggestionData[0][fieldName]
	  return ( <input data-field={fieldName} disabled={true} value={val} /> 
	  ) 
	}
	// Only Dropdown if Suggestions Exist
	if( suggestionData.length > 1 ){
	  return ( 
	    <select data-field={fieldName}> { ( !suggestionData ||  suggestionData == [] ) ? '' : (
	      suggestionData.sort( function(a, b){
	        if(a < b) return -1;
	        if(a > b) return 1;
	        return 0;
	      } ),
          suggestionData.map(function(option, i){
            return ( <option key={i} value={option}> {option} </option> 
            )
          } )
        ) }
        </select> 
	  )
	}
	return ( 
	  <input data-field={fieldName} placeholder={placeholdertext} disabled={true} /> 
	) 
  }
}

// Textbox Dropdown Input
class Datalist extends Component {
  render () {
	const { inputChange, field, layer, suggestions } = this.props;
	
  	//console.log('Textbox : ' + layer.alias + " " + field.alias)
    let fieldName = field.name.trim();
	let onChangeEvent = field.preloadfilter ? '' : inputChange;
	let suggestionData = removeDuplicates(suggestions, fieldName);
	if( suggestionData.length == 1 ){
		// So greenpatterns is a simpler structure than ArcGis suggestionData[0][fieldName]
	  return ( <input data-field={fieldName} disabled={true} value={suggestionData[0]} /> 
	) }
    let suggestionsData = ( !suggestionData ||  suggestionData == [] ) ? '' : 
      suggestionData.map(function(option, i){
        return <option key={i} value={option} /> 
      } )
	// Dropdown box suggestions
    return (
      [
        <input key='1' list={field.name}  name={name}
          placeholder='Enter Text' 
          onChange={inputChange}
          data-field={fieldName}
        />,
        <datalist key='2' id={field.name}> 
          { suggestionsData }  
        </datalist>
      ]
    )
  }
}