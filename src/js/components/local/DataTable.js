import React, {Component} from 'react';

function isEven(n) { return n % 2 == 0; }

export default class DataTable extends Component {
  displayName: 'DataTable';
  render () {
	const {response} = this.props;
	// for each layer
	let style = { display: 'list-item'}
    if( !response ){ return null }
    let tableHeadStyle = { position: 'sticky', background : 'var(--bg-color-1)', top: '0px', height: '50px' }
    let tableBodyStyle = { height:'300px', maxWidth:'100%', margin:'20px', overflow : 'auto'}
	let tableStyle = { height:'300px', maxWidth:'100%', margin:'20px', overflow : 'auto', }
    let tables = Object.keys(response).map(function(layer, i){
	  let data = response[layer];
      if( data[0] == undefined || data[0] == null ){ return }
      if( layer == 'arcGisApi'){ return }
      if (layer == 'basic_prop_info'){ return }
      if (layer.includes('GP_Boundaries') ){ return }
      let tableBody = data.map(function(record, i){
		let style = {}
		if (isEven(i)){ style = { background:'rgba(150,150,150, .3)'} }
		record = record.properties ? record.properties : record;
		let dimen = Object.keys(record).map(function(fieldVal, i){ 
		  let val = record[fieldVal];
		  return <td key={i}> {val} </td> 
		} )
		return <tr key={i}>{ dimen }</tr> 
	  })
	 let tableHead = Object.keys(data[0]).map(function(field, i){ return <td key={i} style={tableHeadStyle}><b>{field}</b></td> })
     return (
        <table key={i} style={tableStyle}>
          <thead><tr>{ tableHead }</tr></thead>
          <tbody>{ tableBody }</tbody>
	    </table>
	  )
	})
    let dataTablee = Object.keys(response).map(function(layer, i){ 
	  let data = response[layer];
      return ( layer == 'arcGisApi' || layer == 'basic_prop_info') ? null : layer 
    })
    return <div>  { tables } </div> 
  }
}

