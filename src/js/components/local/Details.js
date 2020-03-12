import React, {Component} from 'react';
import Form from 'js/components/local/forms/Form.js'

// Input : Layer, state, stateFunctions
// Output - Submit Event, Suggestion Event, Drawer fields setup as Inputs.
// Description : This Component is used in the Navigation Panel. 
// It is called once for every Layer of Data to construct a form.

//
// Called from Navigation
// Calls Form
//

export default class Details extends Component {
  displayName: 'Details';
  constructor(props) {
    super(props);
    this.state = {
      form : false,
      prepairedData : false,
    }
    this.giveDescription = this.giveDescription.bind(this);
  }

  // on keypress, check to see if a component rerenders, also construct the item to rerender.
  componentDidMount(){ this.updateForm( ) }
  componentWillReceiveProps(nextProps){ this.updateForm( ) }

  // Prepare the Form
  async updateForm( ){
    // START - Translate Array->Object(key:value) to Object->(key:array)
    let layer = this.props.layer;
    let update = false;
    let suggestions = layer.fields.map( (field, i) => {
      if ( !field || field.filter == false ){ return [] }

      let prepSug = field.preloadfilter ? field.preloadfilter : false ;
      prepSug = ( !prepSug && layer['currentFormsData'] ) ? layer['currentFormsData'] : prepSug;
      if(typeof(prepSug) == 'boolean'){ return [] }
      // Format The Suggestion Accordingly
      let suggestions = prepSug.map( (suggestion, i) => {
        if ( layer.host == 'bniaApi'){ 
          if( suggestion.block_lot ){ suggestion = suggestion[field.name.trim()] }
        }
        if ( layer.host == 'arcgis' ){
          if(suggestion && suggestion.attributes){
            suggestion = suggestion.attributes[field.name.trim()] 
          }
        }
        if ( layer.host == 'socrata' ){
          if(suggestion){ suggestion = suggestion[field.name.trim()] }
          console.log(suggestion);
        }
        return suggestion
      } )

      var mySet = new Set(); // Filter Distinct Suggestions & Sort Distinct Suggestions
      let unique = suggestions.filter( x => { var isNew = !mySet.has(x); if (isNew) mySet.add(x); return isNew && (x === 0 || x); });
      let uniqueAndSorted = unique.sort( (a, b) => { if(a < b){ return -1}; if(a > b){return 1}; return 0; } ) 
if ( layer.host == 'socrata' ){ console.log(uniqueAndSorted) };
      return uniqueAndSorted
    } )
    this.setState( { 'prepairedData' : suggestions } )
  } 
  
  // RENDER
  async giveDescription(description){alert(description); } 
  render () {
    const { prepairedData } = this.state;
    const { layer, state, stateFunctions} = this.props;
    
    // Show the 'Remove' Button
    let removeButton = !layer.dataWithCoords ? false :
      <button className='removeButton fa fa-times'
       onClick={stateFunctions.removed}
       title='Remove Layer'
       data-key={layer.key} />;

    // Otherwise show the 'Go' and 'Search' Buttons
    let goButton = !layer.labelbutton ? '':
      <button className='GoButton fa fa-angle-double-right'
       onClick={stateFunctions.handleSubmit}
       title='Search Layer'
       data-key={layer.key} />;
    let searchButton = !layer.searchfields ? '' :
      <button type='submit' className='searchButton'
        onClick={stateFunctions.handleSubmit}
        title='Search!'
        data-key={layer.key} >
        Search!
      </button>; 
    // Show the reset button if searchfields is true
    let resetButton = !layer.searchfields ? '' :
      <button type='reset' title='Clear Search' onClick={stateFunctions.reset} >Reset </button>;

    // Let the user know how many matches were found.
    let respLen = layer['currentFormsData'] ? layer['currentFormsData'].length : false; let alert = '';
    if( !layer.searchfields ) ''
    else if( respLen === 0) alert = <p title='Query Hint' className='queryHint'> No Records Found </p>
    else if( respLen == 1 ) alert = <p title='Query Hint' className='queryHint'> Exact Match! </p>
    else if( respLen >= 100 ) alert = <p title='Query Hint' className='queryHint'> Top 100 Records by attribute </p>
    else if( respLen >= 2) alert = <p title='Query Hint' className='queryHint'> {respLen} records found </p>
    else alert = <p title='Query Hint' className='queryHint'> Enter Query </p>

    let layerDescription = layer.layerdescription ? layer.layerdescription : '';
    let infoButton = layerDescription ? '' : '';
     // <button className='fa fa-info'
     //  onClick={ this.alert() }
     //  title='Description' />;

    return <details className='detailInnerContent'>
        <summary title={ layerDescription } > {layer.alias} { infoButton }{ removeButton }{ goButton } </summary>
        <form data-key={layer.key} className='detailInnerContent'>
          { alert }
          <Form layer={layer} stateFunctions={stateFunctions} prepdSug={prepairedData}  /> 
          {searchButton}
          {resetButton}
        </form>
      </details>
  }
}