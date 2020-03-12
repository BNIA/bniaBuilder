
// This may now be used as Example code. 
// This is code for a dedicated worker.
// when assigned to many components, the worker will freeze.
// I think I may need a shared worker to fix this. =


// ON THE PAGE WE WANT 
import Worker from 'js/utils/Worker.worker.js'

// Prepare the Form
async updateForm( ){
  console.log('worker should run')
  let newWorker = new Worker();
  newWorker.postMessage({'cmd': 'prepareSuggestions', 'msg': this.props.layer });
  newWorker.onmessage = async (m) => {    
    let update = true;
    if( update ){ this.setState( { 
      'prepairedData' : m.data.prepairedData, 
      'update' : true 
    } ) } 
    else{ this.setState( { 'update' : false } ) } 
  }
} 


// ON THIS PAGE 
self.addEventListener('message', function(e) {
  var data = e.data;
  switch (data.cmd) {
    // Determine if data needs rerendering / Sort and clean Data
    case 'prepareSuggestions':

      self.postMessage({ 'prepairedData' : 'responsedata' , update});
      close();
      break;
    
    // Wrap it up
    default:
      self.postMessage('Unknown command: ' + data.msg);
      close();
  }
}, false);

close();