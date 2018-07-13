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
		if(layer.dataWithGeometry) {
		  // Get all the property objects from our each record.
		  let transposedObjectArray = !layer.dataWithGeometry ? '': layer.dataWithGeometry.map(obj => obj.properties ? obj.properties : obj.attributes)
		  // if field.search assign property attributes into a new object.
		  let revealthese = layer.fields.filter(field => field.search == true).map(field => ({ Header: field.alias, accessor: field.name }))
		  !Object.values(layer.fields[0]).includes('block_lot') ? null:revealthese.unshift({Header:'Block Lot', accessor:'block_lot'});
		  !layer.dataWithGeometry[0] ? null : !Object.keys(layer.dataWithGeometry[0].properties).includes('BL') ? null:revealthese.unshift({Header:'Block Lot', accessor:'BL'});
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