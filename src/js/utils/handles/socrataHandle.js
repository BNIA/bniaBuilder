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
    console.log('getSuggestions');
    console.log(fieldValuePairs);
    let query = this.root+'?$where=';
    let firstItem = true;
    Object.keys(fieldValuePairs).map( key => {
      if(!firstItem){ query += '&'; }
      firstItem=false;
      query += key + '%20like%20%27%25'+ fieldValuePairs[key] +'%25%27';
    } )
    let serverReturnedThis = await fetchData(query);
    console.log('Operation : Distinct , Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis.features.map( (feature) => feature.attributes[field.name] );
  }

  //
  // Get Records -> Similar to getSuggestions, however here we want to get everything matching our record 
  //
  async getRecords(fieldValuePairs) {
    console.log('getRecords');
    console.log(fieldValuePairs);
  }
  //
  //  Connect between Records
  //
  // This will search for all the information pertaining to a blocklot.
  async connect(props) {
   console.log('connect');
   console.log(fieldValuePairs);
  }
}