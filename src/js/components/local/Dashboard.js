import React, {Component} from 'react';

let songList = [];
  function handleFileSelect(evt) {
  	console.log('whooo')
    songList = evt.target.files;
    //scrollDownPlaylist();
  	/*
	var files = evt.target.files; // FileList object

	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
	  output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
				  f.size, ' bytes, last modified: ',
				  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
				  '</li>');
	}
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
	*/
  var file = evt.target.files[0];
  var reader = new FileReader();
  let audio = document.getElementById('myAudio');

  document.getElementById('testt').innerHTML = file.name

  var binary= window.URL.createObjectURL(file);
  document.getElementById('songs').innerHTML = <button mp3Url={binary}> { file.name } </button>
  if (evt.target.files && file) {
	var reader = new FileReader();
	reader.onload = function (e) {
	  audio.setAttribute('src', binary);
	  audio.play();
	}
	reader.readAsDataURL(file);
  }
    
  }


export default class Dashboard extends Component {
  displayName: 'Dashboard';
  constructor(props) {
    super(props);
    this.updateSongList = this.updateSongList.bind(this);
  }
  componentDidMount(){
  	
  	require('js/utils/bluetooth');

    document.getElementById('input').addEventListener('change', handleFileSelect, false);

	var element = document.getElementById('browser');
	var reader = new FileReader();
	var songListFormatted = [];
	var index = 0;
	// Create
	var wavesurfer = WaveSurfer.create({
	  container: '#waveform',
	  progressColor: '#efefef',
	  waveColor: 'blue',
	  cursorColor: 'pink',
	  splitChannels: true,
	  hideScrollbar: false,
	});
	// Buttons
	var prevBtn = document.getElementById('previous');
	var skipForwardBtn = document.getElementById('skipForward');
	var skipBackwardBtn = document.getElementById('skipBackward');
	var playBtn = document.getElementById('playBtn');
	var muteBtn = document.getElementById('mute');
	var nextBtn = document.getElementById('next');
	// https://github.com/JMPerez/beats-audio-api/blob/gh-pages/script.js

	var slider = document.querySelector('#slider');

	skipForwardBtn.addEventListener('click', skipForward, false);
	skipBackwardBtn.addEventListener('click', skipBackward, false);
	prevBtn.addEventListener('click', prev, false);
	nextBtn.addEventListener('click', next, false);
	playBtn.addEventListener('click', playToggle, false);
	muteBtn.addEventListener('click', muteToggle, false);
	slider.oninput = function () { wavesurfer.zoom(Number(slider.value)) };
	// settings

	var mic = WaveSurfer.create({ container: '#mic', waveColor: 'violet' });
	var microphone = Object.create(WaveSurfer.Microphone);
	microphone.init({ wavesurfer: mic });
	microphone.on('deviceReady', function(stream) { console.log('Device ready!', stream); });
	microphone.on('deviceError', function(code) { console.warn('Device error: ' + code); });
  }

  async updateSongList( ){
  	console.log( 'asdkfjaldsf' );
  	console.log( Document.getElementById('input') );
  	console.log(this);
  	songList = [];
  	//setState(songList: this)
  }

		//<input id='input' type="file" accept="audio/mp3" webkitdirectory="" mozdirectory="" directory="" />
  // START MICROPHONE
  render () {
	const {state} = this.props;
    let equalizerStyle = { marginTop : '10px'}
    let sliderStyle = { width : '100%' }
    return (  
	  <div>
	    <div id='bluetooth'> </div>
	    <input id='input' type="file"/>
		<div id='testt' > Please Select A Song </div>
	    <audio controls id="myAudio" autoPlay type="audio/mpeg" />
		<div id="mic"></div>
		<p align="center"> <button id='startMicrophone' className="btn btn-primary btn-lg">Microphone </button> </p>

		<div id='browser'>
		  <button id='prev10'>previous10</button>
		  <button id='past10'>next10</button>
		  <div id="songs"></div>
		  <div id="song">
			<div id="track" hidden>
			  <div className="controls">
				<button id="previous"> Previous </button>
				<button id="skipBackward"> <i className="fa fa-step-backward"></i></button>
				<button id="playBtn" > <i className="fa fa-play"></i><i className="fa fa-pause"></i></button>
				<button id="skipForward"><i className="fa fa-step-forward"></i></button>
				<button id="mute" className="fa fa-volume-off"></button>
				<button id="next"> Next </button>
			  </div>
			  <div>Author /<span id="author">Author</span></div>
			  <div>Title /<span id="title">Title</span></div>
			  <div>Album / <span id="album">Album</span></div>
			  <div>Time / <span id="time">Time</span></div>
			  <div>Duration / <span id="duration">Duration</span></div>
			  <div id="equalizer" style={equalizerStyle}></div>
			  <div id="wave-spectrogram"></div>
			  <div id="waveform"></div>
			  <div id="wave-timeline"></div>
			  <input id="slider" type="range" min="1" max="200" value="1" style={sliderStyle} readOnly={true}/>
			</div>
		  </div>
		</div>
	  </div>
    )
  }
}
function scrollDownPlaylist(){
  	console.log('haha')
	  let content = songList;
	  console.log(songList)
	  document.getElementById('songs').innerHTML = ('');
	  for (var index = 0, l = 10; index < l; ++index) {
		if(content[index] != undefined){
		  var type = content[index].type.substring(0, 5);
		  if (content[index].type == 'audio/mp3'){
			var binary= window.URL.createObjectURL(content[index]);
			     
			document.getElementById('songs').innerHTML += ("<button mp3Url='"+binary+"' onclick='loadSong(this)'>"+content[index].name +"</button><br>")
		  }
		}
		if(index > content.length-1){index=0}
		else{index= index+1};
	  }
  }
  
