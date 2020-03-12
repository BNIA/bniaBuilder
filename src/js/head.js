import React from "react";
import ReactDOM from "react-dom";
import App from '../js/components/App';
import Helmet, { HelmetProvider } from 'react-helmet-async';
import * as myConfig from '../json_config.json';

/*
#File: Body.js
#Author: Charles Karpati
#Date: Feb 2019
#Section: Bnia
#Email: karpati1@umbc.edu
#Description: Loads the Header 
#Purpose: For Dynamic rendering of Header tags
#input: Configuration specifications
#output: Updated State
# Resources: //https://stackoverflow.com/questions/46221528/inline-the-web-app-manifest
*/

let hr = myConfig.default.configuration;

let local = window.location.href;
let imageLocation = local+"images/"+hr.shortName.trim().toLowerCase()+"/"
imageLocation = imageLocation.replace(/\s/g, "_").replace("index.html", "");
// Have to remove the Hashtag from color or else it gets commented out
//  "background_color": hr.themecolor,
//  "theme_color": hr.themecolor,
let myDynamicManifest = {
  "name": hr.longName,
  "short_name": hr.shortName,
  "start_url": local,
  "display": "standalone",
  "background_color": 'black',
  "theme_color": 'red',
  "description": hr.description,
  "dir":"rtl",
  "lang":"ar",
  "icons": [{
    "src": imageLocation+hr.ico16x16,
    "sizes": "16x16",
    "type": "image/ico"
  }, {
    "src": imageLocation+hr.ico24x24,
    "sizes": "24x24",
    "type": "image/ico"
  }, {
    "src": imageLocation+hr.ico32x32,
    "sizes": "32x32",
    "type": "image/ico"
  }, {
    "src": imageLocation+hr.ico64x64,
    "sizes": "64x64",
    "type": "image/ico"
  }, {
    "src": imageLocation+hr.logo,
    "sizes": "144x144",
    "type": "image/PNG"
  }, {  
    "src": imageLocation+hr.logo,  
    "sizes": "192x192",  
    "type": "image/png"  
  }, {  
    "src": imageLocation+hr.logo,  
    "sizes": "256x256",  
    "type": "image/png"  
  }, {  
    "src": imageLocation+hr.logo,  
    "sizes": "384x384",  
    "type": "image/png"  
  }, {  
    "src": imageLocation+hr.logo,  
    "sizes": "512x512",  
    "type": "image/png"  
  }]
}

ReactDOM.render(
  <HelmetProvider>
      <Helmet>    
        <link rel="manifest" href={'data:application/manifest+json,'+JSON.stringify(myDynamicManifest)} />
        <meta http-equiv="x-ua-compatible" content="ie=edge"/>
        <meta http-equiv="Content-Security-Policy"
          content="
            img-src
              'self'
              https://t1.gstatic.com/
              https://cdn.example.net https://ionicframework.com/img/finger.png
              https://unpkg.com/leaflet@1.3.0/dist/images/marker-shadow.png
              https://unpkg.com/leaflet@1.3.0/dist/images/marker-icon.png
              https://bniajfi.org/wp-content/uploads/2014/04/bnia_logo_new.png
              http://a.basemaps.cartocdn.com/
              http://b.basemaps.cartocdn.com/
              http://c.basemaps.cartocdn.com/
              https://maps.googleapis.com/
              https://disqus.com/
              https://referrer.disqus.com
              http://links.services.disqus.com
              https://c.disquscdn.com/
              http://cdn.viglink.com
              http://services.arcgisonline.com/
              http://server.arcgisonline.com/ArcGIS/
              data:
        "/>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1"/>
        <meta http-equiv="x-dns-prefetch-control" content="off"/>
        <link rel="shortcut icon" type="image/x-icon" href={ imageLocation+hr.ico16x16 } />
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/leaflet@1.3.4/dist/leaflet.css"/>
        <link rel="stylesheet" type="text/css" href="https://use.fontawesome.com/releases/v5.4.1/css/all.css"/>
        <title>{hr.longName}</title>
        <meta name="author"             content={hr.author}/>
        <meta name="description"        content={hr.description}/>
        <meta name="keywords"           content="HTML,CSS,XML,JavaScript"/>

        <meta name="HandheldFriendly"   content="True"/>
        <meta name="MobileOptimized"    content="420"/>
        <meta name="subject"            content={hr.type}/>
        <meta name="application-name"   content={hr.applicationname}/>

        <base target="_blank"           href="./"/>
        <link rel="canonical"           href={hr.canonical}/>
        <link rel="author"              href={hr.author}/>
        <link rel="license"             href="https://opensource.org/licenses/MIT"/>
        <link rel="me"                  href={hr.owneremail} type="text/html"/>
        <link rel="me"                 href={hr.ownername}/>
        <link rel="me"                 href={hr.ownerphone}/>

        <meta name="geo.region"         content="US-MD" />
        <meta name="geo.placename"      content="Baltimore" />
        <meta name="geo.region"         content={hr.title} />
        <meta name="geo.placename"      content={hr.title} />
        <meta name="geo.position"       content={hr.geoposition} />
        <meta name="ICBM"               content={hr.geoposition} />

        <meta name="theme-color"        content={hr.themecolor}/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="google"             content="notranslate"/>

        <meta name="robots"             content="index,follow"/>
        <meta name="googlebot"          content="index,follow"/>
        <meta name="google"             content="nositelinkssearchbox"/>
        <meta name="google"             content="notranslate"/>
        <meta name="rating"             content="General"/>
        <meta name="referrer"           content="no-referrer"/>
        <meta name="format-detection"   content="telephone=no"/>
        <meta name="renderer"           content="webkit|ie-comp|ie-stand"/>
        <noscript>Your browser does not support JavaScript!</noscript>

        <link rel="icon" type="image/ico" sizes="16x16"     href={imageLocation.ico16x16}/>
        <link rel="icon" type="image/ico" sizes="24x24"     href={imageLocation.ico24x24}/>
        <link rel="icon" type="image/ico" sizes="32x32"     href={imageLocation.ico32x32}/>
        <link rel="icon" type="image/ico" sizes="64x64"     href={imageLocation.ico64x64}/>
        <meta property="og:image"       content={hr.image}/>
        <meta name="twitter:image"      content={hr.image}/>
        <meta itemprop="image"          content={hr.image}/>

        <meta property="article:author" content={hr.author}/>
        <meta property="og:title"       content={hr.title}/>
        <meta property="og:description" content={hr.description}/>
        <meta property="og:type"        content={hr.type} />
        <meta property="og:site_name"   content={hr.applicationname}/>
        <meta property="og:locale"      content="en_US"/>
        <meta property="op:markup_version" content="v1.0"/>
        <meta property="fb:article_style"content="default"/>
        <meta name="twitter:site"       content={hr.twittersite}/>
        <meta name="twitter:creator"    content={hr.twitterauthor}/>
        <meta name="twitter:title"      content={hr.title}/>
        <meta name="twitter:description"content={hr.description}/>
        <meta itemprop="name"           content={hr.title}/>
        <meta itemprop="description"    content={hr.description}/>
        <meta name="pinterest"          content="nopin" description="Sorry, you can't save from this website!"/>
      </Helmet>
  </HelmetProvider>
  , document.querySelector("#create-head")
);