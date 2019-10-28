import * as util from '../../../Utils/utilfunctions'
import * as React from 'react';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import ComSocket from '../../../../com/comsocket';
import {numberToHexColor} from '../../../Utils/utilfunctions'

type Props = {
    section : JQuery<XMLDocument>,
    dynamicParameters : Map<string, string>
}

export const Textfield :React.FunctionComponent<Props> = ({section, dynamicParameters})=>
{        // The static tags for the font
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
        let textId = Number(section.children("text-id").text());
        let textAlignHorz = section.children("text-align-horz").text();
        let textAlignVert = section.children("text-align-vert").text();
        let text = section.children("text-format").text();


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
            text : text,
            // Computed Elements
            horzPosition : "center",
            vertPosition : "central" as any,
            output : text,
            fontStyle : "normal",
            textDecoration : "initial"

        };

        // Create the variable parameters
        // 1) The text flags: 1: linksbündig, 2: rechtsbündig, 4: horizontal zentriert, 8: oben, 10: unten, 20: vertikal zentriert
        /*if (dynamicParameters.has("expr-text-flags")) {
            let element = dynamicParameters!.get("expr-text-flags");
            Object.defineProperty(initial, "textAlignHorz", {
                get: function() {
                    let value = Number(ComSocket.singleton().oVisuVariables.get(element)!.value) % 10;
                    if (value & 4){
                        return false;
                    } else {
                        return true;
                    }
                }
            });
        }*/
        // 2) The font flags: 
        if (dynamicParameters.has("expr-font-flag")) {
            let element = dynamicParameters!.get("expr-font-flag");
            Object.defineProperty(initial, "hasUnderline", {
                get: function() {
                    let value = (Number(ComSocket.singleton().oVisuVariables.get(element)!.value) & 4) ? true : false ;
                    return value;
                }
            });
            Object.defineProperty(initial, "isItalic", {
                get: function() {
                    let value = (Number(ComSocket.singleton().oVisuVariables.get(element)!.value) & 1) ? true : false ;
                    return value;
                }
            });
            Object.defineProperty(initial, "hasStrikeOut", {
                get: function() {
                    let value = (Number(ComSocket.singleton().oVisuVariables.get(element)!.value) & 8) ? true : false ;
                    return value;
                }
            });
            Object.defineProperty(initial, "fontWeight", {
                get: function() {
                    let value = (Number(ComSocket.singleton().oVisuVariables.get(element)!.value) & 2) ? 700 : 400 ;
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
                    value = value/1.3;
                    return value;
                }
            });
        }


        Object.defineProperty(initial, "horzPosition", {
            get: function() {
                let position = (initial.textAlignHorz === 'center') ? 'middle' : ((initial.textAlignHorz === 'left') ? 'end' : 'start')
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
                    string += "line-through ";
                }
                if (initial.hasUnderline){
                    string += "underline ";
                }
            return string
            }
        });
        // Compute the shown string


        const state  = useLocalStore(()=>initial);

        return useObserver(()=>
            <text
                textDecoration={state.textDecoration}
                fontStyle={state.fontStyle}
                fill={state.fontColor}
                fontWeight={state.fontWeight}
                fontSize={-state.fontHeight}
                fontFamily={state.fontName}
                textAnchor ={"start"}
                pointerEvents={'none'}>
                <tspan
                alignmentBaseline = {state.vertPosition}
                x={'0%'} 
                y={'50%'} >
                    {text}
                </tspan>
            </text>
        )
}