function skipForward(e) {  wavesurfer.skip(1);}
function skipBackward(e) {  wavesurfer.skip(-1);}
function next(e) {  wavesurfer.play(index - 1);}
function prev(e) {  wavesurfer.play(index + 1);}

//setVolume(newVolume);
//setPlaybackRate(rate);

/*
wavesurfer.addRegion({ 
	start: 20, 
	end: 22, 
	color: 'hsla(100, 100%, 30%, 0.3)' 
});
*/
var formatTime = function (time) {
    return [
        Math.floor((time % 3600) / 60), // minutes
        ('00' + Math.floor(time % 60)).slice(-2) // seconds
    ].join(':');
};
function loadSong(e){
  console.log(e.innerHTML);
  document.getElementById('track').removeAttribute('hidden');
  
  //decodeSoundFile(e.getAttribute('mp3Url'));
  
  wavesurfer.load(e.getAttribute('mp3Url'));
	wavesurfer.on('audioprocess', function () {
		document.getElementById("time").innerHTML = formatTime(wavesurfer.getCurrentTime());
	});
  wavesurfer.on('ready', function () {
	  
	  
	buffer = wavesurfer.backend.buffer;
	console.log(wavesurfer.backend.buffer);
	var width = wavesurfer.getDuration() * wavesurfer.params.minPxPerSec * wavesurfer.params.pixelRatio;
	console.log(wavesurfer.backend.getPeaks(width));
	    
    notify(e.innerHTML, {});
    var strSplit=e.innerHTML.split("-");
    document.getElementById("author").innerHTML =strSplit[0];
    document.getElementById("title").innerHTML = strSplit[2];
    document.getElementById("album").innerHTML = strSplit[1];
    document.getElementById("duration").innerHTML = formatTime(wavesurfer.getDuration());
	    
	// Timeline
    var timeline = Object.create(WaveSurfer.Timeline);
    timeline.init({
        wavesurfer: wavesurfer,
        container: "#wave-timeline"
    });
    var spectrogram = Object.create(WaveSurfer.Spectrogram);
    // Spectrogram
    spectrogram.init({
        wavesurfer: wavesurfer,
        container: "#wave-spectrogram",
        fftSamples: 512,
        windowFunc:'bartlettHann' //'bartlett', 'bartlettHann', 'blackman', 'cosine', 'gauss', 'hamming', 'hann', 'lanczoz', 'rectangular', 'triangular'
    });

    // Filters
	var EQ = [ 
	  { frequency: 32, type: 'lowshelf' }, 
	  { frequency: 500, type: 'peaking' }, 
	  { frequency: 4000, type: 'peaking' }
	];
	var filters = EQ.map(function (band) {
	  var filter = wavesurfer.backend.ac.createBiquadFilter();
	  filter.type = band.type;
	  filter.gain.value = 0;
	  filter.Q.value = 1;
	  filter.frequency.value = band.frequency;
      return filter;
	});
	wavesurfer.backend.setFilters(filters);
	wavesurfer.filters = filters;
	// Equalizer
	var container = document.querySelector('#equalizer');
	container.innerHTML = "";
	filters.forEach(function (filter) {
	  var input = document.createElement('input');
	  wavesurfer.util.extend(input, { type: 'range', min: -40, max: 40, value: 0, title: filter.frequency.value });
	  input.style.display = 'inline-block';
	  input.setAttribute('orient', 'vertical');
	  wavesurfer.drawer.style(input, { 'webkitAppearance': 'slider-vertical', width: '50px', height: '150px' });
	  container.appendChild(input);
	  var onChange = function (e) { filter.gain.value = ~~e.target.value; };
	  input.addEventListener('input', onChange);
	  input.addEventListener('change', onChange);
	});
  });
}

function startAt(start,stop){   if(wavesurfer.isPlaying()){ wavesurfer.stop() } wavesurfer.play(start,stop);  }

function notify(title) {
  console.log(title);
  var strSplit=title.split("-");
  if (!("Notification" in window)) { return; }
  else if (Notification.permission === "granted") {
	var attr = { body: strSplit[2], tag: 'tag' };
    var notice = new Notification(strSplit[0].substr(0, 110), attr);
    setTimeout(notice.close.bind(notice), 5000);
  } 
}

function playToggle() {
  wavesurfer.playPause();
  if(wavesurfer.paused) {
    audio.play();play(index + 1)
    playBtn.classList.add('is-playing');
    playBtn.classList.remove('is-paused');
  }
  else {
    audio.pause();
    playBtn.classList.remove('is-playing');
    playBtn.classList.add('is-paused');
  }
}
function muteToggle() { 
  wavesurfer.toggleMute();
  if(wavesurfer.getMute()){
    muteBtn.classList.remove('fa-volume-up');
    muteBtn.classList.add('fa-volume-off');
  }
  else{
    muteBtn.classList.remove('fa-volume-off');
    muteBtn.classList.add('fa-volume-up');
  }
}