import {fetchData, clean} from 'js/utils/utils';

export class Cannonical {
  constructor(layer){
    this.layerProvider = clean(layer.provider.toString());
    this.layerService = clean(layer.service.toString());
    this.layerHost = clean(layer.host.toString());
    this.layerLayer = clean(layer.layer.toString());
    this.returnParcel = layer.returnparcel;
    this.returnDistinct = layer.returndistinct;
  }
  async parcelGeometry( fieldsVals ){
    let root = "https://services1.arcgis.com/mVFRs7NF4iFitgbY/ArcGIS/rest/services/Parcels/FeatureServer/0/query?where=";
    let end = '&outFields=ADDRESS,BLOCKLOT,BLOCK,LOT&outSR=4326&returnGeometry=true&returnCentroid=true&f=pgeojson'
    let query = root + fieldsVals + end;
    let serverReturnedThis = await fetchData(query).then(json => { return json; })
    console.log('Operation : parcelGeometry, Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return serverReturnedThis
  }
}

/*
export class Cannonical {
  constructor(layer){
    this.layerProvider = clean(layer.provider.toString());
    this.layerService = clean(layer.service.toString());
    this.layerHost = clean(layer.host.toString());
    this.layerLayer = clean(layer.layer.toString());
  }
  async parcelGeometry( fieldsVals ){
    let root = "https://services1.arcgis.com/mVFRs7NF4iFitgbY/ArcGIS/rest/services/Parcels/FeatureServer/0/query?where=";
    let end = '&outFields=ADDRESS,BLOCKLOT&outSR=4326&returnGeometry=true&returnCentroid=true&f=pgeojson'
    let query = root + fieldsVals + end;
    let serverReturnedThis = await fetchData(query).then(json => { return json.features; })
    console.log('Operation : parcelGeometry, Query Sent : ', query, ', Server Returned :', serverReturnedThis);
    return ; serverReturnedThis
  }
}
*/

/*
  async parcelGeometry( fieldsVals ){
    let root = "https://services1.arcgis.com/mVFRs7NF4iFitgbY/ArcGIS/rest/services/Parcels/FeatureServer/0/query?where=";
    let end = '&outFields=ADDRESS,BLOCKLOT,BLOCK,LOT&outSR=4326&returnGeometry=true&returnCentroid=true&f=pgeojson'
    console.log(root + fieldsVals + end)
    return await fetchData(root + fieldsVals + end).then(json => { return json.features; }); 
  }
*/
