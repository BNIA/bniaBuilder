import {fetchData, clean} from 'js/utils/utils';
import {Cannonical} from 'js/utils/handles/canonicalHandle';

export class BniaSearch extends Cannonical {
  constructor(layer){
    super(layer);
    this.root = 'https://bniajfi.org/api?';
  }

  //
  // Get Preloaded Suggestions  --> Has yet to be constructed
  //
  async getPreloads(layerNameAndFieldName) {
    let query = ''
    let serverReturnedThis = await fetchData(query);
    console.log('Operation : Distinct , Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis.features.map( (feature) => feature.attributes[field.name] );
  }

  //
  // For dropdowns range sliders and texbox inputs -> Create an object handling the each field & their possible values and constraints.
  //
  inputHandler(fieldValuePairs){
    let fields = '';
    let fieldsVals = '';
    let firstItem = true;
    Object.keys(fieldValuePairs).map( key => {
      if(!firstItem){
        fields += '+';
        fieldsVals += '+';
      }
      firstItem=false;
      fields += key;
      fieldsVals += fieldValuePairs[key]
    } )
    if(firstItem){
      fields += '1';
      fieldsVals += '1';
    }
    return {fields, fieldsVals}
  }

  //
  // Get Suggestions -> We are trying to get a small distinct subset of infomration with no match on blocklot so there IS no lagg.
  //
  async getSuggestions(fieldValuePairs) {
    let {fields, fieldsVals} = this.inputHandler(fieldValuePairs);

    let query = this.root+'table='+this.layerLayer+'&fields='+fields+'&fieldsVals='+fieldsVals+'&purpose=suggest';
    let serverReturnedThis = Object.values(await fetchData(query));
    console.log('Operation : getSuggestions, Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis; 
  }

  // 
  // Get Records -> We get a small set of information because there IS a lagg when matching on blocklot..
  // 
  async getRecords(fieldValuePairs){
    let {fields, fieldsVals} = this.inputHandler(fieldValuePairs);

    // Getting the records is easy...
    let query = this.root+'table='+this.layerLayer+'&fields='+fields+'&fieldsVals='+fieldsVals+'&purpose=records';
    let records = Object.values(await fetchData(query));
    console.log('Operation : getRecordsP1, Query Sent : ', query, ', Server Returned :', records);

    // Getting the coordinates is not as easy // Retrieve Points or Geometries for said Blocklots
    let uniqueBlockLots = (this.returnDistinct && records && records.length == 1) || (!this.returnDistinct && records && records.length >= 1) ? records : [];
    uniqueBlockLots = [...new Set(uniqueBlockLots.map(record => record['block_lot']))]
 
    fieldsVals = ''; query = ''; let serverReturnedThis = []; let firstItem = true; let returnThis = [];
    if(uniqueBlockLots.length == 0){ alert('Search must return no more than 1 address'); serverReturnedThis = []; } // Return Distinct Failed
    //if( this.layerLayer == 'property_details' && records.length > 50){ alert('Search must return less than 50 addresses'); serverReturnedThis = []; } // Over 50 Parcels
    else if( this.returnParcel && this.layerLayer != 'property_details' ){
      // Construct a 'Where' Statement for an Esri Geometric Parcel Query
      uniqueBlockLots.map( blocklot => {
        // console.log('Rerieving Parcel : ', blocklot)
        if(!firstItem){ fieldsVals += '+OR+' }
        firstItem=false;
        let loc = blocklot.split(" ")[0];
        let lot = blocklot.split(" ")[1];
        let blockl = blocklot.replace(/ /g, "+")
        // Exact matches are fickle :
        fieldsVals += 'Blocklot+%3D+%27'+blockl+'%27+'; // Blocklot = '012 0015'
        fieldsVals += 'OR+%28lot+%3D+%27'+lot+'%27+AND+Block+%3D+%27'+loc+'%27%29+' // OR (lot='0015' AND Block = '012')
        fieldsVals += 'OR+%28lot+%3D+%27'+loc+'%27+AND+Block+%3D+%27'+lot+'%27%29' // OR (lot = '012' AND Block ='0015')
      } )
      serverReturnedThis = await this.parcelGeometry( fieldsVals );
      serverReturnedThis = serverReturnedThis.features.map(attr => attr)
      console.log(serverReturnedThis);
      // For each record.
      returnThis = records.map( record => {
        // Find its Coordinates
        let parcel = serverReturnedThis.filter( uniqueParcel => {
          let flag =  uniqueParcel.properties['Blocklot'] == record['block_lot'];
          flag = flag ? flag : uniqueParcel.properties['BLOCK'] == record['block']
          flag = flag ? flag : uniqueParcel.properties['LOT'] == record['lot']
          flag = flag ? flag : uniqueParcel.properties['LOT'] +" "+uniqueParcel.properties['BLOCK'] == record['block_lot']
          return flag
        } )[0]
        var outGeoJson = {}
        outGeoJson['properties'] = record;
        outGeoJson['type']= "Feature";

        // if a coordinates are found          
        if(parcel != []){
          // insert it into the record
          console.log(outGeoJson, record, parcel)
          //Object.assign(outGeoJson['properties'],parcel);
          
          if(parcel['geometry'] && parcel['geometry']['coordinates']){
            outGeoJson['geometry']= parcel['geometry']
          }
          else if(record && record['xcord']){
            outGeoJson['geometry']= {"type": "Point", "coordinates": [record['ycord'], record['xcord']] }
          }
          else{
            outGeoJson['geometry']= {"type": "Point", "coordinates": [undefined,undefined] }
          }
        }
        else{ alert('parcel could not be found'); }
        return outGeoJson
      } )

      console.log('Operation : GetBlocklotsAssociatedRecords, Query Sent : ', query, ', Server Returned :', returnThis);
    }
    else if( uniqueBlockLots.length ){ 
      // Get Coords
      uniqueBlockLots.map( blocklot => {
        if(!firstItem){ fieldsVals += '+' }
        firstItem=false;
        fieldsVals += blocklot
      } )
      query = this.root+'&table=basic_prop_info&fields=block_lot&fieldsVals=InTheBody&purpose=coords';
      serverReturnedThis = await fetchData([query, fieldsVals])
      console.log('Operation : getCoordinates, Query Sent : ', ', Server Returned :', serverReturnedThis);

      // Stuff the coords you just got into each record. Start by maping through your records.
      returnThis = records.map( record => {
        // Find its Coordinates
        let parcel = serverReturnedThis.filter( uniqueParcel => { return uniqueParcel['block_lot'] == record['block_lot']; } )
        let newRecord = Object.assign(record, parcel[0])
        // And insert it into the record
        return newRecord
      } )


      // Process BNIA Data into an array of Json Features.
      returnThis = returnThis.map( record => {
        var outGeoJson = {}
        outGeoJson['properties'] = record;
        outGeoJson['type']= "Feature";
        outGeoJson['geometry']= {"type": "Point", "coordinates": [record['xcord'], record['ycord']]}
        return outGeoJson
      } );

      //let notAllData = returnThis.filter( newrecord => { return !newrecord.xcord || !(newrecord.properties && newrecord.properties.xcord ) } )
    }
    else{ alert('Server Error. Please contact the administrator'); serverReturnedThis = []; }

    // Data will either be returned wrapped in its Feature Object or as Key:Value pairs that will be translated into a Feature Object
    console.log('Operation : getRecordsP2, Query Sent : ', '', ', Server Returned :', returnThis);

    return returnThis;
  }


  //
  //  Connect between Records
  //
  // This will search for all the information pertaining to a blocklot.
  async connect(props) {
    let blockl = props.block_lot ? clean(props.block_lot) : props.BL ? clean(props.BL) : 'NoBlocklot'
    let query = this.root+'&table='+this.layerLayer+'&fields=block_lot&fieldsVals='+blockl+'&purpose=connect';
    let serverReturnedThis = Object.values(await fetchData(query));
    console.log('Operation : GetBlocklotsAssociatedRecords, Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis;
  }
}






  // For right now we check to see if a connectedDictionaries exists, and if both layers have a 'block_lot'.
  // If so, a query is made. that solves our parcel issue. I will come back to this after I update the google spreadsheet with new structure

/*
connectedDictionaries = [
  {
    Key = '',
    foreignFieldToMatchOn = '',
    localFieldToMatchOn = ''
  },
  {
    foreignDictionaryKey = '',
    foreignFieldToMatchOn = '',
    localFieldToMatchOn = ''
  },
]
*/