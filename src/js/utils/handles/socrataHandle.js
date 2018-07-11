import {fetchData, groupBy, clean} from 'js/utils/utils';
import {canonical} from 'js/utils/handleCanonical';

export class Socrata extends canonical {
  constructor(event, layer, field){
    super(layer);
    this.root = clean('placeholder')
    this.layerUri = ''
  }
  async fieldSuggestion() {

  }
  async parcelData(props) {

  }
}
