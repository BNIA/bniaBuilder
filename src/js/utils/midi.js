//http://stackoverflow.com/questions/23687635/how-to-stop-audio-in-an-iframe-using-web-audio-api-after-hiding-its-container-di
function midiChange(midiAccess){ return null}

export async function midi( midiCallback, midiChange){
    console.log(midiCallback, midiChange);
    var midi, data, cmd, channel, type, note, velocity;

    // 1) Request MIDI access
    if(navigator.requestMIDIAccess){navigator.requestMIDIAccess({sysex: false})
      .then(onMIDISuccess, false );}

    // 2) Once connected
    function onMIDISuccess(midiAccess){
        midi = midiAccess;
        showMIDIPorts(midi);

        // Set an event trigger on midi connection change event
        midi.onstatechange = () => { 
          showMIDIPorts(midi);
          // port = event.port
          // state = port.state 
          // name = port.name
          // type = port.type
        }; 
        
        // Set an event trigger on midi message event
        var inputs = midi.inputs.values();
        for(var input = inputs.next(); input && !input.done; input = inputs.next()){ 
          input.value.onmidimessage = onMIDIMessage; }
    }

    // 3) Dispaly MIDI Channels Plugged in

    //
    // StateFunction. Update Midi Port State
    //
    function showMIDIPorts(midiAccess){
        midiChange(midiAccess)
    }

    //
    // 4) FINAL -> Callback
    //
    // Description: Recieves Raw Midi Data. Forwards to a Push or Scroll function. PUSHBUTTON or SCROLLBUTTON 
    function onMIDIMessage(event){
        data = event.data;
        channel = event.data[0] & 0xf;
        cmd = event.data[0] >> 4; 
        // CMD = 9 for pushbuttons
        // CMD = 11 for everything else
        // channel agnostic message type.
        type = event.data[0] & 0xf0, 
        // Type = 144 for pushbuttons
        // Type = 176 for everything else
        note = event.data[1],          
        velocity = event.data[2];
        // console.log( {cmd, type, velocity, "Map Value" : note } );
        let obj = midi_TotalTrack.find(obj => obj.key == note);
        let respo = midiCallback(obj, velocity)
    }
}

var midi_TotalTrack = [
    {name: 'C_MASTER', cmd : 11,  type : 176, key : 23}, 
    {name: 'C_MASTER_PH_MIX', cmd : 11,  type : 176, key : 22}, 
    {name: 'C_MASTER_PH_VOL', cmd : 11,  type : 176, key : 15}, 
    {name: 'C_MASTER_KNOB', cmd : 11,  type : 176, key : 26}, 
    {name: 'C_MASTER_KNOB_BUTTON', cmd : 9,  type : 144, key : 79}, 
    {name: 'C_DIRECTORY', cmd : 9,  type : 144, key : 72}, 
    {name: 'C_CROSSOVER', cmd : 11,  type : 176, key : 10}, 
    {name: 'A_PFL', cmd : 9,  type : 144, key : 48},
    {name: 'A_KEY', cmd : 9,  type : 144, key : 56},
    {name: 'A_SYNC', cmd : 9,  type : 144, key : 64},
    {name: 'A_FX_AMT', cmd : 11,  type : 176, key : 0},
    {name: 'A_FX_AMT_SELECT', cmd : 9,  type : 144, key : 49},
    {name: 'A_PAR', cmd : 11,  type : 176, key : 2},
    {name: 'A_PAR_ON_OFF', cmd : 9,  type : 144, key : 57},
    {name: 'A_FILTER_AMT', cmd : 11,  type : 176, key : 1},
    {name: 'A_FILTER_ON_OFF', cmd : 9,  type : 144, key : 50},
    {name: 'A_FINE_PITCH', cmd : 11,  type : 176, key : 3},
    {name: 'A_FINE_PITCH_TAP', cmd : 9,  type : 144, key : 58},
    {name: 'A_GAIN', cmd : 11,  type : 176, key : 13},
    {name: 'A_TREBEL', cmd : 11,  type : 176, key : 16},
    {name: 'A_TREBEL_BUTTON', cmd : 9,  type : 144, key : 80},
    {name: 'A_MID', cmd : 11,  type : 176, key : 18},
    {name: 'A_MID_BUTTON', cmd : 9,  type : 144, key : 85},
    {name: 'A_BASS', cmd : 11,  type : 176, key : 20},
    {name: 'A_BASS_BUTTON', cmd : 9,  type : 144, key : 83},
    {name: 'A_LOAD_TRACK', cmd : 9,  type : 144, key : 75},
    {name: 'A_PITCH_BEND_NEG', cmd : 9,  type : 144, key : 65},
    {name: 'A_PITCH_BEND_POS', cmd : 9,  type : 144, key : 66},
    {name: 'A_LOOP_IN', cmd : 9,  type : 144, key : 73},
    {name: 'A_LOOP_OUT', cmd : 9,  type : 144, key : 74},
    {name: 'A_CUE', cmd : 9,  type : 144, key : 51},
    {name: 'A_SET_CUE', cmd : 9,  type : 144, key : 59},
    {name: 'A_PAUSE', cmd : 9,  type : 144, key : 67},
    {name: 'A_VOLUME_SLIDER', cmd : 11,  type : 176, key : 8},
    {name: 'A_PITCH_SLIDER', cmd : 11,  type : 176, key : 11},
    {name: 'A_JOG_WHEEL', cmd : 11,  type : 176, key : 25}, 
    {name: 'B_PFL', cmd : 9,  type : 144, key : 55},
    {name: 'B_KEY', cmd : 9,  type : 144, key : 63},
    {name: 'B_SYNC', cmd : 9,  type : 144, key : 71},
    {name: 'B_FX_AMT', cmd : 11,  type : 176, key : 4},
    {name: 'B_FX_AMT_SELECT', cmd : 9,  type : 144, key : 53},
    {name: 'B_PAR', cmd : 11,  type : 176, key : 6},
    {name: 'B_PAR_ON_OFF', cmd : 9,  type : 144, key : 61},
    {name: 'B_FILTER_AMT', cmd : 11,  type : 176, key : 5},
    {name: 'B_FILTER_ON_OFF', cmd : 9,  type : 144, key : 54},
    {name: 'B_FINE_PITCH', cmd : 11,  type : 176, key : 7},
    {name: 'B_FINE_PITCH_TAP', cmd : 9,  type : 144, key : 14},
    {name: 'B_GAIN', cmd : 11,  type : 176, key : 14},
    {name: 'B_TREBEL', cmd : 11,  type : 176, key : 17},
    {name: 'B_TREBEL_BUTTON', cmd : 9,  type : 144, key : 82},
    {name: 'B_MID', cmd : 11,  type : 176, key : 19},
    {name: 'B_MID_BUTTON', cmd : 9,  type : 144, key : 81},
    {name: 'B_BASS', cmd : 11,  type : 176, key : 21},
    {name: 'B_BASS_BUTTON', cmd : 9,  type : 144, key : 84},
    {name: 'B_LOAD_TRACK', cmd : 9,  type : 144, key : 52},
    {name: 'B_PITCH_BEND_NEG', cmd : 9,  type : 144, key : 69},
    {name: 'B_PITCH_BEND_POS', cmd : 9,  type : 144, key : 70},
    {name: 'B_LOOP_IN', cmd : 9,  type : 144, key : 77},
    {name: 'B_LOOP_OUT', cmd : 9,  type : 144, key : 78},
    {name: 'B_CUE', cmd : 9,  type : 144, key : 60},
    {name: 'B_SET_CUE', cmd : 9,  type : 144, key : 68},
    {name: 'B_PAUSE', cmd : 9,  type : 144, key : 76},
    {name: 'B_VOLUME_SLIDER', cmd : 11,  type : 176, key : 9},
    {name: 'B_PITCH_SLIDER', cmd : 11,  type : 176, key : 12},
    {name: 'B_JOG_WHEEL', cmd : 11,  type : 176, key : 24} 
]

