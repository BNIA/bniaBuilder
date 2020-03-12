//https://www.smashingmagazine.com/2019/02/introduction-to-webbluetooth/
// https://googlechrome.github.io/samples/web-bluetooth/read-characteristic-value-changed-async-await.html
export function ble(bleWrite=false, bleRead=false) {
  bleClick(bleRead, bleWrite);
}

window.charac = false;
window.bleWrite = async (event) => { 
  let encoder = new TextEncoder('utf-8'); 
  let toBle = encoder.encode(event); 
  console.log(
    'Ble Write Trigger: ' + event, 
    'ToBle: ' + toBle
  ); 
  window.charac.writeValue(toBle); 
}
window.bleRead = async (event) => { 
  // window.charac.readValue();
  // console.log('bleRead', event.target.value.getUint8(0) ); 
  let value = await event.target.value
  let decoder = new TextDecoder('utf-8');
  let message = decoder.decode(event.target.value)
  console.log('fromBle: ' + message);
}

async function bleClick(bleRead, bleWrite){
    let SERVICE_UUID        = '4fafc201-1fb5-459e-8fcc-c5c9c3319123';
    let CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b2623';
    let ESPNAME = 'nao32';

    // If you Click the BLE button for the 2nd time
    if(window.charac){
      let dataView = await window.charac.readValue()
      let uint = await dataView.getUint8(0)
      console.log(uint);
    }
    else{
      console.log("Setting up!")

      let bluetoothDevice = await navigator.bluetooth.requestDevice(
        { filters: [{ name: ESPNAME }], optionalServices: [SERVICE_UUID] }
      )
      const server = await bluetoothDevice.gatt.connect()
      const service = await server.getPrimaryService(SERVICE_UUID);
      window.charac = await service.getCharacteristic(CHARACTERISTIC_UUID);

      // Start Read Notifications.
      console.log('characteristic'); 
      window.charac.startNotifications()
      window.charac.addEventListener('characteristicvaluechanged', window.bleRead)

      // Add Write Event Listeners.
      let createEventListener = function(eventId){
        // Create Button
        document.getElementById('bluetooth').insertAdjacentHTML('afterend', 
          "<button onclick=\"window.bleWrite('"+eventId+"')\"> "+eventId+" </button>"
        );
      }
      createEventListener('red');
      createEventListener('green');
      createEventListener('blue');
      createEventListener('pink');
      createEventListener('cyan');
      createEventListener('yellow');
      createEventListener('randomize');

      createEventListener('FX_MODE_STATIC');
      createEventListener('FX_MODE_BLINK');
      createEventListener('FX_MODE_COLOR_WIPE');
      createEventListener('FX_MODE_COLOR_WIPE_INV');
      createEventListener('FX_MODE_COLOR_WIPE_REV');
      createEventListener('FX_MODE_COLOR_WIPE_REV_INV');
      createEventListener('FX_MODE_COLOR_WIPE_RANDOM');
      createEventListener('FX_MODE_RANDOM_COLOR');
      createEventListener('FX_MODE_SINGLE_DYNAMIC');
      createEventListener('FX_MODE_MULTI_DYNAMIC');
      createEventListener('FX_MODE_RAINBOW');
      createEventListener('FX_MODE_RAINBOW_CYCLE');
      createEventListener('FX_MODE_SCAN');
      createEventListener('FX_MODE_DUAL_SCAN');
      createEventListener('FX_MODE_FADE');
      createEventListener('FX_MODE_THEATER_CHASE');
      createEventListener('FX_MODE_THEATER_CHASE_RAINBOW');
      createEventListener('FX_MODE_TWINKLE');
      createEventListener('FX_MODE_TWINKLE_RANDOM');
      createEventListener('FX_MODE_TWINKLE_FADE');
      createEventListener('FX_MODE_TWINKLE_FADE_RANDOM');
      createEventListener('FX_MODE_SPARKLE');
      createEventListener('FX_MODE_FLASH_SPARKLE');
      createEventListener('FX_MODE_HYPER_SPARKLE');
      createEventListener('FX_MODE_STROBE');
      createEventListener('FX_MODE_STROBE_RAINBOW');
      createEventListener('FX_MODE_MULTI_STROBE');
      createEventListener('FX_MODE_BLINK_RAINBOW');
      createEventListener('FX_MODE_CHASE_WHITE');
      createEventListener('FX_MODE_CHASE_COLOR');
      createEventListener('FX_MODE_CHASE_RANDOM');
      createEventListener('FX_MODE_CHASE_RAINBOW');
      createEventListener('FX_MODE_CHASE_FLASH');
      createEventListener('FX_MODE_CHASE_FLASH_RANDOM');
      createEventListener('FX_MODE_CHASE_RAINBOW_WHITE');
      createEventListener('FX_MODE_CHASE_BLACKOUT');
      createEventListener('FX_MODE_CHASE_BLACKOUT_RAINBOW');
      createEventListener('FX_MODE_COLOR_SWEEP_RANDOM');
      createEventListener('FX_MODE_RUNNING_COLOR');
      createEventListener('FX_MODE_RUNNING_RED_BLUE');
      createEventListener('FX_MODE_RUNNING_RANDOM');
      createEventListener('FX_MODE_LARSON_SCANNER');
      createEventListener('FX_MODE_COMET');
      createEventListener('FX_MODE_FIREWORKS');
      createEventListener('FX_MODE_FIREWORKS_RANDOM');
      createEventListener('FX_MODE_MERRY_CHRISTMAS');
      createEventListener('FX_MODE_FIRE_FLICKER');
      createEventListener('FX_MODE_FIRE_FLICKER_SOFT');
      createEventListener('FX_MODE_FIRE_FLICKER_INTENSE');
      createEventListener('FX_MODE_CIRCUS_COMBUSTUS');
      createEventListener('FX_MODE_HALLOWEEN');
      createEventListener('FX_MODE_BICOLOR_CHASE');
      createEventListener('FX_MODE_TRICOLOR_CHASE');
    }
}


/* 
function getMeydaSliderValue(){
  var pad_with_zeroes = (number) => {
      let length = 3;
      var my_string = '' + number;
      while (my_string.length < length) { my_string = '0' + my_string; }
      return my_string;
  }
  let value = document.getElementById('meydaSlider').value
  return pad_with_zeroes(value);
}

export function btnEvent(event){
  console.log('CLICKED', event);
  characteristicXYZ.writeValue(str2ab(event)); 
}
*/

/*
//
function onConnect(characteristic){
  console.log( {characteristic} );

  // Construct MODE Buttons Function
  function createEventListener (eventId, characteristic) {
    document.getElementById('bluetooth').insertAdjacentHTML('afterend', 
      "<button onClick=\"btnEvent('"+eventId+"')\">"+eventId+"</button>"
    );
  }

  // Construct MODE Buttons
  createEventListener('theaterChaseRainbow', characteristic);
  createEventListener('theaterChase', characteristic);
  createEventListener('rainbowCycle', characteristic);
  createEventListener('rainbow', characteristic);
  createEventListener('swipe', characteristic);


  // Meyda
  var meydaSliderValue = getMeydaSliderValue()
  console.log('MEYDA VALUE ', meydaSliderValue )

  // Encode message: characteristic.writeValue( str2ab( '<command>' ) ) 
  var returnThis = characteristic.writeValue(str2ab(meydaSliderValue));
  console.log('Writing Characteristic...', returnThis);
  return returnThis
}
*/
