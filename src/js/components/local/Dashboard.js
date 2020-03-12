import React, {Component} from 'react';
import * as WaveSurfer from 'wavesurfer';
import SonicSocket from 'sonicnet';
import {midi} from 'js/utils/midi';
import {ble} from 'js/utils/bluetooth';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import meyda from 'meyda';
import TapBPM from 'js/components/local/TapBPM';

  // 
  // Some Basic Variables
  // 
  // https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js

//
// Dashboard
// Connects to Bluetooth and Plays Audio Files. 
// Decodes Audio and Broadcasts Aesthetic Color to Bluetooth.
//
export default class Dashboard extends Component {
  displayName: 'Dashboard';
  constructor(props) {
    super(props);
    
    // MP3 Basics
    this.loadSong = this.loadSong.bind(this);
    this.playPause = this.playPause.bind(this);
    this.selectMusicFolder = this.selectMusicFolder.bind(this);
    this.useMic = this.useMic.bind(this);
    this.useMp3 = this.useMp3.bind(this);
    this.setupAudioContext = this.setupAudioContext.bind(this);

    // Meyda
    this.meydaCallback = this.meydaCallback.bind(this)

    // Mlkdrop Btterchurn
    this.butterchurnPreset = this.butterchurnPreset.bind(this);
    this.butterchurnAutoMix = this.butterchurnAutoMix.bind(this);
    this.butterchurnTimeTillTransition = this.butterchurnTimeTillTransition.bind(this);
    this.butterchurnRandom = this.butterchurnRandom.bind(this);
    this.butterchurnTransitionLength = this.butterchurnTransitionLength.bind(this);
    
    // BLE
    this.bleScan = this.bleScan.bind(this);
    this.bleRead = this.bleRead.bind(this);
    this.bleEvent = this.bleEvent.bind(this);

    // MIDI
    this.midiEvent = this.midiEvent.bind(this);
    this.midiStatus = this.midiStatus.bind(this);

    this.state = {
      // MP3
      mp3OrMic : false,
      musicFolder : [],
      audioElement : null,
      playerInfo : {
        author : 'author',
        album : 'album',
        title : 'title',
        duration : 'duration'
      },
      // Audio
      mediaSource: null, // Either createMediaElementSource(mp3) or createMediaSource (mic)
      gainNode: null,
      audioContext : null,
      // WavesSurfer
      wavesurfer : null,
      audioContextStreamEvent: null,
      // Myda
      meyda: null,
      // Milkdrop
      visualizer : null,
      butterchurnAutoMix : false,
      butterchurnTimeTillTransition : 0,
      butterchurnTransitionLength : 0
    }
  }
  
  async componentDidMount(){ 
    midi(this.midiEvent, this.midiStatus) 
    let drawWave = {
      container: '#waveform',
      progressColor: '#efefef',
      waveColor: 'blue',
      cursorColor: 'pink',
      splitChannels: false,
      hideScrollbar: true,
      closeAudioContext : true,
      removeMediaElementOnDestroy : true,
    }
    let wavesurfer = WaveSurfer.create( { ...drawWave, ...{ } }); 

    this.setState( { wavesurfer, visualizer } )
  } 

  // In the begining...

  // An audiocontext is created
  // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
  // A Gain is created

  // Btrchrn instance is created 
  // create an audioContextStreamEvent
  // connect it to the audio connext

  // Wavesuffer instance is created 
  // create an Audiocontex script processor.
  // https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode
  // "connect" it to the cntxs output.
  // use it to render Waversurfers BitStream
  // 
  // Return the AudioCntx, The Visualizer Wavesurffer, and the AudioCntx scriptProcessor that Renders it the Wvesurfer View.
  //
  // For MIC/ MP3s:
  // == Wvesurfer can be Instantiated now and connect to a audioSource (mediaStreamSource, createMediaElementSource) later. 
  // == Btrchrn I think looks at the AudioCntx destination just like Wyvsrfr but it asks for the whole audioContext
  // == Myda cannot be instantiated here because a parameter is the audioSource (mp3 or mic).. Presumably to look at the Destination.

