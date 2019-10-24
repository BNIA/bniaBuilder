let characteristicXYZ = ''

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
  	return onConnect(characteristic)
  })
  .then(_ => {
    console.log('Bluetooth Set Up');
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
}


//
// The main thread called whence a device is connected. 
// 
// use characteristic.writeValue( str2ab( '<command>' ) ) to encode then send your message. Event listeners are useful triggers
//
function onConnect(characteristic){
  characteristicXYZ = characteristic
  console.log('chacaracteristic: ', characteristic);
  createEventListener('theaterChaseRainbow', characteristic);
  createEventListener('theaterChase', characteristic);
  createEventListener('rainbowCycle', characteristic);
  createEventListener('rainbow', characteristic);
  createEventListener('swipe', characteristic);
  setInterval( meydaSlider, 100);
  console.log('Writing Characteristic...');
   return characteristic.writeValue(str2ab('rainbow'));
}

function createEventListener(eventId, characteristic){
  document.getElementById('bluetooth').insertAdjacentHTML('afterend', "<button id='"+eventId+"'> "+eventId+" </button>");
  document.getElementById(eventId).addEventListener('click', function(event) { console.log('SENDING', eventId); characteristic.writeValue(str2ab(eventId)); });
}

function meydaSlider(){
  let value = document.getElementById('meydaSlider').value
  value = pad_with_zeroes(value);
  console.log('MEYDA VALUE ', value )

  // console.log(characteristicXYZ);
  characteristicXYZ.writeValue(str2ab(value)); 
}

function pad_with_zeroes(number) {
	let length = 3;
    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }
    return my_string;
}

// Loudness(RMS/Energy), Percussion Vs Pitch(ZCR), 

