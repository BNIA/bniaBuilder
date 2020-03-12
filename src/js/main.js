import React from "react";
import ReactDOM from "react-dom";
import App from 'js/components/App';
import 'css/critical.css';

/*
#File: Main.js
#Author: Charles Karpati
#Date: Feb 2019
#Section: Bnia
#Email: karpati1@umbc.edu
#Description: Loads the app and inserts it into the div 'start-app'
#Purpose: We have to kickstart the app somehow!
// The script also starts up a service worker and push notifications (I think they may not be working a the moment) 
#input: Nothin
#output: The Application and a Service Worker

*/

ReactDOM.render( <App />, document.querySelector("#start-app") );

// Error Message for IE
if (navigator.appName == 'Microsoft Internet Explorer' ||
  !!(navigator.userAgent.match(/Trident/) ||
  navigator.userAgent.match(/rv:11/))){ 
    console.log('Please do not use Internet Explorer'); 
    alert("Please dont use IE.");
}

// Everything below is for the future Service Worker
// I'm keeping it in main.js to encourage work on it.

function startServiceWorker(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
      .then(async registration => {
        console.log('SW registered: ', registration);
        const subscribeOptions = {
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array( 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U' )
        };
        let permission = await askPermission();
        return permission ? registration.pushManager.subscribe(subscribeOptions) : false
      } )
      .then(async function(pushSubscription) {
        console.log('Push Subscription: ', JSON.stringify(pushSubscription));
        return pushSubscription;
      } );
    } );
  }
}
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}
function askPermission() {
  return new Promise(function(resolve, reject) {
    const permissionResult = Notification.requestPermission(function(result) { resolve(result); });
    if (permissionResult) { permissionResult.then(resolve, reject); }
  })
  .then(function(permissionResult) { if (permissionResult !== 'granted') { return false } return true });
}
