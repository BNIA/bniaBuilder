import React, { Component } from "react";
import ReactDOM from "react-dom";

import App from 'js/components/App';

// Website Styling
import style from 'css/critical.css';

async function init() {
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
async function askPermission() {
  return new Promise(function(resolve, reject) {
    const permissionResult = Notification.requestPermission(function(result) { resolve(result); });
    if (permissionResult) { permissionResult.then(resolve, reject); }
  })
  .then(function(permissionResult) { if (permissionResult !== 'granted') { return false } return true });
}

// Map Styling. Loads smoothly
import {loadCSS} from 'js/utils/utils';
loadCSS('https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
loadCSS('https://unpkg.com/leaflet@1.3.0/dist/leaflet.css');

ReactDOM.render(<App />, document.getElementById("react-mount"));