  async setupAudioContext(){ 
    // Audio Context Setup
    let audioContext = new AudioContext();
    audioContext.resume();

    // Gain Node -> we will apply the same gane to either mediaSrc (mic vs mp3)
    let gainNode = audioContext.createGain();  
    gainNode.gain.value = 1.25;
    gainNode.connect(audioContext.destination);

    // Connect (wvesurfer) Functions to Audiocntx
    let streamFunc = (event) => {
      this.state.wavesurfer.empty();
      this.state.wavesurfer.loadDecodedBuffer(event.inputBuffer);
      if(this.state.mp3OrMic == 'mp3'){ this.state.wavesurfer.play() } // If Mp3 Ply whatever is coming out of the AudioContext
      // https://meyda.js.org/reference/module-meyda-Meyda.html
      meyda.bufferSize = 2048;
      // https://docs.sumerian.amazonaws.com/articles/webaudio-1/
      let rawAudio = event.inputBuffer.getChannelData(0)
      let extractFeatures = ['rms', 'zcr', 'spectralCentroid']
      let features = meyda.extract(extractFeatures, rawAudio )
      this.meydaCallback(features);
    }
    //2048 or 4096
    let audioContextStreamEvent = audioContext.createScriptProcessor(2048, 1, 1);
    audioContextStreamEvent.connect(audioContext.destination);
    audioContextStreamEvent.onaudioprocess = streamFunc;

    // Connect (mlkdrop) Functions to Audiocntx
    let visualizer = butterchurn.createVisualizer( audioContext, document.getElementById('canvas'), { }  )
    visualizer.connectAudio(gainNode);

    this.setState( { audioContext, gainNode, audioContextStreamEvent, visualizer } )
  }

  // The AudioContext needs a mediaSourse!

  // 1 ) The AudioContext may need to loose its mediaSorce if had already
  // If using mic and previous stream was mic, then dont do anything.
  // Else: 
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaSouce/endOfStream
  // Disconct mediaSourcss from Gain
  // Disconct Disconct from Wavesurfer. <-- why is it connected in the firstplace if wavesurfer is connected to the audiocontxt endpnt
  
  // 0 ) Connect the Source to these Scripts!
  // MP3
  // I will need to ge the stream from the MP3... how?
  // Once thats done, just connect to the audiocntx as the new mediaSourse
  // -- -- https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaElementSource
  //
  //
  // Mic
  // stream = start the mic by using the navigator
  // Once thats done, just connect to the audiocntx as the new mediaSourse
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  // -- -- https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
  // give the media source the gainnode
  // connect the stream analyzer to it
  // 
  //

