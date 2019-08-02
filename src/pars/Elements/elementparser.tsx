import * as React from "react";
import * as $ from 'jquery';
import { StringToBoolean, RgbToHex, StringToArray } from './parserutils';

export function ParseSimpleShape(section : JQuery<XMLDocument>){
    // Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
    let shape = section.children("simple-shape").text();
    // Parse the common informations
    if (['round-rect', 'circle', 'line', 'rectangle'].includes(shape)) {
        // Parsing of the fixed parameters
        let has_inside_color = StringToBoolean(section.children("has-inside-color").text());
        let fill_color = RgbToHex(section.children("fill-color").text());
        let fill_color_alarm = RgbToHex(section.children("fill-color-alarm").text());
        let has_frame_color = StringToBoolean(section.children("has-frame-color").text());
        let frame_color = RgbToHex(section.children("frame-color").text());
        let frame_color_alarm = RgbToHex(section.children("frame-color-alarm").text());
        let line_width = Number(section.children("line-width").text());
        let elem_id = Number(section.children("elem-id").text());
        let rect = StringToArray(section.children("rect").text());
        let center = StringToArray(section.children("center").text());
        let hidden_input = StringToBoolean(section.children("hidden-input").text());
        let enable_text_input = StringToBoolean(section.children("enable-text-input").text());
        
        // Variable content like "toggle variable"
        section.children("simple-shape").each(function() {
            let simpleshape = $(this);
            switch (simpleshape.text()) {
                case "has-inside-color": 
                ;             
            }

        })
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
   
    else {()=>console.error("Simple-Shape: <" + shape + "> is not supported!");}
}

