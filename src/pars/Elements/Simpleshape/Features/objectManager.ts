import ComSocket from '../../../../com/comsocket';
import {IVisuObject} from './interfaces'
import {numberToHexColor} from '../../../Utils/utilfunctions'

export function attachDynamicParameters(visuObject: IVisuObject, dynamicElements : Map<string,string>) : IVisuObject{
    // Processing the variables for visual elements
    // 1) Set alarm state
    if (dynamicElements.has("expr-toggle-color")) {
        let element = dynamicElements!.get("expr-toggle-color");
        Object.defineProperty(visuObject, "alarm", {
            get: function() {
                let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                if (value === "0"){
                    return false;
                } else {
                    return true;
                }
            }
        });
    }
    // 2) Set fill color
    if (dynamicElements.has("expr-fill-color")) {
        let element = dynamicElements!.get("expr-fill-color");
        Object.defineProperty(visuObject, "normalFillColor", {
            get: function() {
                return numberToHexColor(ComSocket.singleton().oVisuVariables.get(element)!.value);
            }
        });
    }
    // 3) Set alarm color
    if (dynamicElements.has("expr-fill-color-alarm")) {
        let element = dynamicElements!.get("expr-fill-color-alarm");
        Object.defineProperty(visuObject, "alarmFillColor", {
            get: function() {
                return numberToHexColor(ComSocket.singleton().oVisuVariables.get(element)!.value);
            }
        });
    }
    // 4) Set frame color
    if (dynamicElements.has("expr-frame-color")) {
        let element = dynamicElements!.get("expr-frame-color");
        Object.defineProperty(visuObject, "normalFrameColor", {
            get: function() {
                return numberToHexColor(ComSocket.singleton().oVisuVariables.get(element)!.value);
            }
        });
    }
    // 5) Set alarm frame color
    if (dynamicElements.has("expr-frame-color-alarm")) {
        let element = dynamicElements!.get("expr-frame-color-alarm");
        Object.defineProperty(visuObject, "alarmFrameColor", {
            get: function() {
                return numberToHexColor(ComSocket.singleton().oVisuVariables.get(element)!.value);
            }
        });
    }

    // 6) Set invisible state
    if (dynamicElements.has("expr-invisible")) {
        let element = dynamicElements!.get("expr-invisible");
        Object.defineProperty(visuObject, "display", {
            get: function() {
                let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                if (value === "0"){
                    return "visible";
                } else {
                    return "hidden";
                }
            }
        });
    }
    // 7) Set fill flag state
    if (dynamicElements.has("expr-fill-flags")) {
        let element = dynamicElements!.get("expr-fill-flags");
        Object.defineProperty(visuObject, "hasFillColor", {
            get: function() {
                let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                if (value === "0"){
                    return false;
                } else {
                    return true;
                }
            }
        });
    }
    // 8) Set frame flag state
    if (dynamicElements.has("expr-frame-flags")) {
        let element = dynamicElements!.get("expr-frame-flags");
        Object.defineProperty(visuObject, "hasFrameColor", {
            get: function() {
                let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                if (value === "0"){
                    return false;
                } else {
                    return true;
                }
            }
        });
    }
    // 9) line-width
    if (dynamicElements.has("expr-line-width")) {
        let element = dynamicElements!.get("expr-line-width");
        Object.defineProperty(visuObject, "strokeWidth", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    
    // 10) Left-Position
    if (dynamicElements.has("expr-left")) {
        let element = dynamicElements!.get("expr-left");
        Object.defineProperty(visuObject, "left", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 11) Right-Position
    if (dynamicElements.has("expr-right")) {
        let element = dynamicElements!.get("expr-right");
        Object.defineProperty(visuObject, "right", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 12) Top-Position 
    if (dynamicElements.has("expr-top")) {
        let element = dynamicElements!.get("expr-top");
        Object.defineProperty(visuObject, "top", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 13) Bottom-Position 
    if (dynamicElements.has("expr-bottom")) {
        let element = dynamicElements!.get("expr-bottom");
        Object.defineProperty(visuObject, "bottom", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 14) x-Position 
    if (dynamicElements.has("expr-xpos")) {
        let element = dynamicElements!.get("expr-xpos");
        Object.defineProperty(visuObject, "xpos", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 15) y-Position 
    if (dynamicElements.has("expr-ypos")) {
        let element = dynamicElements!.get("expr-ypos");
        Object.defineProperty(visuObject, "ypos", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 16) Scaling
    if (dynamicElements.has("expr-scale")) {
        let element = dynamicElements!.get("expr-scale");
        Object.defineProperty(visuObject, "scale", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 17) Rotating
    if (dynamicElements.has("expr-angle")) {
        let element = dynamicElements!.get("expr-angle");
        Object.defineProperty(visuObject, "angle", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    return visuObject;
}