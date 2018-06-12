<div align="center">
  <img src="https://picsum.photos/200" alt="Logo">
</div>

# Bnia Builder
> Construct websites to explore and visualize your data.

## Table of Contents
**[About](#About)**<br>
**[Requirements](#Requirements)**<br>
**[Installation](#installation)**<br>
**[Setup](#setup)**<br>
**[Usage](#usage)**<br>
**[Acknowledgements](#acknowledgements)**<br>

## About
> ### THIS PROJECT IS UNDER DEVELOPMENT
> Please contact BNIA-JFI to see how you can help. <br>
> 
> The focus of this project is to enable folk to create data driven websites for visualization and exploration
>
> Constructed by Charles Karpati of the Baltimore Neighborhood Indicators Association <br>
> More information may be found on [Google Drive](https://tinyurl.com/yddqae9u "Google Drive Project Folder") <br>

## Requirements
> _This application runs on an **APACHE FILE SERVER**_ <br>
> _This application was built using **NODE**_ <br>
+ [Node.js](https://nodejs.org/en/) - Used in Development and for Installation
+ [phpMyAdmin](https://www.phpmyadmin.net/) - Used in Development And Production
+ [MySql](https://www.mysql.com/) - Used in Development And Production

## Installation
1. `git clone https://github.com/BNIA/bniaBuilder.git` <br>
2. `cd bniaBuilder` - Enter the directory <br>
3. `npm install` - Install the dependencies <br>

## Setup
0. `npm run start` - (_Developers only_) Constructs a development enviornment for reworking the source code <br>
1. `npm run build` - Generates optimized code for deployment inside a newly created `dist/` directory. <br>
2. Drop the `dist/` directories content into a new path in your Website File-Server
4. Visit YourDomain.com/[path/to/folder/]admin to administer your site

## Usage
##### Admin
+ Styles
+ Themes
+ Component Configurations
+ Component Placements
+ User Permissions
+ Manage Accounts & Views
+ Specify Data Layers / Data Functions / Engagement
##### Users
+ Filter Data
+ Visualize Data
+ Explore Data
+ Add Data
+ Disqus Data

## Acknowledgements
### Contributors 
+ __Neha Chandupatla__ - Constructed database table structures for our housing API
### A Special Thanks To
+ __Blue Raster__ - I started this project forking their Leaflet/React/Webpack example. At this point this project is radically different, but I had to start somewhere. <br>
+ __Sabbir Ahmed__ - I rewrote Blue Rasters README using what I learnt from you. Your Notes and Batch scripts were also very informative reference material. <br>
+ __Evan Mahone__ - Your documentation taught me a lot and and the initial Green Patterns map proved invaluable when constructing this architecture. <br>
+ __David Carpenter__ - For taking care of BNIA when I could not. I've improved my PHP because of you. <br>

## License
> MIT License
>
> Copyright (c) 2018 Charles Karpati
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.
******
