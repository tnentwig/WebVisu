import ComSocket from '../../../../com/comsocket';
import {IVisuObject} from './interfaces'
import {numberToHexColor} from '../../../Utils/utilfunctions'
import {ISimpleShape} from '../../../Interfaces/interfaces'

export function createVisuObject(simpleShape: ISimpleShape, dynamicElements : Map<string,string>) : IVisuObject{

    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left 
    let absCornerCoord = {x1:simpleShape.rect[0],y1:simpleShape.rect[1],x2:simpleShape.rect[2],y2:simpleShape.rect[3]};
    // absCenterCoord are the coordinates of the rotation and scale center
    let absCenterCoord = {x:simpleShape.center[0], y:simpleShape.center[1]};
    // relCoord are the width and the height in relation the div
    let relCoord = {width:simpleShape.rect[2]-simpleShape.rect[0], height:simpleShape.rect[3]-simpleShape.rect[1]};
    // the relCenterCoord are the coordinates of the midpoint of the div
    let relMidpointCoord = {x:(simpleShape.rect[2]-simpleShape.rect[0])/2, y:(simpleShape.rect[3]-simpleShape.rect[1])/2};
    // The line_width is 0 in the xml if border width is 1 in the codesys dev env. Otherwise line_width is equal to the target border width. Very strange.
    let edge = (simpleShape.line_width === 0) ? 1 :simpleShape.line_width ;
    // Compute the strokeWidth through has_frame_color
    let lineWidth = (simpleShape.has_frame_color) ? edge : 0;
    // Compute the fill color through has_fill_color
    let fillColor = (simpleShape.has_inside_color) ? simpleShape.fill_color : 'none';
    // Tooltip
    let tooltip = simpleShape.tooltip

    // Create an object with the initial parameters
    let initial  : IVisuObject= {
        // Variables will be initialised with the parameter values 
        normalFillColor : simpleShape.fill_color,
        alarmFillColor : simpleShape.fill_color_alarm,
        normalFrameColor : simpleShape.frame_color,
        alarmFrameColor : simpleShape.frame_color_alarm,
        hasFillColor : simpleShape.has_inside_color,
        hasFrameColor : simpleShape.has_frame_color,
        lineWidth : lineWidth,
        // Positional arguments
        absCornerCoord : absCornerCoord,
        absCenterCoord : absCenterCoord,
        left : 0,
        right : 0,
        top : 0,
        bottom : 0,
        xpos : 0,
        ypos : 0,
        scale : 1000,   // a scale of 1000 means a representation of 1:1
        angle : 0,
        // Activate / deactivate input
        eventType : "visible",
        // Computed
        strokeWidth : lineWidth,
        transformedCoord : absCornerCoord,
        relCoord : relCoord,
        relMidpointCoord : relMidpointCoord,
        fill : fillColor,
        edge : edge,
        stroke : simpleShape.frame_color,
        strokeDashArray : "0",
        display : "visible" as any,
        alarm : false,
        tooltip : tooltip
    }


    // Processing the variables for visual elements
    // 1) Set alarm state
    if (dynamicElements.has("expr-toggle-color")) {
        let element = dynamicElements!.get("expr-toggle-color");
        Object.defineProperty(initial, "alarm", {
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
        Object.defineProperty(initial, "normalFillColor", {
            get: function() {
                return numberToHexColor(ComSocket.singleton().oVisuVariables.get(element)!.value);
            }
        });
    }
    // 3) Set alarm color
    if (dynamicElements.has("expr-fill-color-alarm")) {
        let element = dynamicElements!.get("expr-fill-color-alarm");
        Object.defineProperty(initial, "alarmFillColor", {
            get: function() {
                return numberToHexColor(ComSocket.singleton().oVisuVariables.get(element)!.value);
            }
        });
    }
    // 4) Set frame color
    if (dynamicElements.has("expr-frame-color")) {
        let element = dynamicElements!.get("expr-frame-color");
        Object.defineProperty(initial, "normalFrameColor", {
            get: function() {
                return numberToHexColor(ComSocket.singleton().oVisuVariables.get(element)!.value);
            }
        });

    }
    // 5) Set alarm frame color
    if (dynamicElements.has("expr-frame-color-alarm")) {
        let element = dynamicElements!.get("expr-frame-color-alarm");
        Object.defineProperty(initial, "alarmFrameColor", {
            get: function() {
                return numberToHexColor(ComSocket.singleton().oVisuVariables.get(element)!.value);
            }
        });
    }

    // 6) Set invisible state
    if (dynamicElements.has("expr-invisible")) {
        let element = dynamicElements!.get("expr-invisible");
        Object.defineProperty(initial, "display", {
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
        Object.defineProperty(initial, "hasFillColor", {
            get: function() {
                let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                if (value === "1"){
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
        Object.defineProperty(initial, "hasFrameColor", {
            get: function() {
                let value = ComSocket.singleton().oVisuVariables.get(element)!.value == "8" ? false : true;
                return value;
            }
        });
        Object.defineProperty(initial, "strokeDashArray", {
            get: function() {
                let value = ComSocket.singleton().oVisuVariables.get(element)!.value;
                if (value == "4"){
                    return "20,10,5,5,5,10";
                } else if (value == "3"){
                    return "20,5,5,5";
                } else if (value == "2"){
                    return "5,5";
                } else if (value == "1"){
                    return "10,10";
                } 
                else {
                    return "0";
                }
            }
        });
    }
    // 9) line-width
    if (dynamicElements.has("expr-line-width")) {
        let element = dynamicElements!.get("expr-line-width");
        Object.defineProperty(initial, "lineWidth", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    
    // 10) Left-Position
    if (dynamicElements.has("expr-left")) {
        let element = dynamicElements!.get("expr-left");
        Object.defineProperty(initial, "left", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 11) Right-Position
    if (dynamicElements.has("expr-right")) {
        let element = dynamicElements!.get("expr-right");
        Object.defineProperty(initial, "right", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 12) Top-Position 
    if (dynamicElements.has("expr-top")) {
        let element = dynamicElements!.get("expr-top");
        Object.defineProperty(initial, "top", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 13) Bottom-Position 
    if (dynamicElements.has("expr-bottom")) {
        let element = dynamicElements!.get("expr-bottom");
        Object.defineProperty(initial, "bottom", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 14) x-Position 
    if (dynamicElements.has("expr-xpos")) {
        let element = dynamicElements!.get("expr-xpos");
        Object.defineProperty(initial, "xpos", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 15) y-Position 
    if (dynamicElements.has("expr-ypos")) {
        let element = dynamicElements!.get("expr-ypos");
        Object.defineProperty(initial, "ypos", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 16) Scaling
    if (dynamicElements.has("expr-scale")) {
        let element = dynamicElements!.get("expr-scale");
        Object.defineProperty(initial, "scale", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 17) Rotating
    if (dynamicElements.has("expr-angle")) {
        let element = dynamicElements!.get("expr-angle");
        Object.defineProperty(initial, "angle", {
            get: function() {
                return Number(ComSocket.singleton().oVisuVariables.get(element)!.value);
                }
        });
    }
    // 18) Tooltip
    if (dynamicElements.has("expr-tooltip-display")){
        let element = dynamicElements!.get("expr-tooltip-display");
        Object.defineProperty(initial, "tooltip", {
            get: function() {
                return ComSocket.singleton().oVisuVariables.get(element)!.value;
                }
        });
    }
    // 19) Deactivate Input
    if (dynamicElements.has("expr-input-disabled")){
        let element = dynamicElements!.get("expr-input-disabled");
        Object.defineProperty(initial, "deactivateInput", {
            get: function() {
                return (ComSocket.singleton().oVisuVariables.get(element)!.value=="1"?"none":"visible");
                }
        });
    }

    // Create the computed values


    Object.defineProperty(initial, "fill", {
        get: function() {
            if (initial.alarm === false){
                if (initial.hasFillColor){
                    return initial.normalFillColor;
                } else {
                    return "none";
                }
            } else {
                return initial.alarmFillColor;
            }
        }
    });
    Object.defineProperty(initial, "strokeWidth", {
        get: function() {
            if (initial.alarm === false){
                return initial.lineWidth;
                }
            else {
                return "1";
            }
        }
    });

    Object.defineProperty(initial, "stroke", {
        get: function() {
            if (initial.alarm === false){
                if (initial.hasFrameColor){
                    return initial.normalFrameColor;
                } else {
                    return "none";
                }
            } else {
                return initial.alarmFrameColor;
            }
        }
    });

    Object.defineProperty(initial, "edge", {
        get: function() {
            if (initial.hasFrameColor || initial.alarm){
                if (initial.lineWidth === 0){
                    return 1;
                } else {
                    return initial.lineWidth;
                }
            } else {
                return 0;
            }
        }
    });

    Object.defineProperty(initial, "transformedCoord", {
        get: function() {
            let x1 = initial.absCornerCoord.x1;
            let x2 = initial.absCornerCoord.x2;
            let y1 = initial.absCornerCoord.y1;
            let y2 = initial.absCornerCoord.y2;
            let xc = initial.absCenterCoord.x;
            let yc = initial.absCenterCoord.y;
            // Scaling: the vector isnt normalized
            x1 = (initial.scale/1000)*(x1-xc)+xc;
            y1 = (initial.scale/1000)*(y1-yc)+yc;
            x2 = (initial.scale/1000)*(x2-xc)+xc;
            y2 = (initial.scale/1000)*(y2-yc)+yc;
            // Rotating
            let sinphi = Math.sin(initial.angle*(2*Math.PI)/360);
            let cosphi = Math.cos(initial.angle*(2*Math.PI)/360);
            let xoff = (x1-xc)*cosphi-(y1-yc)*sinphi-(x1-xc);
            let yoff = (x1-xc)*sinphi+(y1-yc)*cosphi-(y1-yc);
            // Add the offset
            x1 += initial.xpos+ initial.left+xoff;
            x2 += initial.xpos + initial.right+xoff;
            y1 += initial.ypos + initial.top+yoff;
            y2 += initial.ypos+ initial.bottom+yoff;
            // Init the interim return object
            let coord ={x1:x1,y1:y1,x2:x2,y2:y2};

            if (x1>x2){
                coord.x1 = x2;
                coord.x2 = x1;
            }
            if (y1>y2){
                coord.y1 = y2;
                coord.y2 = y1;
            }
            return coord
        }
    });
    
    Object.defineProperty(initial, "relCoord", {
        get: function() {
            let width = initial.transformedCoord.x2-initial.transformedCoord.x1;
            let height = initial.transformedCoord.y2-initial.transformedCoord.y1;
            return {width:width,height:height}
        }
    });

    Object.defineProperty(initial, "relMidpointCoord", {
        get: function() {
            let x = initial.relCoord.width/2;
            let y = initial.relCoord.height/2;
            return {x:x,y:y}
        }
    });


    return initial;
}