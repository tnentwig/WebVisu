import * as React from 'react';

import { stringToBoolean, rgbToHexString, stringToArray } from '../Utils/utilfunctions';

export function parseArrayTable (section : JQuery<XMLDocument>) {
    // Parsing of the fixed parameters
    let rect = stringToArray(section.children("rect").text());
    let center = stringToArray(section.children("center").text());
    let has_inside_color = stringToBoolean(section.children("has-inside-color").text());
    let fill_color = rgbToHexString(section.children("fill-color").text());
    let fill_color_alarm = rgbToHexString(section.children("fill-color-alarm").text());
    let has_frame_color = stringToBoolean(section.children("has-frame-color").text());
    let frame_color = rgbToHexString(section.children("frame-color").text());
    let frame_color_alarm = rgbToHexString(section.children("frame-color-alarm").text());
    let hidden_input = stringToBoolean(section.children("hidden-input").text());
    let enable_text_input = stringToBoolean(section.children("enable-text-input").text());

    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    let relCenterCoord = {x:center[0]-rect[0], y:center[1]-rect[1]};
    let edge = 1;

    // Return of the react node
    return (
        <div style={{position:"absolute", left:rect[0], top:rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
            <table style={{width:relCornerCoord.x2, height:relCornerCoord.y2, border:1}}>
                <tbody>
                
                </tbody>
            </table>
        </div>
    )
}