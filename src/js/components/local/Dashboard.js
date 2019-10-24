import React, {Component} from 'react';
import * as WaveSurfer from 'wavesurfer';
import SonicSocket from 'sonicnet';
import {midi} from 'js/utils/midi';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import meyda from 'meyda';
import TapBPM from 'js/components/local/TapBPM';
function myFunction(url ) {
  var x = document.createElement("AUDIO");
  if (x.canPlayType("audio/mpeg")) {
    x.setAttribute("src",url);
  } else {
    x.setAttribute("src","horse.ogg");
  }
  x.setAttribute("controls", "controls");
  document.getElementById('meydaSlider').appendChild(x);
}
// https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
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
var EQ = [
  { f: 32, type: 'lowshelf' },
  { f: 250, type: 'peaking' },
  { f: 1000, type: 'peaking' },
  { f: 4000, type: 'peaking' },
  { f: 16000, type: 'highshelf' }
];
var formatTime = function (time) { 
  return [Math.floor((time % 3600) / 60), 
    ('00' + Math.floor(time % 60)).slice(-2)].join(':'); 
};


//
// Dashboard
// Connects to Bluetooth and Plays Audio Files. 
// Decodes Audio and Broadcasts Aesthetic Color to Bluetooth.
//
export default class Dashboard extends Component {
  displayName: 'Dashboard';
  constructor(props) {
    super(props);
    this.loadSong = this.loadSong.bind(this);
    this.playPause = this.playPause.bind(this);
    this.selectMusicFolder = this.selectMusicFolder.bind(this);
    this.useMic = this.useMic.bind(this);
    this.useMp3 = this.useMp3.bind(this);
    this.meydaCallback = this.meydaCallback.bind(this)
    this.butterchurnPreset = this.butterchurnPreset.bind(this);
    this.butterchurnAutoMix = this.butterchurnAutoMix.bind(this);
    this.butterchurnTimeTillTransition = this.butterchurnTimeTillTransition.bind(this);
    this.butterchurnRandom = this.butterchurnRandom.bind(this);
    this.butterchurnTransitionLength = this.butterchurnTransitionLength.bind(this);
    this.midiCommand = this.midiCommand.bind(this);
    this.connectStream = this.connectStream.bind(this);
    this.disconnectStream=this.disconnectStream.bind(this);
    this.state = {
      mp3analyzer : null,
      audioElement : null,
      wavesurfer : null,
      visualizer : null,
      source: null,
      meyda: null,
      analyze_stream: null,
      source: null,
      gainNode: null,
      audioContext : null, //https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
      mp3OrMic : false,
      musicFolder : [],
      butterchurnAutoMix : false,
      butterchurnTimeTillTransition : 0,
      butterchurnTransitionLength : 0,
      playerInfo : {
        author : 'author',
        album : 'album',
        title : 'title',
        duration : 'duration'
      }
    }
  }

  // 0) SETUP
  componentDidMount(){
    let midiFlag = false
    midi(this.state.midiCommand)
    require('js/utils/bluetooth');

    let audioContext = new AudioContext();
    audioContext.resume();
    let gainNode = audioContext.createGain();  
    gainNode.gain.value = 1.25;

    // The stream analyzer can recieve input data from an AudioContext.Analyzer nodes getByteData method 
    let analyze_stream = audioContext.createScriptProcessor(4096, 1, 1);
    let flag = false;
    analyze_stream.onaudioprocess = (event) => {
      if(this.state.mp3OrMic == 'mp3'){
        let ib = event.inputBuffer;
        wavesurfer2.empty();
        wavesurfer2.loadDecodedBuffer(ib);
        visualizer.render();
      }
      else if(this.state.mp3OrMic == 'mic'){    
        let ib = event.inputBuffer;
        wavesurfer2.empty();
        wavesurfer2.loadDecodedBuffer(ib);
        visualizer.render();
      }
      else{  }
    }
    analyze_stream.connect(audioContext.destination);
    let wavesurfer2 = WaveSurfer.create( { ...drawWave });
    let wavesurfer = WaveSurfer.create( { ...drawWave, ...{

    } });

    //  Visualizer > connects to the AudioContext
    let visualizer = butterchurn.createVisualizer(audioContext, document.getElementById('canvas'), { } )
    visualizer.connectAudio(gainNode);

    this.setState( { wavesurfer, visualizer, audioContext, gainNode, analyze_stream} )
  }


  // MICROPHONE
  async useMic(e) { 
    console.log('MICROPHONE'); 
    let meyda = this.state.meyda; 
    if( meyda ){ meyda.stop(); } 
    let source = this.state.source;
    if( source ){ console.log('Mic disconnect', source); source = this.disconnectStream(source); }
    else{ console.log('Mic', source) }
    let audioContext = this.state.audioContext 
    // Create a stream from the audio context using a microphone audio
    // Use the AudioContext to analyze the source
    let init_mic_stream = async (audio) => { 
      source = audioContext.createMediaStreamSource(audio); // Create a stream of data
      source = await this.connectStream(source) 
      this.butterchurnRandom(); 
      // Meyda requires an audio source that is only available at this moment. 
      meyda = Meyda.createMeydaAnalyzer({
        "audioContext": audioContext, 
        "source": source, 
        "bufferSize": 512, 
        "featureExtractors": ["rms"], 
        "callback": this.meydaCallback 
      } ) 
      meyda.start(); 
      this.setState( {source, meyda} );
    } 
    navigator.getUserMedia( { audio: true }, init_mic_stream, (err) => { } ); 
    this.setState( { mp3OrMic : 'mic' } ) 
  } 

