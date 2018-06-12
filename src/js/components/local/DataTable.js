import React, {Component} from 'react';

function isEven(n) { return n % 2 == 0; }

export default class DataTable extends Component {
  displayName: 'DataTable';
  render () {
	const {response} = this.props;
	// for each layer
	let style = { display: 'list-item'}
    if( !response ){ return null }
    let tables = Object.keys(response).map(function(layer, i){
	  let data = response[layer];
	  let style = { 
	    height:'300px',
		maxWidth:'100%',
		margin:'20px',
		overflow : 'auto',
      }
      if( data[0] == undefined || data[0] == null ){ return }
      if( layer == 'arcGisApi'){ return }
      if (layer == 'basic_prop_info'){ return }
      if (layer.includes('GP_Boundaries') ){ return }
     return (
	  <div key={i} style={style}>
        <table>
          <thead>
            <tr>
	        {
	          Object.keys(data[0]).map(function(field, i){
	          	let style = { 
                  position: 'sticky',
                  background : 'var(--bg-color-1)',
                  top: '0px',
                  height: '50px'
	          	}
                return ( <td key={i} style={style}><b> {field} </b></td> )  
	          })
	        }
	        </tr>
          </thead>
          <tbody>
	        {
	          data.map(function(record, i){
		        let style = {}
		        if (isEven(i)){ style = { background:'rgba(150,150,150, .3)'} }
                return ( 
		          <tr key={i}> 
		          {
	                Object.keys(record).map(function(fieldVal, i){ 
                      return ( 
                        <td key={i}> 
                          {record[fieldVal]} 
                        </td> 
                      )
	                })
		          }
		          </tr> 
	            )
	          })
	        }
          </tbody>
	    </table>
	  </div>
	  )
	})
	//console.log(tables);
    let dataTablee = Object.keys(response).map(function(layer, i){ 
	  let data = response[layer];
	  let style = { 
	    height:'300px',
		maxWidth:'100%',
		margin:'20px',
		overflow : 'auto',
      }
      if( layer == 'arcGisApi'){ return }
      if (layer == 'basic_prop_info'){ return }
      return layer 
    })
    return (  
    <div> 
      { tables }
    </div> 
    )
  }
}

