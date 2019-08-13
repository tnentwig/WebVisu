import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { RoundRect } from './Subunits/roundrect'
import { Line } from './Subunits/line';
import { Circle } from './Subunits/circle'
import { Rectangle } from './Subunits/rectangle';
import { parseTextfield } from '../../Features/text';
import { ISimpleShape } from '../interfaces';

export function parseSimpleShape(section : JQuery<XMLDocument>){
    // Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
    let shape = section.children("simple-shape").text();
    // Parse the common informations
    if (['round-rect', 'circle', 'line', 'rectangle'].includes(shape)) {

        // Parsing of the fixed parameters
        let simpleShape : ISimpleShape = {
          has_inside_color : util.stringToBoolean(section.children("has-inside-color").text()),
          fill_color : util.rgbToHexString(section.children("fill-color").text()),
          fill_color_alarm : util.rgbToHexString(section.children("fill-color-alarm").text()),
          has_frame_color : util.stringToBoolean(section.children("has-frame-color").text()),
          frame_color : util.rgbToHexString(section.children("frame-color").text()),
          frame_color_alarm : util.rgbToHexString(section.children("frame-color-alarm").text()),
          line_width : Number(section.children("line-width").text()),
          elem_id : Number(section.children("elem-id").text()),
          rect : util.stringToArray(section.children("rect").text()),
          center : util.stringToArray(section.children("center").text()),
          hidden_input : util.stringToBoolean(section.children("hidden-input").text()),
          enable_text_input : util.stringToBoolean(section.children("enable-text-input").text())
        }
        // Parsing of textfields
        let textfield = parseTextfield(section);

        // Parsing of click events
        
        // Return of the React-Node
        switch (shape){
          case 'round-rect':
            return(
              RoundRect(simpleShape)
            )
            break;
          case 'circle':
            return(
              Circle(textfield, simpleShape)
            )
          break;
          case 'line':
            return(
              Line(simpleShape)
            )
          case 'rectangle':
            return(
              Rectangle(textfield, simpleShape)
            )
        }
    }

    else {()=>console.error("Simple-Shape: <" + shape + "> is not supported!");}
}

