import React, {Component} from 'react';
import WaveSurfer from 'wavesurfer';

// https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js
let drawWave = {
  container: '#waveform',
  progressColor: '#efefef',
  waveColor: 'blue',
  cursorColor: 'pink',
  splitChannels: false,
  hideScrollbar: true,
}
var formatTime = function (time) { return [Math.floor((time % 3600) / 60), ('00' + Math.floor(time % 60)).slice(-2)].join(':'); };

export default class Dashboard extends Component {
  displayName: 'Dashboard';
  constructor(props) {
    super(props);
    this.loadSong = this.loadSong.bind(this);
    this.playPause = this.playPause.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.state = {
      songList : [],
      wavesurfer : null,
      playerInfo : {
	  	author : 'author',
	  	album : 'album',
	  	title : 'title',
	  	duration : 'duration'
	  }
    }
  }
  componentDidMount(){
  	require('js/utils/bluetooth');
	var wavesurfer = WaveSurfer.create(drawWave);
	this.setState( {wavesurfer} )
  }
  async handleFileSelect(evt) { 
    let songList = this.state.songList.concat( Array.from(evt.target.files) );
    this.setState( {songList} )
  }
  //
  // loadSong
  //
  async loadSong(e){
  	let wavesurfer = this.state.wavesurfer
    document.getElementById('track').removeAttribute('hidden');
    //decodeSoundFile(e.getAttribute('mp3Url'));
    let trg = e.target
    var strSplit=trg.innerHTML.split("-");
	let playerInfo = {
	  author : strSplit[0],
	  album : strSplit[1],
	  title : strSplit[2],
	  duration : formatTime(wavesurfer.getDuration())
	}
	wavesurfer.load(trg.dataset.mp3url);
	// wavesurfer.on('audioprocess', function () { formatTime(wavesurfer.getCurrentTime()) });
wavesurfer.on('ready', function () {
  var EQ = [
    { f: 32, type: 'lowshelf' }, 
    { f: 250, type: 'peaking' }, 
    { f: 1000, type: 'peaking' }, 
    { f: 4000, type: 'peaking' }, 
    { f: 16000, type: 'highshelf' }
  ];

  // Create filters
  var filters = EQ.map(function (band) {
    var filter = wavesurfer.backend.ac.createBiquadFilter();
    filter.type = band.type;
    filter.gain.value = 0;
    filter.Q.value = 1;
    filter.frequency.value = band.f;
    return filter;
  });

  // Connect filters to wavesurfer
  wavesurfer.backend.setFilters(filters);

  // Bind filters to vertical range sliders
  var container = document.querySelector('#equalizer');
  filters.forEach(function (filter) {
    var input = document.createElement('input');
    wavesurfer.util.extend(input, {
      type: 'range',
      min: -40,
      max: 40,
      value: 0,
      title: filter.frequency.value
    });
    input.style.display = 'inline-block';
    input.setAttribute('orient', 'vertical');
    wavesurfer.drawer.style(input, {
      'webkitAppearance': 'slider-vertical',
      width: '50px',
      height: '150px'
    });
    container.appendChild(input);

    var onChange = function (e) {
      filter.gain.value = ~~e.target.value;
    };

    input.addEventListener('input', onChange);
    input.addEventListener('change', onChange);
  });

  // For debugging
  wavesurfer.filters = filters;
});
    this.setState( {playerInfo} )
  }
  //
  // playSong
  //
  async playPause() {
  	let wavesurfer = this.state.wavesurfer;
  	wavesurfer.isPlaying() ? wavesurfer.pause() : wavesurfer.play();
  }

//https://github.com/meyda/meyda/wiki/Getting-Started
//https://www.npmjs.com/package/butterchurn
  render () {
	const {state} = this.props;
	const {wavesurfer} = this.state;
	let {author, title, album, duration} = this.state.playerInfo;
	let playPause = wavesurfer ? wavesurfer.playPause() : '';
    let equalizerStyle = { marginTop : '10px'}
    let sliderStyle = { width : '100%' }
    let songListStyle = { overflow : 'auto', height: '300px', width: '50%', margin:'auto', background:'lightgray' }

    // Retrieve Songs
    let con = this.state.songList;
    let songList = con.map( (entry, i) => {
	  var type = entry.type.substring(0, 5);
	  if (entry.type == 'audio/mp3'){
	    var binary= window.URL.createObjectURL(entry);
	    return ([<button key={i} data-mp3url={binary} onClick={ this.loadSong }>{entry.name}</button>, <br key={i+'b'}/>] )
	  }
    } )
    return ( 
	  <div>	    
	    <div id='bluetooth'> </div>
	    <input type="file" accept="audio/mp3" webkitdirectory="" mozdirectory="" directory=""  onChange={this.handleFileSelect} />
        
	    <div style={songListStyle}> { songList } </div>

		<div id="track" hidden>
		  <div>Author :<span>{author}</span></div>
		  <div>Title :<span>{title}</span></div>
		  <div>Album : <span>{album}</span></div>
		  <div>Duration : <span>{duration}</span></div> 

		  <button onClick={this.playPause} > Pause / Play </button>


		  <div id="equalizer" style={equalizerStyle}></div> 
		  <div id="waveform"></div> 
		</div>
	  </div>
    )
  }
}