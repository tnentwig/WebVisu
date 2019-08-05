import * as React from "react";
import * as $ from 'jquery';
import * as util from '../Utils/utilfunctions';

export function parsePolygon(section : JQuery<XMLDocument>){
    // Check if its on of the allowed shapes like polygon, bezier or polyline
    let shape = section.children('poly-shape').text();
    // Parse the common informations
    if (['polygon', 'bezier', 'polyline'].includes(shape)) {
        // Parsing of the fixed parameters
        let has_inside_color = util.stringToBoolean(section.children("has-inside-color").text());
        let fill_color = util.rgbToHexString(section.children("fill-color").text());
        let fill_color_alarm = util.rgbToHexString(section.children("fill-color-alarm").text());
        let has_frame_color = util.stringToBoolean(section.children("has-frame-color").text());
        let frame_color = util.rgbToHexString(section.children("frame-color").text());
        let frame_color_alarm = util.rgbToHexString(section.children("frame-color-alarm").text());
        let line_width = Number(section.children("line-width").text());
        let elem_id = Number(section.children("elem-id").text());
        let center = util.stringToArray(section.children("center").text());
        let hidden_input = util.stringToBoolean(section.children("hidden-input").text());
        let enable_text_input = util.stringToBoolean(section.children("enable-text-input").text());
        // Parsing the point coordinates
        let pointCoord: number[][] = [];
        section.children('point').each(function(){
            pointCoord.push(util.stringToArray($(this).text()));
        })
        // Auxiliary values
        let rect = util.computeRectCoord(pointCoord);
        let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
        let relCenterCoord = {x:center[0]-rect[0], y:center[1]-rect[1]};
        let edge=1;
        // Return of the React-Node
        return(
            <div style={{position:"absolute", left:rect[0], top:rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
                <svg width={relCornerCoord.x2+2*edge} height={relCornerCoord.y2+2*edge}>
                    {(function() {
                        switch (shape){
                        case 'polygon':
                            return(
                                <polygon 
                                points={util.coordArrayToString(pointCoord, rect[0]-edge, rect[1]-edge)}
                                fill={fill_color}
                                strokeWidth={edge}
                                stroke={frame_color}
                                />
                            )
                        case 'bezier':
                            return(
                                <path 
                                d={util.coordArrayToBezierString(pointCoord, rect[0]-edge, rect[1]-edge)}
                                fill={fill_color}
                                strokeWidth={edge}
                                stroke={frame_color}
                                />
                            )
                        case 'polyline':
                            return(
                                <polyline
                                points={util.coordArrayToString(pointCoord, rect[0]-edge, rect[1]-edge)} // 
                                fill={fill_color}
                                strokeWidth={edge}
                                stroke={frame_color} />
                            )
                        }
                    
                    })()}  
                </svg>
          </div>
        )
    }
    else {()=>console.error("Poly-Shape: <" + shape + "> is not supported!");}
}