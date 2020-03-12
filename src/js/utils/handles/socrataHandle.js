import {fetchData, clean} from 'js/utils/utils';
import {Cannonical} from 'js/utils/handles/canonicalHandle';

export class SocrataSearch extends Cannonical {
  constructor(layer){
    super(layer);
    this.root = 'https://data.baltimorecity.gov/resource/'+this.layerLayer+'.json';
  }
  //
  // Get Preloaded Suggestions  --> Has yet to be constructed
  //
  async getPreloads(layerNameAndFieldName) {
    console.log('getPreloads', layerNameAndFieldName);
    let query = this.root+'?$where=1=1&$limit=100';
    let serverReturnedThis = await fetchData(query);
    console.log(query)
    console.log('Operation : getPreloads , Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis;
  }

  //
  // Get Suggestions  --> Has yet to be constructed
  //
  async getSuggestions(fieldValuePairs) { 
    console.log(fieldValuePairs);
    let query = this.root+'?$where=';
    let firstItem = true;
    Object.keys(fieldValuePairs).map( key => {
      if(!firstItem){ query += '&'; }
      firstItem=false;
      query += key + '%20like%20%27%25'+ fieldValuePairs[key] +'%25%27';
    } )
    query += '&$limit=100';
    let serverReturnedThis = await fetchData(query);
    console.log('Operation : DgetSuggestionsistinct , Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis;
  }

  //
  // Get Records -> Similar to getSuggestions, however here we want to get everything matching our record 
  // https://dev.socrata.com/docs/functions/count.html
  //
  
  async getRecords(fieldValuePairs) { 
    console.log(fieldValuePairs);
    let query = this.root+'?$where= ';
    let firstItem = true;
    Object.keys(fieldValuePairs).map( key => {
      if(!firstItem){ query += '& '; }
      firstItem=false;
      query += key + " like '"+ fieldValuePairs[key] +"' ";
    } )
    query = encodeURI(query)
    let serverReturnedThis = await fetchData(query);

    let returnThis = serverReturnedThis.map( record => {
        var outGeoJson = {}
        outGeoJson['properties'] = record;
        outGeoJson['type']= "Feature";
        if(record['location_1']){
          outGeoJson['geometry']= {"type": "Point", "coordinates": record['location_1']['coordinates']} 
        }
        else if(record['xcord']&& record['ycord']){
          outGeoJson['geometry']= {"type": "Point", "coordinates": [record['xcord'], record['ycord']]} 
        }
        else if(record['Latitude']&& record['Longitude']){
          outGeoJson['geometry']= {"type": "Point", "coordinates": [record['Latitude'], record['Longitude']]} 
        }
        else {
          outGeoJson['geometry']= {"type": "Point", "coordinates": [0, 0]} 
        }
        return outGeoJson
      } )

    console.log('Operation : getRecords , Query Sent : ', query, ', Server Returned :', returnThis);
    
    return returnThis;
  }

    async connect(fieldValuePairs) {
      return []
    }
  
}