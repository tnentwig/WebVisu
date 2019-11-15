import * as React from 'react';

import { stringToBoolean, rgbToHexString, stringToArray } from '../Utils/utilfunctions';

export function parseBitmap (section : JQuery<XMLDocument>) {
    // Parsing of the fixed parameters
    let rect = stringToArray(section.children("rect").text());
    let center = stringToArray(section.children("center").text());

    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    let relCenterCoord = {x:center[0]-rect[0], y:center[1]-rect[1]};
    let edge = 1;

    // Return of the react node
    return (
        <div style={{position:"absolute", left:rect[0], top:rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
            <img src="http://file.fyicenter.com/a/sample.bmp"
            style={{width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}/>
        </div>
    )
}