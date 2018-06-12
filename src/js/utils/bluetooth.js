document.getElementById('bluetooth').innerHTML = "<button> Bluetooth </button>";
document.getElementById('bluetooth').addEventListener('click', function(event) {
  onButtonClick()
});

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function onButtonClick() {
  console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
  })
  .then(device => {
	console.log(device);
    console.log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
	console.log(server);
    console.log('Getting Service...');
    console.log(server.getPrimaryServices());
    return server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
  })
  .then(service => {
	console.log(service);
    console.log('Getting Characteristic...');
    console.log(service.getCharacteristics());
    return service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
  })
  .then(characteristic => {
	console.log(characteristic);
    createEventListener('theaterChaseRainbow', characteristic);
    createEventListener('theaterChase', characteristic);
    createEventListener('rainbowCycle', characteristic);
    createEventListener('rainbow', characteristic);
    createEventListener('swipe', characteristic);
    console.log('Writing Characteristic...');
    return characteristic.writeValue(str2ab('rainbow'));
  })
  .then(_ => {
    console.log('Bluetooth Set Up');
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
}

function createEventListener(eventId, characteristic){
  document.getElementById('bluetooth').insertAdjacentHTML('afterend', "<button id='"+eventId+"'> "+eventId+" </button>");
  document.getElementById(eventId).addEventListener('click', function(event) { characteristic.writeValue(str2ab(eventId)); });
}