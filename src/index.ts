import HTML5Visu from './controlcenter';
import * as React from 'react';

if (process.env.NODE_ENV !== 'production') {
  const {whyDidYouUpdate} = require('why-did-you-update')
  whyDidYouUpdate(React)
}

const objHTML5Visu = new HTML5Visu();
objHTML5Visu.showMainVisu();


