import {fetchData, clean} from 'js/utils/utils';
import {Cannonical} from 'js/utils/handles/canonicalHandle';

export class EsriSearch extends Cannonical {
  constructor(layer){
    super(layer);
    this.root = 'https://services1.arcgis.com/'
      + this.layerProvider+'/ArcGIS/rest/services/'
      + this.layerService+'/FeatureServer/'
      + this.layerLayer+'/query?';
  }

  //
  // Get Preloaded Suggestions
  //
  async getPreloads( field ) {
    let query = this.root
      + "where=1=1&outFields="+ field.name
      + '&returnGeometry=false&returnDistinctValues=true&f=pjson';
    let serverReturnedThis = await fetchData(query);
    // console.log('Operation : Distinct , Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis.features.map( (feature) => feature.attributes[field.name] );
  }


  //
  // Get Suggestions -> We are trying to get a small distinct subset of infomration to save from lagg.
  //
  async getSuggestions(fieldValuePairs) {
    let firstItem = true;
    let query = ''
    Object.keys(fieldValuePairs).map( field => {
      let value = fieldValuePairs[field]
      if(!firstItem){ query += '+AND+' }
      firstItem=false;
      query += field + "+like+%27%25"+ this.cln(value) +"%25%27";
    } )
    
    query = this.root+"where="+query+'&outFields=*&returnGeometry=false&returnDistinctValues=true&f=pjson';
    let serverReturnedThis = await fetchData(query);
    serverReturnedThis = serverReturnedThis.features;
    //serverReturnedThis.features.map( (feature) => feature.attributes[field.name] );
    console.log('Operation : Suggetions, Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis
  }
  //
  // Get Records -> Similar to getSuggestions, however here we want to get everything matching our record 
  //
  async getRecords(fieldValuePairs) {

    // Prepare the Query
    let firstItem = true; 
    let sqlQuery = '';
    Object.keys(fieldValuePairs).map( field => {
      let value = fieldValuePairs[field]
      if(!firstItem){ sqlQuery += '+AND+' }
      firstItem=false;
      sqlQuery += field + "+like+%27%25"+ this.cln(value) +"%25%27";
    } ) 
    if(firstItem){ sqlQuery = "1=1" }
    // Check the size of the response
    let recordCount = this.root + 'where='+sqlQuery+'&returnCountOnly=true&f=pjson';
    recordCount = await fetchData(recordCount).then(json => { return json.count });
    let allRecords = [];
    do{
      let query = this.root+'where='+sqlQuery+"&resultOffset=" + allRecords.length +'&outFields=*&outSR=4326&returnGeometry=true&f=pjson';
      let serverReturnedThis = await fetchData(query);
      serverReturnedThis = serverReturnedThis.features;
      let returnThis = serverReturnedThis.map( record => {
          var outGeoJson = {}
          outGeoJson['properties'] = record.attributes;
          outGeoJson['type']= "Feature";
          if(record['geometry'] && record['geometry']['x']){
            outGeoJson['geometry']= {"type": "Point", "coordinates": [record['geometry']['x'], record['geometry']['y']] }
          }
          else if(record['geometry'] && record['geometry']['rings']){
            outGeoJson['geometry']= {"type": "Polygon", "coordinates": record['geometry']['rings'] }
          }
          else{
            outGeoJson['geometry']= {"type": "Point", "coordinates": [undefined,undefined] }
          }
          allRecords.push(outGeoJson);
          return outGeoJson
      } );
      console.log('Operation : getRecords, Query Sent : ', query, ', Server Returned :', returnThis);
    }
    while( allRecords.length < recordCount );

    console.log('Operation : getRecords, Returned :', allRecords);
    return allRecords
  }

  //
  //  Connect between Records
  //
  // This will search for all the information pertaining to a blocklot.
  async connect(props) {
    // url to our layer
    let ending = '&returnGeometry=false' + '&outFields=*' + '&f=pjson';
    let query = this.root + 'where=1=1';
    if( props.NAME && props.NAME != ' ' ){ query = this.root + "where=NAME+like%27%25"+this.cln(props.NAME)+'%25%27'; }
    else if( props.ADDRESS && props.ADDRESS != ' ' ){ query = this.root + "where=ADDRESS+like%27%25"+this.cln(props.ADDRESS)+'%25%27'; }
    query = query + '&returnGeometry=false';
    query = query + '&outFields=*';
    query = query + '&f=pjson';
    if( (props.BL) && props.BL != ' ' ){ 
      query = this.root + "where=BL+like%27%25"+this.cln(props.BL)+'%25%27'; 
    }
    else if( (props.NAME) && props.NAME != ' ' ){ 
      query = this.root + "where=NAME+like%27%25"+this.cln(props.NAME)+'%25%27'; 
    }
    else if( (props.Name) && props.Name != ' ' ){ 
      query = this.root + "where=Name+like%27%25"+this.cln(props.Name)+'%25%27'; 
    }
    else if( props.ADDRESS && props.ADDRESS != ' ' ){ 
      query = this.root + "where=ADDRESS+like%27%25"+this.cln(props.ADDRESS)+'%25%27'; 
    }
    else {
      query = this.root + 'where=1=1' 
    }
    // final Query Specifications
    query = query + ending 
    let serverReturnedThis = await fetchData(query)
    let returnThis = serverReturnedThis.features.map(attr => attr.attributes)
    console.log('Operation : GetBlocklotsAssociatedRecords, Query Sent : ', query, ', Server Returned :', returnThis);
    return returnThis
  }
  // Prepares individual values for query
  cln(value) {
    return value.trim().replace(/ /g, "+").replace(/'/g, "''")
  }
}