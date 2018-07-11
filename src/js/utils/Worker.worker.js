self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    // Determine if data needs rerendering / Sort and clean Data
    case 'prepareSuggestions':
      // START - Translate Array->Object(key:value) Object->(key:array)
      let newLayer = data.msg;
      let update = false;
      if( typeof(newLayer) == 'undefined' ){ update = true, newLayer = oldLayer }
      let complexTraversal = newLayer.fields.map( (field, i) => {
        if ( !field || field.filter == false ){ return [] }
        // Use FieldsData (preloadFilter) if available. Otherwise use CurrentFormsData if available
        let resp = field.data ? field.data : newLayer['currentFormsData'] ? newLayer['currentFormsData'] : [];

        // Abstract Away Idiosyncratic Data Structures. Move to the Search handler Classes.
        resp = !resp ? [] : resp.map( (sug, i) => {
            let suggestion = sug;
            if ( newLayer.host == 'bniaApi'){ 
              if( sug.block_lot ){ suggestion = sug[field.name.trim()] ; }
              //else{ suggestion = sug }
            }
            if ( newLayer.host == 'arcgis'){ 
              if(sug.attributes){  suggestion = sug.attributes[field.name.trim()] }
              //else{  suggestion = sug }
            }
            return suggestion
          } 
        )
        var mySet = new Set(); // Filter Distinct Suggestions & Sort Distinct Suggestions
        let unique = resp.filter( x => { var isNew = !mySet.has(x); if (isNew) mySet.add(x); return isNew && (x === 0 || x); });
        //let unique = resp.filter(function(elem, index, self) { return index === self.indexOf(elem); })
        let uniqueAndSorted = unique.sort( (a, b) => { if(a < b){ return -1}; if(a > b){return 1}; return 0; } ) 
        // newLayer.alias == 'Property Look Up' ? console.log(newLayer.alias, resp) : '' ;
        //console.log(uniqueAndSorted)
        return uniqueAndSorted

      } )
      // END

      self.postMessage({ 'prepairedData' : complexTraversal, update});
      break;
    
    // Wrap it up
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);