  //
  // MICROPHONE
  //
  // Disconnect the gain from the mp3 if the mediaStream is from MP3
  //
  // meyda = createMydaAnalyzer ( meydaCallback on AudioCntx )
  // mediaSousce.connect(this.state.audioContexStreamEvent); 
  // bttrnchrn = radn & render
  //
  async useMic(e) { 
    console.log('MICROPHONE'); 

    // Get the Cntx
    let audioContext = this.state.audioContext;
    let gainNode = this.state.gainNode;
    let audioContextStreamEvent = this.state.audioContextStreamEvent

    // Setup Cntx, gain, and the visualizer / streamEventHandler if Not Exists
    if( !audioContext){ 
      await this.setupAudioContext(); 
      this.useMic(e); 
      return 
    }

    // Disconnect the mediaSourse if it exists.
    let mediaSource = this.state.mediaSource;
    if( mediaSource ){ 
      // Disconnect the media Source from the Audio Context Gain and Script Processor
      if (this.state.mp3OrMic == 'mp3'){ 
        mediaSource.disconnect(gainNode)
        mediaSource.disconnect(audioContextStreamEvent);
      }
      else{ return }
    }

    // Now create a new Media Stream from the navigator
    let stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });

    // Use it as the media Sours from the contxt
    mediaSource = await audioContext.createMediaStreamSource(stream);
    mediaSource.connect(gainNode);
    mediaSource.connect(audioContextStreamEvent); 

    //
    // Check if its arleady running. if so no need to rexecute.
    //
    // Start the Butterchurn renderer. This needs to happen on the Mp3 Btn Too.
    let visualizer = this.state.visualizer
    this.butterchurnRandom(); 
    let startRenderer = () => {
      requestAnimationFrame(() => startRenderer());
      visualizer.render();
    }
    startRenderer()

    this.setState( {mediaSource, mp3OrMic : 'mic', meyda } ) 
    
  }




  //
  // Start Mp3
  //

  async useMp3( ) { 
    console.log('SELECTED MP3 PLAYER') 
    this.setState( { mp3OrMic : 'mp3' } )
  }

  async selectMusicFolder(evt) { console.log('SELECTED MP3 PLAYER FOLDER')
    let musicFolder = Array.from(evt.target.files).filter( (entry) => { return entry.type == 'audio/mp3' } )
    this.setState( {musicFolder} )
  }

  //
  // SONG SELECTED --> Load Wavesurfer, Display Song, Connects to Stream
  //
  async loadSong(event){

    // Get the Cntx
    let audioContext = this.state.audioContext;
    let gainNode = this.state.gainNode;
    let audioContextStreamEvent = this.state.audioContextStreamEvent

    // Setup Cntx, gain, and the visualizer / streamEventHandler if Not Exists
    if( !audioContext){ 
      await this.setupAudioContext(); 
      this.loadSong(event); 
      return 
    }

    // Disconnect the mediaSourse if it exists.
    let mediaSource = this.state.mediaSource;
    let audioElement= this.state.audioElement;
    if( mediaSource ){ 
      // Disconnect the media Source from the Audio Context Gain and Script Processor
      if (this.state.mp3OrMic == 'mp3'){ 
        // delete the audioElement. 
        mediaSource.disconnect(gainNode)
        mediaSource.disconnect(audioContextStreamEvent);
      }
      if (this.state.mp3OrMic == 'mic'){ 
        // mediaSource.endOfStrea
        mediaSource.disconnect(gainNode)
        mediaSource.disconnect(audioContextStreamEvent);
      }
    }

    // Load MP3
    audioElement = new Audio(event.target.dataset.mp3url); // Create The Stream/ Audio Element.
    audioElement.setAttribute("controls", "controls");
    document.getElementById('meydaSlider').parentElement.appendChild(audioElement);
    
    console.log('Audio Element', audioElement);
    mediaSource = await audioContext.createMediaElementSource(audioElement);
    mediaSource.connect(gainNode);
    mediaSource.connect(audioContextStreamEvent);

    this.setState( { mp3OrMic : 'mp3', mediaSource, audioElement } ) // playerInfo
    
    /*
    
    let strSplit= e.target.innerHTML.split("-");
    var formatTime = (time) => { 
      return [Math.floor((time % 3600) / 60), 
        ('00' + Math.floor(time % 60)).slice(-2)].join(':'); 
    };

    // WaveSurfer
    let wavesurfer = this.state.wavesurfer
    // wavesurfer.load(mp3url);

    // Display Track Info
    let playerInfo = {
      author : strSplit[0], album : strSplit[1], title : strSplit[2],
      // duration : formatTime(wavesurfer.getDuration())
    };
    
    */
  }
  // End Song Selected

  // playSong
  async playPause() {
    let wavesurfer = this.state.wavesurfer;
    let audio = this.state.audioElement
    !audio.paused ? audio.pause() : audio.play();
    wavesurfer.isPlaying() ? wavesurfer.pause() : wavesurfer.play();
  }




  //
  // Meyda
  //
  //https://github.com/meyda/meyda/wiki/Getting-Started
  async meydaCallback(features){
    // console.log('MeydaCallback', features);
    document.querySelector("#meydaSlider").value = features.rms*10000;
  }
  

  //
  // BLE
  //
  //onReadBatteryLevelButtonClick
  async bleScan (){ 
    ble(this.bleEvent=false, this.bleRead=false)
  }
  async bleRead(event){
    console.log('read', event)
    let batteryLevel = event.target.value.getUint8(0);
    console.log('> Battery Level is ' + batteryLevel + '%');
  }
  async bleEvent(){
    console.log('bleEvent: ' );
    return 'insertCommandHere';
  }

  //
  // MIDI
  //
  async midiEvent( obj, velocity ) {
    console.log('MIDI MESSAGE', obj, velocity )
    let getVal = (id) => { return document.getElementById(id).value; };
    let setVal = (id, val) => { document.getElementById(id).value = val; };
    if( obj.key == 67 ){ setVal('volume', getVal('volume')-10) }
    return 'This was sent from the dashboard to the midiJs file'
  };
  async midiStatus( midiAccess ) {
    console.log('midi event change')
    var inputs = midiAccess.inputs, html;
    html = '<h4>MIDI Inputs:</h4><div class="info">';
    inputs.forEach( (port) => { html += '<p>' + port.manufacturer + ' ' + port.name + '</p>'; } );
    document.getElementById('inputs').innerHTML = html + '</div>';
  }

  // 
  // ButterChurn
  //
  //https://www.npmjs.com/package/butterchurn
  async butterchurnPreset(e) {
    let visualizer = this.state.visualizer
    const presets = butterchurnPresets.getPresets();
    const preset = presets[e.target.value];
    visualizer.loadPreset(preset, 2.0); 
  }
  async butterchurnAutoMix(e) { this.setState( { butterchurnAutoMix : e.target.checked } ) }
  async butterchurnTimeTillTransition(e) { this.setState( { butterchurnTimeTillTransition : e.target.value } ) }
  async butterchurnTransitionLength(e) { this.setState( { butterchurnTransitionLength : e.target.value } ) }
  async butterchurnRandom( ) { 
    let visualizer = this.state.visualizer
    const presets = butterchurnPresets.getPresets();
    let numPresets = Object.keys(presets).length
    let randomNumber = Math.floor(Math.random() * (numPresets - 0 + 1)) + 0;
    let preset = presets[ Object.keys(presets)[randomNumber] ];
    console.log('PRESETs', presets)
    visualizer.loadPreset(preset, 2.0);
    visualizer.setRendererSize(1600, 1200);
  }

  //
  //  RENDER
  //
  render () {
    // 
    const {state} = this.props;
    const {wavesurfer} = this.state;
    let {author, title, album, duration} = this.state.playerInfo;
    let bc_rdm = this.butterchurnRandom
    let bc_tl = this.butterchurnTransitionLength
    let bc_ttl = this.butterchurnTimeTillTransition
    let bc_am = this.butterchurnAutoMix
    let bc_ps = this.butterchurnPreset
    let loadS = this.loadSong;
    
    // Retrieve Songs
    let musicFolder = this.state.musicFolder.map( (entry, i) => {
      var binary= window.URL.createObjectURL(entry);
      // data-mp3url={binary}
      return ([<button key={i + 'song'} data-mp3url={binary} onClick={ (event) => { event.persist(); this.loadSong(event) } }>{entry.name}</button>, <br key={i+'bcds'}/>] )
    } )
    
    // Visibility Toggles
    let mp3Visibility = this.state.mp3OrMic == 'mp3' ? {} : {'display':'none'};
    let visiVisibility = this.state.mp3OrMic ? {}: {'display':'none'};
    let listVisibility = musicFolder.length == 0 ? {'display':'none'} : { overflow : 'auto', height: '300px', width:'35%', background:'lightgray' };
    let songVisibility = this.state.playerInfo.title == 'title' ? {'display':'none'} : {}  

    // butterchurn presets dropdown options
    let presets = butterchurnPresets.getPresets()
    let presetKeys = Object.keys(presets)
    var presetSelect = []
    for(var i = 0; i < presetKeys.length; i++) {
        let optInnerHTML = presetKeys[i].substring(0,60) + (presetKeys[i].length > 60 ? '...' : '');
        let option = <option key={'dashOption'+i} value={optInnerHTML}>{optInnerHTML}</option>
        presetSelect.push(option);
    }
    // console.log('reloading', this.state);
    let hidemediaplayer = {...visiVisibility, ...mp3Visibility}
    let hidecurrentplay = {...visiVisibility, ...mp3Visibility, ...songVisibility}
    let graybox = {
      minWidth:"150px",
      minHeight:"150px",
      maxHeight: "500px",
      borderRadius: "10px",
      border: "aliceblue solid 1px",
      background: "lightslategray",
      textAlign: "center",
      padding: "10px",
      opacity: "85%",
      overflow: "auto"
    }

    return (
      <div id='dashboardid'>
        <canvas id='canvas' width='1200' height='900'></canvas> 
        <section id='controller-container'>
          <div id='controller'>
            
            <div  style={graybox}>
              <h1>Midi Controllers</h1>
              <div id="inputs"></div> 
            </div>

            <div style={graybox}> 
              <h1> Esp32 </h1>
              <button onClick={this.bleScan}> Bluetooth </button> 
              <div id='bluetooth'> </div>
              <p>Name:</p> <input id='espDeviceName'/> <br/>
              <p>Number of Leds:</p> <input id='espNumLeds'/> <br/>
              <p>Owner Name:</p> <input id='espOwnerName'/> <br/>
              <p>Start/Stop:</p> <input id='espStartStop'/> <br/>
              <TapBPM/>
            </div>

            <div style={graybox}> 
              <h1> Select </h1> 
              <button id='usemic' onClick={this.useMic} >Use Mic </button>
              <button id='usemp3' onClick={this.useMp3} >Use Mp3 </button>
            </div>

            <div id='visualizer' style={graybox} style={visiVisibility}>
              <h1> visualizer </h1> 
              <div>Preset: <select onChange={bc_ps} >{presetSelect}</select></div>
              <div>Auto Mix: <input type="checkbox" onClick={bc_am} ></input></div>
              <div>Time Till Transition: <input type="number" onChange={bc_ttl} step="1" min="1"></input></div>
              <div>Transition Length : <input type="number" onChange={bc_tl} step="1" min="1"></input></div>
               <button onClick={bc_rdm}>Randomize</button>
            </div>

            <div style={ visiVisibility } style={graybox}>
              <h1> Meyda </h1> 
              <input type="range" id="meydaSlider" name="volume" min="0" max="500"></input>
            </div>

            <div style={ visiVisibility } style={graybox}>
              <h1> WaveSurfer </h1>
              <div id="waveform"></div>
              <div id="waveform2"></div>
            </div>

            <div style={ hidemediaplayer } style={graybox}>
              <h1> Import Audio </h1>
              <input id='selectMusicFolder' type="file" accept="audio/mp3" webkitdirectory="" mozdirectory="" directory=""  onChange={this.selectMusicFolder}></input>
            </div>

            <div style={listVisibility} style={graybox}> 
              <h1> Playlist </h1> { musicFolder } 
            </div>

            <div style = { hidecurrentplay } style={graybox}>
              <h1> Currently Playing </h1>
              <div>
                <div>Author :<span>{author}</span></div>
                <div>Title :<span>{title}</span></div>
                <div>Album : <span>{album}</span></div>
                <div>Duration : <span>{duration}</span></div>
                <button onClick={this.playPause} > Pause / Play </button>
                <h1> Equalizer </h1>
                <div id="equalizer"></div>
              </div>
            </div>

          </div>
        </section>
      </div>
    )
  }
}

   /*
   wavesurfer.on('ready', ()=> {
      // Reset WaveSurfer filters
      var EQ = [
        { f: 32, type: 'lowshelf' },
        { f: 250, type: 'peaking' },
        { f: 1000, type: 'peaking' },
        { f: 4000, type: 'peaking' },
        { f: 16000, type: 'highshelf' }
      ];
      var filters = EQ.map( (band) => {
        var filter = wavesurfer.backend.ac.createBiquadFilter();
        filter.type = band.type;
        filter.gain.value = 0;
        filter.Q.value = 1;
        filter.frequency.value = band.f;
        return filter;
      } ); wavesurfer.backend.setFilters(filters);

      // Bind filters to vertical range sliders
      var container = document.querySelector('#equalizer');
      container.innerHTML = '';
      filters.forEach( (filter) => {
        var input = document.createElement('input');
        wavesurfer.util.extend(input, {
          type: 'range',
          min: -40,
          max: 40,
          value: 0,
          title: filter.frequency.value
        });
        wavesurfer.drawer.style(input, {
          'webkitAppearance': 'slider-vertical',
          width: '50px',
          height: '150px'
        });
        container.appendChild(input);

        var onChange= (e)=> { filter.gain.value = ~~e.target.value; }; 
        input.addEventListener('input', onChange);
        input.addEventListener('change', onChange);
      });
    });
    */