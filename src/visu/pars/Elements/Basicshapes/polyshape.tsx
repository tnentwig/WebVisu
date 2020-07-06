import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { IPolyShape } from '../../../Interfaces/javainterfaces';
import { Bezier } from './PolySubunits/bezier'
import { Polygon } from './PolySubunits/polygon'
import { Polyline } from './PolySubunits/polyline'
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager'
import { parseDynamicShapeParameters, parseDynamicTextParameters, parseClickEvent ,parseTapEvent } from '../Features/Events/eventManager';


type Props = {
    section : Element
}

export const PolyShape : React.FunctionComponent<Props> = ({section})=> 
{
    // Check if its on of the allowed shapes like polygon, bezier or polyline
    let shape = section.getElementsByTagName("poly-shape")[0].innerHTML;
    // Parse the common informations
    if (['polygon', 'bezier', 'polyline'].includes(shape)) {
        // Parsing of the fixed parameters
        let polyShapeBasis : IPolyShape = {
            shape : shape,
            has_inside_color : util.stringToBoolean(section.getElementsByTagName("has-inside-color")[0].innerHTML),
            fill_color : util.rgbToHexString(section.getElementsByTagName("fill-color")[0].innerHTML),
            fill_color_alarm : util.rgbToHexString(section.getElementsByTagName("fill-color-alarm")[0].innerHTML),
            has_frame_color : util.stringToBoolean(section.getElementsByTagName("has-frame-color")[0].innerHTML),
            frame_color : util.rgbToHexString(section.getElementsByTagName("frame-color")[0].innerHTML),
            frame_color_alarm : util.rgbToHexString(section.getElementsByTagName("frame-color-alarm")[0].innerHTML),
            line_width : Number(section.getElementsByTagName("line-width")[0].innerHTML),
            elem_id : section.getElementsByTagName("elem-id")[0].innerHTML,
            rect : [],
            center : util.stringToArray(section.getElementsByTagName("center")[0].innerHTML),
            hidden_input : util.stringToBoolean(section.getElementsByTagName("hidden-input")[0].innerHTML),
            enable_text_input : util.stringToBoolean(section.getElementsByTagName("enable-text-input")[0].innerHTML),
            points : [] as number[][],
            // Optional properties
            tooltip : section.getElementsByTagName("tooltip").length>0? section.getElementsByTagName("tooltip")[0].innerHTML : "",
            access_levels : section.getElementsByTagName("access-levels").length ? util.parseAccessLevels(section.getElementsByTagName("access-levels")[0].innerHTML) : ["rw","rw","rw","rw","rw","rw","rw","rw"]
        }
        
        // Parsing the point coordinates
        let xmlPoints = section.getElementsByTagName('point');
        for (let i=0; i<xmlPoints.length; i++){
            let points = util.stringToArray(xmlPoints[i].innerHTML);
            polyShapeBasis.points.push(points);
        };
        // Auxiliary values
        polyShapeBasis.rect = util.computeMinMaxCoord(polyShapeBasis.points);
        
        // Parsing the textfields and returning a jsx object if it exists
        let textField : JSX.Element;
        if (section.getElementsByTagName("text-format").length){
            let dynamicTextParameters = parseDynamicTextParameters(section, shape);
            textField = <Textfield section={section} dynamicParameters={dynamicTextParameters}></Textfield>;
        } else {
            textField = null;
        }
        
        // Parsing the inputfield
        let inputField : JSX.Element;
        if (section.getElementsByTagName("enable-text-input").length){
            if(section.getElementsByTagName("enable-text-input")[0].innerHTML == "true"){
                inputField = <Inputfield section={section}></Inputfield>
            } else {
                inputField = null;
            }
        } else {
            inputField = null;
        }
        
        // Parsing of observable events (like toggle color)
        let dynamicShapeParameters = parseDynamicShapeParameters(section);
        
        // Parsing of user events that causes a reaction like toggle or pop up input
        let onclick =parseClickEvent(section);
        let onmousedown = parseTapEvent(section, "down");
        let onmouseup = parseTapEvent(section, "up");
        
        // Return of the React-Node
        switch (shape){
            case 'polygon':
                return(
                    <Polygon
                    polyShape={polyShapeBasis} 
                    textField={textField}
                    input ={inputField}
                    dynamicParameters={dynamicShapeParameters} 
                    onclick={onclick} 
                    onmousedown={onmousedown} 
                    onmouseup={onmouseup}/>
                );
                break;
            case 'bezier':
                return(
                    <Bezier
                    polyShape={polyShapeBasis} 
                    textField={textField}
                    input ={inputField}
                    dynamicParameters={dynamicShapeParameters} 
                    onclick={onclick} 
                    onmousedown={onmousedown} 
                    onmouseup={onmouseup}/>
                );
                break;
            case 'polyline':
                return(
                    <Polyline
                    polyShape={polyShapeBasis} 
                    textField={textField}
                    input ={inputField}
                    dynamicParameters={dynamicShapeParameters} 
                    onclick={onclick} 
                    onmousedown={onmousedown} 
                    onmouseup={onmouseup}/>
                );
                break;
        } 
    } else {
        console.log("Poly-Shape: <" + shape + "> is not supported!");
        return null;
    }
}
