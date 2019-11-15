import HTML5Visu from './controlcenter';
import * as React from 'react';

if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React)
}

let path = location.protocol + '//' + window.location.host;
try{
    const objHTML5Visu = new HTML5Visu(path)
    objHTML5Visu.createVisu("/plc_visu.xml");
} catch {
    console.log("The URI is malformed!");
}

