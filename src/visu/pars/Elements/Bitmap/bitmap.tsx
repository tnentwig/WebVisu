import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { IBasicShape } from '../../Interfaces/interfaces';
import { Textfield } from '../Features/textManager';
import { Inputfield } from '../Features/inputManager';
import { parseDynamicShapeParameters, parseDynamicTextParameters, parseClickEvent ,parseTapEvent} from '../Features/eventManager';
import {createVisuObject} from '../Features/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { Image } from '../Features/image'

type Props = {
    section : JQuery<XMLDocument>
}

export const Bitmap :React.FunctionComponent<Props> = ({section})=>
{
    // Parsing of the fixed parameters

    let bitmap : IBasicShape = {
        shape : "bitmap",
        has_inside_color : util.stringToBoolean(section.children("has-inside-color").text()),
        fill_color : util.rgbToHexString(section.children("fill-color").text()),
        fill_color_alarm : util.rgbToHexString(section.children("fill-color-alarm").text()),
        has_frame_color : util.stringToBoolean(section.children("has-frame-color").text()),
        frame_color : util.rgbToHexString(section.children("frame-color").text()),
        frame_color_alarm : util.rgbToHexString(section.children("frame-color-alarm").text()),
        line_width : Number(section.children("line-width").text()),
        elem_id : section.children("elem-id").text(),
        rect : util.stringToArray(section.children("rect").text()),
        center : util.stringToArray(section.children("center").text()),
        hidden_input : util.stringToBoolean(section.children("hidden-input").text()),
        enable_text_input : util.stringToBoolean(section.children("enable-text-input").text()),
        tooltip : (section.children("tooltip").text()).length>0? section.children("tooltip").text() : "",
        // Points only exists on polyforms
        points : []
      }



    // Parsing the textfields and returning a jsx object if it exists
    let dynamicTextParameters = parseDynamicTextParameters(section, bitmap.shape);
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
    }else {
        inputField = null;
    }
    // Parsing of observable events (like toggle color)
    let dynamicShapeParameters = parseDynamicShapeParameters(section);
    // Parsing of user events that causes a reaction like toggle or pop up input
    let onclick =parseClickEvent(section);
    let onmousedown = parseTapEvent(section, "down");
    let onmouseup = parseTapEvent(section, "up");

    let initial = createVisuObject(bitmap, dynamicShapeParameters)

     // Convert object to an observable one
    const state  = useLocalStore(()=>initial);

    // Return of the react node
    return useObserver(()=>
        <div 
        style={{position:"absolute", left:state.transformedCornerCoord.x1-state.edge, top:state.transformedCornerCoord.y1-state.edge, width:state.relCoord.width+2*state.edge, height:state.relCoord.height+2*state.edge}}
        onClick={()=>onclick()} 
        onMouseDown={()=>onmousedown()} 
        onMouseUp={()=>onmouseup()}
        onMouseLeave={()=>onmouseup()} 
        >
           <Image section={section} inlineElement={false}></Image>
        </div>
    )

}