//
//
// Time-domain features
//
//
// RMS 
// Description: Range: 0.0 - 1.0 The root mean square of the waveform. 
// Use: Corresponds to its loudness. Getting a rough idea about the loudness of a signal.
//
// ZCR
// Description: Range: 0 - ((buffer size / 2) - 1) # times the signal crosses the buffers zero value.
// Use: Helps differentiating between percussive and pitched sounds. 
// -- Percussive sounds will have a random ZCR across buffers
// -- Pitched sounds will return a more constant value.
// Range: Default ZCR range is 0 - 255. dDfault buffer size (bufferSize) is 512. 
//
//  Energy
// Description: Range: 0 - bufferSize The infinite integral of the squared signal.
// Use: This is another indicator to the loudness of the signal.
//
//
// Spectral Features
//
//
// AmplitudeSpectrum
// Description: This is also known as the magnitude spectrum. By calculating the Fast Fourier Transform (FFT), 
// we get the signal represented in the frequency domain. The output is an array, where each index is a frequency bin 
// (i.e. containing information about a range of frequencies) containing a complex value (real and imaginary). 
// The amplitude spectrum takes this complex array and computes the amplitude of each index. 
// The result is the distribution of frequencies in the signal along with their corresponding strength. 
// If you want to learn more about Fourier Transform, and the differences between time-domain to frequency-domain analysis, 
// this article is a good place to start.
// Use: Very useful for any sort of audio analysis. In fact, many of the features extracted in Meyda are based on this :).
// Range: An array half the size of the FFT, containing information about frequencies between 0 - half of the sampling rate. 
// In Meyda the default sampling rate (sampleRate) is 44100Hz and the FFT size is equal to the buffer size (bufferSize) - with a default of 512.
//
// Power Spectrum
// Description: This is the amplitudeSpectrum squared.
// Use: This better emphasizes the differences between frequency bins, compared to the amplitude spectrum.
// Range: An array half the size of the FFT, containing information about between frequencies 0 - half of the sampling rate. 
// In Meyda the default sampling rate (sampleRate) is 44100Hz and the FFT size is equal to the buffer size (bufferSize) - with a default of 512.
//
// Spectral Centroid
// Description: An indicator of the “brightness” of a given sound, representing the spectral centre of gravity. 
// If you were to take the spectrum, make a wooden block out of it and try to balance it on your finger (across the X axis), 
// the spectral centroid would be the frequency that your finger “touches” when it successfully balances.
// Use: As mentioned, it’s quantifying the “brightness” of a sound. This can be used for example to classify 
// a bass guitar (low spectral centroid) from a trumpet (high spectral centroid).
// Range: 0 - half of the FFT size. In Meyda the FFT size is equal to the buffer size (bufferSize) - with a default of 512.
//
// Spectral Flatness
// Description: The flatness of the spectrum. It is computed using the ratio between the geometric and arithmetic means.
// Use: Determining how noisy a sound is. For example a pure sine wave will have a flatness that approaches 0.0, and white noise will have a flatness that approaches 1.0.
// Range: 0.0 - 1.0 where 0.0 is not flat and 1.0 is very flat.
//
// Spectral Flux
// Description: A measure of how quickly the spectrum of a signal is changing. It is calculated by computing the difference between the current spectrum and that of the previous frame.
// Use: Often corresponds to perceptual “roughness” of a sound. Can be used for example, to determine the timbre of a sound.
// Range: Starts at 0.0. This has no upper range as it depends on the input signal.
//
// Spectral Slope
// Description: A measure of how ‘inclined’ the shape of the spectrum is. Calculated by performing linear regression on the amplitude spectrum.
// Use: Can be used to differentiate between different voice qualities, such as hissing, breathing and regular speech. Closely relates to spectral centroid and spectral rolloff.
// Range: 0.0 - 1.0
//
// Spectral Rolloff
// Description: The frequency below which is contained 99% of the energy of the spectrum.
// Use: Can be used to approximate the maximum frequency in a signal.
// Range: 0 - half of the sampling rate. In Meyda the default sampling rate (sampleRate) is 44100Hz.
//
// Spectral Spread
// Description: Indicates how spread the frequency content is across the spectrum. Corresponds with the frequency bandwidth.
// Use: Can be used to differentiate between noisy (high spectral spread) and pitched sounds (low spectral spread).
// Range: 0 - half of the FFT size. In Meyda the FFT size is equal to the buffer size (bufferSize) - with a default of 512.
//
// Spectral Skewness
// Description: Indicates whether or not the spectrum is skewed towards a particular range of values, relative to its mean.
// Use: Often used to get an idea about the timbre of a sound.
// Range: Could be negative, positive, or 0. Where 0 is symmetric about the mean, negative indicates that the frequency content is skewed towards the right of the mean, and positive indicates that the frequency content is skewed towards the left of the mean.
//
// Spectral Kurtosis
// Description: An indicator to how pointy the spectrum is. Can be viewed as the opposite of Spectral Flatness.
// Use: Often used to indicate “pitchiness / tonality” of a sound.
// Range: 0.0 - 1.0, where 0.0 is not tonal, and 1.0 is very tonal.
//
// Chroma
// Description: Calculates the how much of each chromatic pitch class (C, C♯, D, D♯, E, F, F♯, G, G♯, A, A♯, B) exists in the signal.
// Use: Often used to analyse the harmonic content of recorded music, such as in chord or key detection.
// Range: 0.0 - 1.0 for each pitch class.
//
//
// Perceptual features
//
//
// Loudness
// Description: Humans’ perception of frequency is non-linear. The Bark Scale was developed in order to have a scale on which equal 
// distances correspond to equal distances of frequency perception. This feature outputs an object with two values:
// The loudness of the input sound on each step (often referred to as bands) of this scale (.specific). There are 24 bands overall.
// Total Loudness (.total), which is a sum of the 24 .specific loudness coefficients.
// Use: Can be used to construct filters that better correspond with the human perception of loudness.
// Range: 0.0 - 1.0 for each .specific loudness. 0.0 - 24.0 for .total loudness.
//
// Perceptual Spread
// Description: Computes the spread of the .specific loudness coefficients, over the bark scale.
// Use: An indicator of how “rich / full” a sound will be perceived.
// Range: 0.0 - 1.0 where 0.0 is not “rich” and 1.0 is very “rich”.
//
// Perceptual Sharpness
// Description: Perceived “sharpness” of a sound, based the Bark loudness coefficients.
// Use: Detecting if an input sound is perceived as “sharp”. Can be used, for example, 
// for differentiating between snare-drum and bass-drum sounds.
// Range: 0.0 - 1.0 where 0.0 is not “sharp” (e.g. bass-drum) and 1.0 very sharp (e.g. snare-drum).
//
// Mel-Frequency Cepstral Coefficients
// Description: As humans don’t interpret pitch in a linear manner, various scales of frequencies were devised to represent 
// the way humans hear the distances between pitches. The Mel scale is one of them, and it is now widely used for voice-related applications. 
// The Meyda implementation was inspired by Huang [3], Davis [4], Grierson [5] and the librosa library.
// Use: Often used to perform voice activity detection (VAD) prior to automatic speech recognition (ASR).
// Range: An array of values representing the intensity for each Mel band. The default size of the array is 13, but is 
// configureable via numberOfMFCCCoefficients.
//
//
// Utility extractors
//
//
// Complex Spectrum
// Description: An array of complex values (ComplexArray) containing both the real and the imaginary parts of the FFT.
// Use: To create the amplitudeSpectrum. It is also used to do further signal processing, as it contains information about 
// both the frequency the phase of the signal.
// Range: An array half the size of the FFT, containing information about frequencies 0 - half of the sampling rate, and their 
// corresponding phase values. In Meyda the default sampling rate (sampleRate) is 44100Hz and the FFT size is equal to the buffer size (bufferSize) - with a default of 512.
//
// Buffer
// Description: This is the raw audio that you get when reading an input from a microphone, a wav file, or any other input audio. 
// It is encoded as a Float32Array.
// Use: All of the time-domain features in Meyda are extracted from this buffer. 
// You can also use that to visualise the audio waveform.
// Range: An array of size bufferSize, where each value can range between -1.0 - 1.0.


//https://en.wikipedia.org/wiki/Window_function
//Windowing functions
//Windowing functions are used during the conversion of a signal from the time domain 
// (i.e. air pressure over time) to the frequency domain (the phase and intensity of each sine wave that comprises the signal); 
// a prerequisite for many of the audio features described above.
// Windowing functions generate an envelope of numbers between 0 and 1, and multiply these numbers pointwise with each sample in the signal buffer, 
// making the samples at the middle of the buffer relatively louder, and making the samples at either end of the buffer relatively quieter. 
// This smooths out the result of the conversion to the frequency domain, which makes the final audio features more consistent and less jittery.
//Meyda supports 4 windowing functions, each with different characteristics.
//Meyda.windowing(signalToBeWindowed, "hanning");
//Meyda.windowing(signalToBeWindowed, "hamming");
//Meyda.windowing(signalToBeWindowed, "blackman");
//Meyda.windowing(signalToBeWindowed, "sine");
//Meyda.windowing(signalToBeWindowed, "rect");

// offline storage
// file access
// device position
// device motion
// ambient light
// usb, nfc, bluetooth
// local notifications/ push
// virtual augmented reality
// inter app communication