import * as React from "react";
import * as $ from 'jquery';

import * as util from '../Utils/utilfunctions';

export function parsePiechart (section : JQuery<XMLDocument>) {
    // Parsing of the fixed parameters
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
    });
    // Auxiliary values
    let rect = util.computeMinMaxCoord(pointCoord);
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    let relCenterCoord = {x:center[0]-rect[0], y:center[1]-rect[1]};
    let edge=1;
    // Return of the React-Node


}