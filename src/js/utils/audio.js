  <div className="controls">
	<button onClick={prev} > Previous </button>
	<button onClick={skipBackward} > <i className="fa fa-step-backward"></i></button>
	<button onClick={playToggle} > <i className="fa fa-play"></i><i className="fa fa-pause"></i></button>
	<button onClick={skipForward} ><i className="fa fa-step-forward"></i></button>
	<button onClick={muteToggle} className="fa fa-volume-off"></button>
	<button onClick={next} > Next </button>
  </div>
			  
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
function skipForward(e) {  wavesurfer.skip(1);}
function skipBackward(e) {  wavesurfer.skip(-1);}
function next(e) {  wavesurfer.play(index - 1);}
function prev(e) {  wavesurfer.play(index + 1);}
