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
    console.log('getPreloads');
    console.log(layerNameAndFieldName);
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
    let query = this.root+'?$where=';
    let firstItem = true;
    Object.keys(fieldValuePairs).map( key => {
      if(!firstItem){ query += '&'; }
      firstItem=false;
      query += key + '%20like%20%27%25'+ fieldValuePairs[key] +'%25%27';
    } )
    let serverReturnedThis = await fetchData(query);
    console.log('Operation : getRecords , Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    
    return serverReturnedThis;
  }
  
}