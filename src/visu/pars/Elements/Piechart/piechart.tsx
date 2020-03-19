import * as React from 'react';
import * as $ from 'jquery';
import * as util from '../../Utils/utilfunctions';
import { IBasicShape, IPiechart, IVisuObject } from '../../Interfaces/interfaces';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/inputManager';
import { parseDynamicShapeParameters, parseDynamicTextParameters, parseClickEvent ,parseTapEvent} from '../Features/eventManager';
import {createVisuObject} from '../Features/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';

type Props = {
    section : JQuery<XMLDocument>
}

export const Piechart :React.FunctionComponent<Props> = ({section})=>
{
    // Parsing of the fixed parameters

    let piechart: IBasicShape = {
        shape : "piechart",
        has_inside_color : util.stringToBoolean(section.children("has-inside-color").text()),
        fill_color : util.rgbToHexString(section.children("fill-color").text()),
        fill_color_alarm : util.rgbToHexString(section.children("fill-color-alarm").text()),
        has_frame_color : util.stringToBoolean(section.children("has-frame-color").text()),
        frame_color : util.rgbToHexString(section.children("frame-color").text()),
        frame_color_alarm : util.rgbToHexString(section.children("frame-color-alarm").text()),
        line_width : Number(section.children("line-width").text()),
        elem_id : section.children("elem-id").text(),
        rect : [],
        center : util.stringToArray(section.children("center").text()),
        hidden_input : util.stringToBoolean(section.children("hidden-input").text()),
        enable_text_input : util.stringToBoolean(section.children("enable-text-input").text()),
        tooltip : (section.children("tooltip").text()).length>0? section.children("tooltip").text() : "",
        // Points only exists on polyforms
        points : [],
      }

    // Parsing the point coordinates
    section.children('point').each(function(){
        let points = util.stringToArray($(this).text());
        piechart.points.push(points);
    });
    // The piechart points consists of only 4 items 
    //[0]-> center
    //[1]-> point bottom right
    //[2]-> point startAngle
    //[3]-> point endAngle
    // so we have to calculate the rect coordinates separatly
    piechart.rect = util.computePiechartRectCoord(piechart.points);

    // Parsing the textfields and returning a jsx object if it exists
    let dynamicTextParameters = parseDynamicTextParameters(section, piechart.shape);
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

    let initial  = createVisuObject(piechart, dynamicShapeParameters)

     // Convert object to an observable one
    const state  = useLocalStore(()=>initial);
   

    // Return of the react node
    return useObserver(()=>
        <div style={{position:"absolute", left:state.transformedCornerCoord.x1-state.edge, top:state.transformedCornerCoord.y1-state.edge, width:state.relCoord.width+2*state.edge, height:state.relCoord.height+2*state.edge}}>
        {inputField}
        <svg style={{float: "left"}} width={state.relCoord.width+2*state.edge} height={state.relCoord.height+2*state.edge}>
            <svg
                onClick={()=>onclick()} 
                onMouseDown={()=>onmousedown()} 
                onMouseUp={()=>onmouseup()}
                onMouseLeave={()=>onmouseup()}  // We have to reset if somebody leaves the object with pressed key
                strokeDasharray={state.strokeDashArray}
                >   
                <path d={state.piechartPath} stroke={state.stroke} strokeWidth={state.strokeWidth} fill={state.fill}></path>
                <title>{state.tooltip}</title>
            </svg>
            <svg            
                width={state.relCoord.width+2*state.edge} 
                height={state.relCoord.height+2*state.edge} >
                {textField}
            </svg>
        </svg>
        </div>
    )

}