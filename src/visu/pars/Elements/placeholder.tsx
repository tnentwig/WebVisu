import * as React from 'react';
import { stringToBoolean, rgbToHexString, stringToArray } from '../Utils/utilfunctions';

export function Placeholder(section : JQuery<XMLDocument>){
  // Parsing of rect parameters
  try {
    let rect = stringToArray(section.children("rect").text());
        
    // Auxiliary values
    let relCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    // Return of the React-Node
    return(
        <div style={{position:"absolute", left:rect[0], top:rect[1]}}>
          <svg width={relCoord.x2} height={relCoord.y2}>
            <rect 
              width={relCoord.x2}
              height={relCoord.y2}
              fill={"white"}
              strokeWidth={2}
              stroke={"black"}/>
            <line 
              x1={relCoord.x1}
              y1={relCoord.y1}
              x2={relCoord.x2}
              y2={relCoord.y2}
              stroke={"black"}/>
            <line 
              x1={relCoord.x1}
              y1={relCoord.y2}
              x2={relCoord.x2}
              y2={relCoord.y1}
              stroke={"black"}/>
        </svg>
      </div>
      )
    }

    catch {
      ()=>console.error("Object is not supported! No dimensions detected!");
    }

}

