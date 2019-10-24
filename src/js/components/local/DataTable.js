import React, {Component} from 'react';

import ReactTable from "react-table";
import "react-table/react-table.css";

function isEven(n) { return n % 2 == 0; }

export default class DataTable extends Component {
  displayName: 'DataTable';
  render () {
	const {state} = this.props;
	if(!state.userHasSearched){return null}
	let newtables = state.dictionaries.map( (layer, index) => {
		let dc = layer.dataWithCoords
		if(layer.dataWithCoords) {
		  // Get all the property objects from our each record.

		  // this needs to be resolved in the search
		  let transposedObjectArray = dc;
		  transposedObjectArray = !dc ? '' : dc.map(obj => obj.properties ? obj.properties : obj.attributes)
		  // dataTable
		  let revealthese = layer.fields.filter(field => field.dataTable == true).map(field => ({ Header: field.alias, accessor: field.name }))
		  !Object.values(layer.fields[0]).includes('block_lot') ? null:revealthese.unshift({Header:'Block Lot', accessor:'block_lot'});
		  (!dc[0] || !dc[0].properties) ? null : !Object.keys(dc[0].properties).includes('BL') ? null:revealthese.unshift({Header:'Block Lot', accessor:'BL'});

		  let whatgoesin = {
		  	data : transposedObjectArray,
		  	columns : revealthese
		  }
		  
		  return ( [
		    <br key={index+'b'} />,
		    <h2 key={index+'j'} >{layer.alias}</h2>,
		    <ReactTable key={index} 
		      data={ transposedObjectArray }
		      columns={ revealthese }
		      defaultPageSize={5}
		      filterable={true}
		      className="-striped -highlight"
		    /> 
		  ] )

		}
	} )
	let instructions = (
	<article key='instructions' style={{padding:'10px'}}>
	  <h1>Table View</h1>
	  <p> &#8226; Sort tables by clicking a columns title </p>
	  <p> &#8226; Sort multiple by holding the <kbd>shift</kbd> key </p>
	  <p> &#8226; Filter tables using the white boxes </p>
	  <p> &#8226; Maps keeps historical search results when a new search is made. The Tables do not. </p>
	  <p> &#8226; Only the most recent record per blocklot will be shown </p>
	</article>
	)
	newtables.unshift(instructions);
	return newtables
  }
}