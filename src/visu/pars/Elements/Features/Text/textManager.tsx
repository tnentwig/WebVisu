import * as util from '../../../Utils/utilfunctions'
import * as React from 'react';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import ComSocket from '../../../../communication/comsocket';
import {numberToHexColor, getTextLines} from '../../../Utils/utilfunctions'
import {sprintf} from 'sprintf-js';
import {Textline} from './textline'
import {uid} from 'react-uid';

type Props = {
    section : JQuery<XMLDocument>,
    dynamicParameters : Map<string, string>
}

export const Textfield :React.FunctionComponent<Props>  = ({section, dynamicParameters})  =>
{       
        // The static tags for the font
        let fontName = (section.children("font-name").text().length) ? section.children("font-name").text() : "Arial";
        let fontHeight = Number(section.children("font-height").text());
        let font_height_point_size = Number(section.children("font-height-point-size").text());
        let fontWeight = Number(section.children("font-weight").text());
        let isItalic = util.stringToBoolean(section.children("font-italic").text());
        let hasStrikeOut = util.stringToBoolean(section.children("font-strike-out").text());
        let hasUnderline = util.stringToBoolean(section.children("font-underline").text());
        let charSet = Number(section.children("font-char-set").text());
        let fontColor = util.rgbToHexString(section.children("font-color").text());
        // The static text flags

        let textAlignHorz = section.children("text-align-horz").text();
        let textAlignVert = section.children("text-align-vert").text();
        let text = section.children("text-format").text();
        let textLines = getTextLines(text);
        // The id is used for static language change with a .vis file
        let textId = Number(section.children("text-id").text());

        const initial = {
            // Font variables
            fontHeight : fontHeight,
            fontWeight : fontWeight,
            fontColor : fontColor,
            fontName : fontName,
            hasUnderline : hasUnderline,
            isItalic : isItalic,
            hasStrikeOut : hasStrikeOut,
            // Text variables
            textAlignHorz : textAlignHorz,
            textAlignVert : textAlignVert,
            textVariable : "",
            // Computed Elements
            // Horizontal orientation has three arguments textAnchor and the relative x- and y-position
            textAnchor : "middle" as any,
            xpos : "50%",
            ypos : "50%",
            // Text manipulation
            fontStyle : "normal",
            textDecoration : "initial",
        };

        // Create the variable parameters
        // 1) The text flags: 1: linksbündig, 2: rechtsbündig, 4: horizontal zentriert, 8: oben, 10: unten, 20: vertikal zentriert
        // The sum of the attributes should determine the position of the element e.g. 4 + 20 = 24 => in the center of the svg
        // Problem: 12 is ambiguous : 8+4 and 10+2
        if (dynamicParameters.has("expr-text-flags")) {
            let element = dynamicParameters!.get("expr-text-flags");
            Object.defineProperty(initial, "textAlignHorz", {
                get: function() {
                let value = Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                if ((value/8)>0){
                    if (value == 4){
                        return "center";
                    } else if (value == 2) {
                        return "right";
                    } else if (value == 1) {
                        return "left";
                    }
                    else {
                        return "left"; // This is the standard if passed textflag isn't correct
                    }
                }
                }
            });
            Object.defineProperty(initial, "textAlignVert", {
                get: function() {
                    let value = Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                    if (value == 20){
                        return "center";
                    } else if (value == 8) {
                        return "top";
                    } else if (value == 10) {
                        return "bottom";
                    }
                    else {
                        return "top"; // This is the standard if passed textflag isn't correct
                    }
                }
            });
        }
        // 2) The font flags: 
        if (dynamicParameters.has("expr-font-flags")) {
            let element = dynamicParameters!.get("expr-font-flags");
            Object.defineProperty(initial, "hasUnderline", {
                get: function() {
                    let value = (Number(ComSocket.singleton().oVisuVariables.get(element)!.value) & 4)>0 ? true : false ;
                    return value;
                }
            });
            Object.defineProperty(initial, "isItalic", {
                get: function() {
                    let value = (Number(ComSocket.singleton().oVisuVariables.get(element)!.value) & 1)===1 ? true : false ;
                    return value;
                }
            });
            Object.defineProperty(initial, "hasStrikeOut", {
                get: function() {
                    let value = (Number(ComSocket.singleton().oVisuVariables.get(element)!.value) & 8)>0 ? true : false ;
                    return value;
                }
            });
            Object.defineProperty(initial, "fontWeight", {
                get: function() {
                    let value = (Number(ComSocket.singleton().oVisuVariables.get(element)!.value) & 2)>0 ? 700 : 400 ;
                    return value;
                }
            });
        }
        // 3) The font name: 
        if (dynamicParameters.has("expr-font-name")) {
            let element = dynamicParameters!.get("expr-font-name");
            Object.defineProperty(initial, "fontName", {
                get: function() {
                    let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                    return value + ", Arial";
                }
            });
        }

        // 5) The font color: 
        if (dynamicParameters.has("expr-text-color")) {
            let element = dynamicParameters!.get("expr-text-color");
            Object.defineProperty(initial, "fontColor", {
                get: function() {
                    let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                    let hex = numberToHexColor(value);
                    return hex;
                }
            });
        }
        // 6) The font height: 
        if (dynamicParameters.has("expr-font-height")) {
            let element = dynamicParameters!.get("expr-font-height");
            Object.defineProperty(initial, "fontHeight", {
                get: function() {
                    let value = (-1)*Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                    value = value/1.4;
                    return value;
                }
            });
        }

        Object.defineProperty(initial, "textAnchor", {
            get: function() {
                let position = (initial.textAlignHorz == 'center') ? 'middle' : ((initial.textAlignHorz == 'left') ? 'start' : 'end')
            return position
            }
        });
        Object.defineProperty(initial, "xpos", {
            get: function() {
                let position = (initial.textAlignHorz == 'center') ? '50%' : ((initial.textAlignHorz == 'left') ? "10%" : "100%");
            return position
            }
        });
        Object.defineProperty(initial, "ypos", {
            get: function() {
                let position = (initial.textAlignVert == 'center') ? '50%' : ((initial.textAlignVert == 'bottom') ? "90%" : "10%");
            return position
            }
        });
        Object.defineProperty(initial, "dominantBaseline", {
            get: function() {
                let position = (initial.textAlignVert == 'center') ? 'middle' : ((initial.textAlignVert == 'bottom') ? "baseline" : "hanging");
            return position
            }
        });
        Object.defineProperty(initial, "fontStyle", {
            get: function() {
                let value = (initial.isItalic === true) ? 'italic' : 'normal';
            return value
            }
        });
        Object.defineProperty(initial, "textDecoration", {
            get: function() {
                let string = "";
                if (initial.hasStrikeOut){
                    string = "line-through ";
                }
                if (initial.hasUnderline){
                    string = "underline ";
                }
                if (string.length) {
                    return string;
                }
                else {
                    return "initial";
                }
            }
        });
        

        // Create a map of lines
        let svgTextLines: Array<(JSX.Element | undefined | null)> =[];
        svgTextLines.push(
            <Textline firstItem={true} textLine={textLines[0]} numberOfLines={textLines.length} section={section} dynamicParameters={dynamicParameters}></Textline>
        )
        for (let i=1; i<textLines.length; i++){
            svgTextLines.push(
            <Textline firstItem={false} textLine={textLines[i]} numberOfLines={textLines.length} section={section} dynamicParameters={dynamicParameters}></Textline>
            )
        }

        const state  = useLocalStore(()=>initial);
        return useObserver(()=>
            <text
                textDecoration={state.textDecoration}
                fontStyle={state.fontStyle}
                fill={state.fontColor}
                fontWeight={state.fontWeight}
                fontSize={-state.fontHeight}
                fontFamily={state.fontName}
                textAnchor ={state.textAnchor}
                pointerEvents={'none'}
                y={state.ypos}
                >
                <React.Fragment>
                {
                    svgTextLines.map((element, index)=><React.Fragment key={uid(element)}>{element}</React.Fragment>)
                }
                </React.Fragment>
            </text>
        )
        
       
    }

