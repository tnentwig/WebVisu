<div align="center">
  
# WebVisu
A tiny **(~100 kB)** Javascript based alternative to the Java applet of **CoDeSys 2.3** applications
  
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

## Introduction

This is a single page application (SPA) for displaying the web visualisation pages build with the **CoDeSys 2.3** or **WAGO-I/O-PRO CAA** IDE without using Java. With this solution it's possible to display the existing visualisations on mobile devices or modern browsers that doesn't support Java applets anymore.

> :point_right: : Every release has been tested with bigger CoDeSys projects but the components are currently not automatically tested. Create an issue or send me a mail to *tristan.nentwig+webvisu@gmail.com* if you encounter a problem.

## How to use
 <ol>
  <li>Download the WebVisuSPA.zip file from the latest release here: <a href="https://github.com/tnentwig/WebVisu/releases">Releases</a>.</li>
  <li>Unzip the three files it contains and transfer them to your PLC (e.t. via FTP with <a href="https://filezilla-project.org/">FileZilla</a>). The destination folder depends on the model of your PLC:
    <p>
  <details>
    <summary><b>For the non Linux PLCs (like 750-88x, 750-89x series)</b></summary>
    <p>Transfer them to the <i><b>/PLC</b></i> folder. The visualisation is available afterwards on:
      <p>
    <i>http://&lt;ip-address-of-your-plc&gt;/PLC/webvisu.html</i></p>
</details>
    <details>
      <summary><b>For the Linux PLCs (like IPC or PFC200)</b></summary>
  <p>Transfer them to <i><b>/home/codesys</b></i>. The visualisation is available afterwards on:
    <p>
      <b>IPC:</b> <i>http://&lt;ip-address-of-your-plc&gt;:8080/webvisu.html</i> 
  <p>
<b>PFC200:</b> <i>http://&lt;ip-address-of-your-plc&gt;/webvisu/webvisu.html</i> 
</details>
  </li>
  <li>Use a modern browser like Chrome, Firefox or Edge.</li>
</ol> 

## How it works

This SPA is based on the [React](https://github.com/facebook/react) and [MobX](https://github.com/mobxjs/mobx) framework. CoDeSys creates a XML description file for every user generated visualisation. Every file descripes the look and behavior of the objects shown in the specific visualisation. Besides that the file contains the used variables (e.g. "_.xToggleColor_") and their addresses on the web interface.  
The SPA parse the current visualisation XML file and insert a React component dynamically to the React-Dom as absolut positioned element. The variables depending on the element will be included to a singleton object named "ComSocket". This object saves the variables in a observable map and queries the value of the variables cyclic. If an observable value changes all dependend elements rerender. The observable map is part of the MobX framework.

## Demo (1.0.9)

<p align="center"> 
<img src="./img/demo.gif">
</p>

## Currently supported features

The WebVisu-SPA is still in progress but already contains numerous functionalities and elements.

| Element/ Function    |     Integrated     |
| -------------------- | :----------------: |
| Change userlevel     | :heavy_check_mark: |
| Rectangle            | :heavy_check_mark: |
| Roundrect            | :heavy_check_mark: |
| Ellipse              | :heavy_check_mark: |
| Polygon              | :heavy_check_mark: |
| Bezier               | :heavy_check_mark: |
| Polyline             | :heavy_check_mark: |
| Sector               | :heavy_check_mark: |
| Bitmap<sup>1</sup>   | :heavy_check_mark: |
| Subvisualisation     | :heavy_check_mark: |
| Button               | :heavy_check_mark: |
| WMF-File             | :heavy_check_mark: |
| Table                |      :wrench:      |
| Alarm table          | :heavy_minus_sign: |
| Slider<sup>2</sup>   | :heavy_check_mark: |
| Button               | :heavy_check_mark: |
| Gauge                | :heavy_check_mark: |
| Bar display          | :heavy_check_mark: |
| Histogram            | :heavy_minus_sign: |
| CurrentVisu-Variable | :heavy_check_mark: |
| Language switching   | :heavy_minus_sign: |
| ActiveX-Element      |    :collision:     |

## Meaning of the marks

:heavy_check_mark: : Fully implemented  
:heavy_minus_sign: : Currently not supported  
:wrench: : Currently in progress  
:collision: : Is no longer supported in modern browsers

## Comments

<sup>1</sup> : The "Background transparent" functionality (select a specific color to become transparent) doesn't work.

<sup>2</sup> : Works fine with Firefox. Sliderchange has to be throttled on Chrome in the future.