  // SONG SELECTED
  async loadSong(e){
    let wavesurfer = this.state.wavesurfer
    let currentTrack = e.target
    let strSplit=currentTrack.innerHTML.split("-");
    let playerInfo = {
      author : strSplit[0], album : strSplit[1], title : strSplit[2],
      duration : formatTime(wavesurfer.getDuration())
    };
    let audio = new Audio(currentTrack.dataset.mp3url);
    console.log('LOADING SONG', currentTrack);


    // Create an audio stream Visualization
    // THE PROBLEM IS THAT THIS GOES TO WAVESURFER. 

    let audioContext = this.state.audioContext
    let source = audioContext.createMediaElementSource(audio);
    source = await this.connectStream(source)
    let meyda = this.state.meyda
    meyda = Meyda.createMeydaAnalyzer({
      "audioContext": audioContext,
      "source": source,
      "bufferSize": 512,
      "featureExtractors": ["rms"],
      "callback": this.meydaCallback
    })
    meyda.start();
    
    console.log('source', source)
    console.log('audioElement', audio)
    myFunction(currentTrack.dataset.mp3url);
    wavesurfer.load(currentTrack.dataset.mp3url);

    this.setState( {meyda, source, audioContext, playerInfo, wavesurfer, audioElement : audio} )
  }

  // DISCONNECT STREAM
  async disconnectStream(source){ 
    console.log("attempting to disconnect from source, ", source )
    let gainNode = this.state.gainNode
    let analyze_stream = this.state.analyze_stream
    try { source.disconnect(this.state.gainNode) } catch(err) { }
    try { source.disconnect(this.state.analyze_stream) } catch(err) { }
    console.log("Disconnected Source", source )
    return source
  } 
  // The Stream cant be heard without connecting it to the gain node. 
  // Feed the Stream into an WAVESURFER Stream Analyzer. 
  async connectStream(source){ 
      source.connect(this.state.gainNode); // The Stream cant be heard without connecting it to the gain node. 
      source.connect(this.state.analyze_stream); // Feed the Stream into an WAVESURFER Stream Analyzer. 
      return source 
  } 

  // Local MP3 Media Player
  async useMp3( ) { 
    console.log('SELECTED MP3 PLAYER')
    let meyda = this.state.meyda;
    let audioContext = this.state.audioContext;
    let gainNode = this.state.gainNode;
    let analyze_stream = this.state.analyze_stream;
    let source = this.state.source;
    if( source ){ console.log('MP3 Disconnecting', source); source = await this.disconnectStream(source); }
    else{ console.log('MP3', source); }
    if( meyda ){ meyda.stop(); }
    this.setState( { mp3OrMic : 'mp3', source, audioContext, gainNode, analyze_stream } )
  }

  // SELECT Music Folder
  async selectMusicFolder(evt) {
    console.log('SELECTED MP3 PLAYER FOLDER')
    let musicFolder = Array.from(evt.target.files).filter( (entry) => { return entry.type == 'audio/mp3' } )
    this.setState( {musicFolder} )
  }

