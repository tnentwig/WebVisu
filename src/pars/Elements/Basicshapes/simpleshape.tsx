import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { Roundrect } from './SimpleSubunits/roundrect'
import { Line } from './SimpleSubunits/line';
import { Circle } from './SimpleSubunits/circle'
import { Rectangle } from './SimpleSubunits/rectangle';
import { Textfield } from './Features/textManager';
import { Inputfield } from './Features/inputManager'
import { IBasicShape } from '../../Interfaces/interfaces';
import { parseDynamicShapeParameters, parseDynamicTextParameters, parseClickEvent ,parseTapEvent} from './Features/eventParser';

export function parseSimpleShape(section : JQuery<XMLDocument>){
    // Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
    let shape = section.children("simple-shape").text();
    // Parse the common informations
    if (['round-rect', 'circle', 'line', 'rectangle'].includes(shape)) {

        // Parsing of the fixed parameters
        let simpleShape : IBasicShape = {
          shape : shape,
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
          enable_text_input : util.stringToBoolean(section.children("enable-text-input").text()),
          tooltip : (section.children("tooltip").text()).length>0? section.children("tooltip").text() : "",
          // Points only exists on polyforms
          points : []
        }
        // Parsing the textfields and returning a jsx object if it exists
        let dynamicTextParameters = parseDynamicTextParameters(section, shape);
        let textField : JSX.Element;
        if (section.find("text-id").text().length){
          textField = <Textfield section={section} dynamicParameters={dynamicTextParameters}></Textfield>;
        }
        else {
          textField = null;
        }

        // Parsing the inputfield
        let inputField : JSX.Element;
        if (section.find("enable-text-input").text() === "true"){
            inputField = <Inputfield section={section}></Inputfield>
        }

        // Parsing of observable events (like toggle color)
        let dynamicShapeParameters = parseDynamicShapeParameters(section, shape);
        // Parsing of user events that causes a reaction like toggle or pop up input
        let onclick =parseClickEvent(section);
        let onmousedown = parseTapEvent(section, "down");
        let onmouseup = parseTapEvent(section, "up");
        
        // Return of the React-Node
        switch (shape){
          case 'round-rect':
            return(
              <Roundrect
              simpleShape={simpleShape} 
              textField={textField}
              input ={inputField}
              dynamicParameters={dynamicShapeParameters} 
              onclick={onclick} 
              onmousedown={onmousedown} 
              onmouseup={onmouseup}/>
            )
          case 'circle':
            return(
              <Circle 
                simpleShape={simpleShape} 
                textField={textField}
                input ={inputField}
                dynamicParameters={dynamicShapeParameters} 
                onclick={onclick} 
                onmousedown={onmousedown} 
                onmouseup={onmouseup}></Circle>
            )
          case 'line':
            return(
              <Line 
                simpleShape={simpleShape} 
                textField={textField}
                input ={inputField}
                dynamicParameters={dynamicShapeParameters} 
                onclick={onclick} 
                onmousedown={onmousedown} 
                onmouseup={onmouseup}></Line>
            )
            
          case 'rectangle':
            return(
              <Rectangle 
              simpleShape={simpleShape} 
              textField={textField}
              input ={inputField}
              dynamicParameters={dynamicShapeParameters} 
              onclick={onclick} 
              onmousedown={onmousedown} 
              onmouseup={onmouseup}/>
            )
        }
    }

    else {()=>console.error("Simple-Shape: <" + shape + "> is not supported!");}
}

