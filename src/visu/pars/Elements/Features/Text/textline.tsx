import * as React from 'react';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import ComSocket from '../../../../communication/comsocket';
import {sprintf} from 'sprintf-js';

type Props = {
    textLine : string,
    section : Element,
    dynamicParameters : Map<string, string>,
    numberOfLines : number,
    firstItem : boolean
}

export const Textline :React.FunctionComponent<Props>  = ({section, dynamicParameters, textLine, numberOfLines, firstItem})  =>
{       
    let fontHeight = Number(section.getElementsByTagName("font-height")[0].innerHTML);
    let textAlignHorz = section.getElementsByTagName("text-align-horz")[0].innerHTML;
    let textAlignVert = section.getElementsByTagName("text-align-vert")[0].innerHTML;
        const initial = {
            textVariable : "",
            // Vertical orientation
            dominantBaseline : "middle" as any,
            deltay : fontHeight,
            // Horizontal
            fontHeight : fontHeight,
            textAlignHorz : textAlignHorz,
            textAlignVert : textAlignVert,
            xpos : "50%",
            textOutput : ""

        };

        // The text variable: 
        if (dynamicParameters.has("text-display")) {
            let element = dynamicParameters!.get("text-display");
            Object.defineProperty(initial, "textVariable", {
                get: function() {
                    let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                    return value;
                }
            });
        }
        // The delta value: 
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
        // The horzizontal and vertical Align
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

        Object.defineProperty(initial, "dominantBaseline", {
            get: function() {
                let position = (initial.textAlignVert == 'center') ? 'middle' : ((initial.textAlignVert == 'bottom') ? "baseline" : "hanging");
            return position
            }
        });

        Object.defineProperty(initial, "textOutput", {
            get: function() {
                // CoDeSys has implemented a %t symbol to show date and time. The text is not computed with sprintf then
                let output : string;
                if (textLine.includes("%t")){
                    output = "%t not supported yet!";
                }
                else{
                    try{
                        if (textLine.includes("%|<|")){
                            while(textLine.includes("|")){
                                textLine = textLine.replace("|", '');
                            };
                            textLine = textLine.replace("%<", '%%<');
                        }
                        output = sprintf(textLine, initial.textVariable);
                    }catch{
                        output = "Error";
                    }
                }
            return output
            }
        })

        Object.defineProperty(initial, "deltay", {
            get: function() {
                if (firstItem){
                    let interim = ((numberOfLines-1)*(initial.fontHeight))/2;
                    return interim
                } else {
                    return -initial.fontHeight
                }
            }
        })

        Object.defineProperty(initial, "xpos", {
            get: function() {
                let position = (initial.textAlignHorz == 'center') ? '50%' : ((initial.textAlignHorz == 'left') ? "5%" : "95%");
            return position
            }
        });
     
        const state  = useLocalStore(()=>initial);

        return useObserver(()=>
            <tspan
                dominantBaseline = {state.dominantBaseline}
                x={state.xpos} 
                dy={state.deltay}
                >
                {state.textOutput}
            </tspan>
        )
        
       
    }