    /*
  // globals Meyda 
const audioContext = new AudioContext();
const htmlAudioElement = document.getElementById("audio");
const source = audioContext.createMediaElementSource(htmlAudioElement);
source.connect(audioContext.destination);
const levelRangeElement = document.getElementById("levelRange");
const analyzer = Meyda.createMeydaAnalyzer({
  "audioContext": audioContext,
  "source": source,
  "bufferSize": 512,
  "featureExtractors": ["rms"],
  "callback": features => {
    console.log(features);
    levelRangeElement.value = features.rms;
  }
});
analyzer.start();
*/
   /*
   wavesurfer.on('ready', ()=> {
      // Reset WaveSurfer filters
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


  // playSong
  async playPause() {
    let wavesurfer = this.state.wavesurfer;
    let audio = this.state.audioElement
    wavesurfer.isPlaying() ? (wavesurfer.pause(), audio.pause() ) : ( wavesurfer.play(), audio.play() )

  }

  async meydaCallback(features){
    // console.log('MeydaCallback', features);
    document.querySelector("#meydaSlider").value = features.rms*10000
  }
  


  // 1) SELECT Music Folder
  async midiCommand( obj, velocity ) {
    console.log('MIDI MESSAGE', obj, velocity )
    let getVal = (id) => { return document.getElementById(id).value; };
    let setVal = (id, val) => { document.getElementById(id).value = val; };
    if( obj.key == 67 ){ setVal('volume', getVal('volume')-10) }
    midiFlag = midiFlag ? true:true;
    return 'This was sent from the dashboard to the midiJs file'
  };

  // visualizer: load a preset
  async butterchurnPreset(e) {
    let visualizer = this.state.visualizer
    const presets = butterchurnPresets.getPresets();
    const preset = presets[e.target.value];
    visualizer.loadPreset(preset, 2.0); }
  async butterchurnAutoMix(e) { this.setState( { butterchurnAutoMix : e.target.checked } ) }
  async butterchurnTimeTillTransition(e) { this.setState( { butterchurnTimeTillTransition : e.target.value } ) }
  async butterchurnTransitionLength(e) { this.setState( { butterchurnTransitionLength : e.target.value } ) }
  async butterchurnRandom( ) { 
    let visualizer = this.state.visualizer
    const presets = butterchurnPresets.getPresets();
    let numPresets = Object.keys(presets).length
    let randomNumber = Math.floor(Math.random() * (numPresets - 0 + 1)) + 0;
    let preset = presets[ Object.keys(presets)[randomNumber] ];
    console.log('PRESET', preset, randomNumber, presets)
    visualizer.loadPreset(preset, 2.0);
    visualizer.setRendererSize(1600, 1200);
  }





  //https://github.com/meyda/meyda/wiki/Getting-Started
  //https://www.npmjs.com/package/butterchurn
  render () {
    const {state} = this.props;
    const {wavesurfer} = this.state;
    let {author, title, album, duration} = this.state.playerInfo;
    let bc_rdm = this.butterchurnRandom
    let bc_tl = this.butterchurnTransitionLength
    let bc_ttl = this.butterchurnTimeTillTransition
    let bc_am = this.butterchurnAutoMix
    let bc_ps = this.butterchurnPreset
    
    // Retrieve Songs
    let musicFolder = this.state.musicFolder.map( (entry, i) => {
      var binary= window.URL.createObjectURL(entry);
      return ([<button key={i} data-mp3url={binary} onClick={ this.loadSong }>{entry.name}</button>, <br key={i+'b'}/>] )
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
    console.log('reloading', this.state);
    let hidemediaplayer = {...visiVisibility, ...mp3Visibility}
    let hidecurrentplay = {...visiVisibility, ...mp3Visibility, ...songVisibility}

    return (
      <div id='dashboardid'>
        <canvas id='canvas' width='1200' height='900'></canvas> 
        <section id='controller-container'>
          <div id='controller'>
            
            <div  className='graybox'>
              <h1>Midi Controllers</h1>
              <div id="inputs"></div> 
            </div>

            <div className='graybox'> 
              <h1> Esp32 </h1>
              <button id='bluetooth'/>  
              <p>Name:</p> <input id='espDeviceName'/> <br/>
              <p>Number of Leds:</p> <input id='espNumLeds'/> <br/>
              <p>Owner Name:</p> <input id='espOwnerName'/> <br/>
              <p>Start/Stop:</p> <input id='espStartStop'/> <br/>
              <TapBPM/>
            </div>

            <div className='graybox'> 
              <h1> Select </h1> 
              <button id='usemic' onClick={this.useMic} >Use Mic </button>
              <button id='usemp3' onClick={this.useMp3} >Use Mp3 </button>
            </div>

            <div id='visualizer' className='graybox' style={visiVisibility}>
              <h1> Visualizer </h1> 
              <div>Preset: <select onChange={bc_ps} >{presetSelect}</select></div>
              <div>Auto Mix: <input type="checkbox" onClick={bc_am} ></input></div>
              <div>Time Till Transition: <input type="number" onChange={bc_ttl} step="1" min="1"></input></div>
              <div>Transition Length : <input type="number" onChange={bc_tl} step="1" min="1"></input></div>
               <button onClick={bc_rdm}>Randomize</button>
            </div>

            <div style={ visiVisibility } className='graybox'>
              <h1> Meyda </h1> 
              <input type="range" id="meydaSlider" name="volume" min="0" max="500"></input>
            </div>

            <div style={ visiVisibility } className='graybox'>
              <h1> WaveSurfer </h1>
              <div id="waveform"></div>
              <div id="waveform2"></div>
            </div>

            <div style={ hidemediaplayer } className='graybox'>
              <h1> Import Audio </h1>
              <input id='selectMusicFolder' type="file" accept="audio/mp3" webkitdirectory="" mozdirectory="" directory=""  onChange={this.selectMusicFolder}></input>
            </div>

            <div style={listVisibility} className='graybox'> 
              <h1> Playlist </h1> { musicFolder } 
            </div>

            <div style = { hidecurrentplay } className='graybox'>
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
https://github.com/borismus/sonicnet.js/tree/master/lib
console.log('sonicsocket', SonicSocket)
ssocket = new SonicSocket({alphabet: '0123456789'});
function onButton() {
  ssocket.send('31415');
}
sserver = new SonicServer({alphabet: '0123456789'});
sserver.on('message', function(message) {
  // Expect message to be '31415'.
  console.log(message);
});
sserver.start();
*/

