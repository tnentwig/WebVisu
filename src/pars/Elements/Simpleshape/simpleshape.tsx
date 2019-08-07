import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { RoundRect } from './Subunits/roundrect'
import { Line } from './Subunits/line';
import { Circle } from './Subunits/circle'
import { Rectangle } from './Subunits/rectangle';
import { parseTextfield } from './Features/text';

export function parseSimpleShape(section : JQuery<XMLDocument>){
    // Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
    let shape = section.children("simple-shape").text();
    // Parse the common informations
    if (['round-rect', 'circle', 'line', 'rectangle'].includes(shape)) {
        // Parsing of the fixed parameters
        let has_inside_color = util.stringToBoolean(section.children("has-inside-color").text());
        let fill_color = util.rgbToHexString(section.children("fill-color").text());
        let fill_color_alarm = util.rgbToHexString(section.children("fill-color-alarm").text());
        let has_frame_color = util.stringToBoolean(section.children("has-frame-color").text());
        let frame_color = util.rgbToHexString(section.children("frame-color").text());
        let frame_color_alarm = util.rgbToHexString(section.children("frame-color-alarm").text());
        let line_width = Number(section.children("line-width").text());
        let elem_id = Number(section.children("elem-id").text());
        let rect = util.stringToArray(section.children("rect").text());
        let center = util.stringToArray(section.children("center").text());
        let hidden_input = util.stringToBoolean(section.children("hidden-input").text());
        let enable_text_input = util.stringToBoolean(section.children("enable-text-input").text());
        
        let textfield = parseTextfield(section);

        // Return of the React-Node
        switch (shape){
          case 'round-rect':
            return(
              RoundRect(has_inside_color, fill_color, fill_color_alarm, has_frame_color, frame_color, frame_color_alarm, line_width, hidden_input, enable_text_input, rect, center)
            )
            break;
          case 'circle':
            return(
              Circle(has_inside_color, fill_color, fill_color_alarm, has_frame_color, frame_color, frame_color_alarm, line_width, hidden_input, enable_text_input, rect, center)
            )
          break;
          case 'line':
            return(
              Line(has_inside_color, fill_color, fill_color_alarm, has_frame_color, frame_color, frame_color_alarm, line_width, hidden_input, enable_text_input, rect, center)
            )
          case 'rectangle':
            return(
              Rectangle(textfield, has_inside_color, fill_color, fill_color_alarm, has_frame_color, frame_color, frame_color_alarm, line_width, hidden_input, enable_text_input, rect, center)
            )
        }
    }

    else {()=>console.error("Simple-Shape: <" + shape + "> is not supported!");}
}