/*
switch(obj.key){
    case 67: // Pause play
    console.log('Pause Play');
    pushButton(note, velocity);
    break;
    case 4: //test
    freqType = 'sine'; 
    document.getElementById("oscillatorType").value = freqType;
}
*/

 //  CMD Types
 //  'on': 9,
 // 'off': 8,
 // 'change': 11
 /*
 ~MIDIInput.onmidimessage
 When the current port receives a MIDIMessage it triggers a call to this event handler.
 ~MIDIAccess.inputs Read only
 Returns an instance of MIDIInputMap which provides access to any available MIDI input ports.
 ~MIDIAccess.outputs Read only
 Returns an instance of MIDIOutputMap which provides access to any available MIDI output ports.
 ~MIDIAccess.sysexEnabled Read only
 A boolean attribute indicating whether system exclusive support is enabled on the current MIDIAccess instance.

 // (305441741).toString(16) = "1234abcd"
 // parseInt("1234abcd", 16) = 305441741

var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
gainNode.gain.value = volume;   //Volume
oscillator.frequency.value = frequencyFromNoteNumber(note); //frequencyFromNoteNumber(note);
oscillator.type = freqType; // Frequency Type
log('Volume : ' + volume);
duration = 200;
if (velocity >= 1){
    oscillator.start();
    setTimeout(
        function() {
            oscillator.stop();
        },
        duration
    );
}
else {

}
};


/*
// Combine with web-audio-keyboard or even better interactive-keyboard
// SUPER ANNOYING. KEYBOARD BEEPS EVERY TIME YOU PRESS IT. this will be fun for piano functionality once I put a toggle on it.
document.addEventListener('keydown', keyController);
document.addEventListener('keyup', keyController);
// user interaction on kEYBOARD
function keyController(e){
    if(e.type == "keydown"){
        switch(e.keyCode){
            case e.keyCode:
                console.log(e.keyCode);
                btn[0].classList.add('active');
                beep(e.keyCode, 127);
                break;
            default:
            break;
        }
    }
    else if(e.type == "keyup"){
        for(var i = 0; i < btn.length; i++){
            switch(e.keyCode){
            case e.keyCode:
                btn[0].classList.remove('active');
                beep(e.keyCode, 0);
                break;
            break;
            }
        }
    }
}
*/