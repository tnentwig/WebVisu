import * as React from "react";
import * as $ from 'jquery';
import { stringToBoolean, rgbToHexString, stringToArray } from '../Utils/utilfunctions';

export function parseSimpleShape(section : JQuery<XMLDocument>){
    // Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
    let shape = section.children("simple-shape").text();
    // Parse the common informations
    if (['round-rect', 'circle', 'line', 'rectangle'].includes(shape)) {
        // Parsing of the fixed parameters
        let has_inside_color = stringToBoolean(section.children("has-inside-color").text());
        let fill_color = rgbToHexString(section.children("fill-color").text());
        let fill_color_alarm = rgbToHexString(section.children("fill-color-alarm").text());
        let has_frame_color = stringToBoolean(section.children("has-frame-color").text());
        let frame_color = rgbToHexString(section.children("frame-color").text());
        let frame_color_alarm = rgbToHexString(section.children("frame-color-alarm").text());
        let line_width = Number(section.children("line-width").text());
        let elem_id = Number(section.children("elem-id").text());
        let rect = stringToArray(section.children("rect").text());
        let center = stringToArray(section.children("center").text());
        let hidden_input = stringToBoolean(section.children("hidden-input").text());
        let enable_text_input = stringToBoolean(section.children("enable-text-input").text());
        
        // Variable content like "toggle variable"
        section.children("simple-shape").each(function() {
            let simpleshape = $(this);
            switch (simpleshape.text()) {
                case "has-inside-color": 
                ;
                break;       
            }
        })
        // Auxiliary values
        let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
        let relCenterCoord = {x:center[0]-rect[0], y:center[1]-rect[1]};
        let edge = 1;
        // Return of the React-Node
        return(
          <div style={{position:"absolute", left:rect[0], top:rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
            <svg width={relCornerCoord.x2+2*edge} height={relCornerCoord.y2+2*edge}>
              {(function() {
                switch (shape){
                  case 'round-rect':
                    return(
                      <rect 
                      width={relCornerCoord.x2}
                      height={relCornerCoord.y2}
                      x={edge}
                      y={edge}
                      rx={10}
                      ry={10}
                      fill={fill_color}
                      strokeWidth={edge}
                      stroke={frame_color}
                      />
                    )
                  case 'circle':
                    return(
                      <circle
                      cx={relCenterCoord.x+edge}
                      cy={relCenterCoord.y+edge}
                      fill={fill_color}
                      strokeWidth={edge}
                      stroke={frame_color}
                      r={relCenterCoord.x}
                      />
                    )
                  case 'line':
                      return(
                        <line
                        x1={relCornerCoord.x1}
                        y1={relCornerCoord.y2}
                        x2={relCornerCoord.x2}
                        y2={relCornerCoord.y1}
                        stroke={frame_color}
                        />
                      )
                  case 'rectangle':
                    return(
                      <rect 
                        width={relCornerCoord.x2}
                        height={relCornerCoord.y2}
                        x={edge}
                        y={edge}
                        fill={fill_color}
                        strokeWidth={edge}
                        stroke={frame_color}
                      />
                    )
                }
              
              })()}  
            </svg>
          </div>
          )
        
    }
   
    else {()=>console.error("Simple-Shape: <" + shape + "> is not supported!");}
}

