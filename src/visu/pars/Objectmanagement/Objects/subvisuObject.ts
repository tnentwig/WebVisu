import ComSocket from '../../../communication/comsocket';
import { ISubvisuObject } from '../../../Interfaces/jsinterfaces';
import { ISubvisuShape } from '../../../Interfaces/javainterfaces'
import { numberToHexColor } from '../../Utils/utilfunctions'

export function createSubvisuObject(subvisuShape: ISubvisuShape, dynamicElements : Map<string,string[][]>) : ISubvisuObject{
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left 
    let absCornerCoord = {x1:subvisuShape.rect[0],y1:subvisuShape.rect[1],x2:subvisuShape.rect[2],y2:subvisuShape.rect[3]};
    // absCenterCoord are the coordinates of the rotation and scale center
    let absCenterCoord = {x:subvisuShape.center[0], y:subvisuShape.center[1]};
    // relCoord are the width and the height in relation the div
    let relCoord = {width:subvisuShape.rect[2] - subvisuShape.rect[0], height:subvisuShape.rect[3] - subvisuShape.rect[1]};
    // the relCenterCoord are the coordinates of the midpoint of the div
    let relMidpointCoord = {x:(subvisuShape.rect[2] - subvisuShape.rect[0]) / 2, y:(subvisuShape.rect[3] - subvisuShape.rect[1]) / 2};
    // The line_width is 0 in the xml if border width is 1 in the codesys dev env. Otherwise line_width is equal to the target border width. Very strange.
    let edge = (subvisuShape.line_width === 0) ? 1 : subvisuShape.line_width;
    // Compute the strokeWidth through has_frame_color
    let lineWidth = (subvisuShape.has_frame_color) ? edge : 0;
    // Compute the fill color through has_fill_color
    let fillColor = (subvisuShape.has_inside_color) ? subvisuShape.fill_color : 'none';
    // Tooltip
    let tooltip = subvisuShape.tooltip;
    
    // Create an object with the initial parameters
    let initial : ISubvisuObject= {
        // Variables will be initialised with the parameter values 
        normalFillColor : subvisuShape.fill_color,
        alarmFillColor : subvisuShape.fill_color_alarm,
        normalFrameColor : subvisuShape.frame_color,
        alarmFrameColor : subvisuShape.frame_color_alarm,
        hasFillColor : subvisuShape.has_inside_color,
        hasFrameColor : subvisuShape.has_frame_color,
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
        scale : 1000, // a scale of 1000 means a representation of 1:1
        angle : 0,
        // Activate / deactivate input
        eventType : "visible",
        // Computed
        fill : fillColor,
        edge : edge,
        stroke : subvisuShape.frame_color,
        strokeDashArray : "0",
        display : "visible" as any,
        alarm : false,
        tooltip : tooltip,
        strokeWidth : lineWidth,
        // Transformed corner coordinates, relative width and height
        transformedCornerCoord : absCornerCoord,
        relCoord : relCoord,
        relMidpointCoord : relMidpointCoord,
        // Access variables
        writeAccess : true,
        readAccess : true,
        // Scaling
        visuScale : "scale(1)"
    }
    
    // Processing the variables for visual elements
    // A <expr-..-> tag initiate a variable, const or a placeholder
    // We have to implement the const value, the variable or the placeholdervalue if available for the static value
    // Polyshapes and Simpleshapes have the same <expr-...> possibilities
    
    if (dynamicElements.has("expr-toggle-color")) {
        let element = dynamicElements.get("expr-toggle-color");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        let wrapperFunc = ()=>{
            let value = returnFunc();
            return(value)
            }
        Object.defineProperty(initial, "alarm", {
            get: ()=>wrapperFunc()
        });
    }
    // 2) Set fill color
    if (dynamicElements.has("expr-fill-color")) {
        let element = dynamicElements!.get("expr-fill-color");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        let wrapperFunc = ()=>{
            let value = returnFunc();
            let hexcolor = numberToHexColor(value);
            return(hexcolor)
        }
        Object.defineProperty(initial, "normalFillColor", {
            get: ()=>wrapperFunc()
        }); 
    }
    // 3) Set alarm color
    if (dynamicElements.has("expr-fill-color-alarm")) {
        let element = dynamicElements!.get("expr-fill-color-alarm");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        let wrapperFunc = ()=>{
            let value = returnFunc();
            let hexcolor = numberToHexColor(value);
            return(hexcolor)
        }
        Object.defineProperty(initial, "alarmFillColor", {
            get: ()=>wrapperFunc()
        });
    }
    // 4) Set frame color
    if (dynamicElements.has("expr-frame-color")) {
        let element = dynamicElements!.get("expr-frame-color");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        let wrapperFunc = ()=>{
            let value = returnFunc();
            let hexcolor = numberToHexColor(value);
            return(hexcolor)
        }
        Object.defineProperty(initial, "normalFrameColor", {
            get: ()=>wrapperFunc()
        });
    
    }
    // 5) Set alarm frame color
    if (dynamicElements.has("expr-frame-color-alarm")) {
        let element = dynamicElements!.get("expr-frame-color-alarm");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        let wrapperFunc = ()=>{
            let value = returnFunc();
            let hexcolor = numberToHexColor(value);
            return(hexcolor)
        }
        Object.defineProperty(initial, "alarmFrameColor", {
            get: ()=>wrapperFunc()
        });
    }
    
    // 6) Set invisible state
    if (dynamicElements.has("expr-invisible")) {
        let element = dynamicElements!.get("expr-invisible");
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = ()=>{
            let value = returnFunc();
            if (value!== undefined){
                if (value == 0){
                    return "visible";
                } else {
                    return "hidden";
                }
            }
        }
        Object.defineProperty(initial, "display", {
            get: ()=>wrapperFunc()
        });
    }
    // 7) Set fill flag state
    if (dynamicElements.has("expr-fill-flags")) {
        let element = dynamicElements!.get("expr-fill-flags");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        let wrapperFunc = ()=>{
            let value = returnFunc();
                if (value == "1"){
                    return false;
                } else {
                    return true;
            }
        }
        Object.defineProperty(initial, "hasFillColor", {
            get: ()=>wrapperFunc()
        });
    } 
    // 8) Set frame flag state
    if (dynamicElements.has("expr-frame-flags")) {
        let element = dynamicElements!.get("expr-frame-flags");
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, "hasFrameColor", {
            get: function() {
                let value = returnFunc() == "8" ? false : true;
                return value;
            }
        });
        Object.defineProperty(initial, "strokeDashArray", {
            get: function() {
                let value = returnFunc();
                if (initial.lineWidth <= 1){
                    if (value == "4"){
                        return "20,10,5,5,5,10";
                    } else if (value == "3"){
                        return "20,5,5,5";
                    } else if (value == "2"){
                        return "5,5";
                    } else if (value == "1"){
                        return "10,10";
                    } else {
                        return "0";
                    }
                } else {
                    return "0";
                }
            }
        });
    }
    // 9) line-width
    if (dynamicElements.has("expr-line-width")) {
        let element = dynamicElements!.get("expr-line-width");
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = ()=>{
            let value = returnFunc();
            let width = Number(value);
                if (width == 0){
                    return 1;
                } else {
                    return width;
                }
            }
        Object.defineProperty(initial, "lineWidth", {
            get: ()=>wrapperFunc()
        });
    }
    
    // 10) Left-Position
    if (dynamicElements.has("expr-left")) {
        let element = dynamicElements!.get("expr-left");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "left", {
            get: ()=>returnFunc()
        });
    }
    // 11) Right-Position
    if (dynamicElements.has("expr-right")) {
        let element = dynamicElements!.get("expr-right");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "right", {
            get: ()=>returnFunc()
        });
    }
    // 12) Top-Position 
    if (dynamicElements.has("expr-top")) {
        let element = dynamicElements!.get("expr-top");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "top", {
            get: ()=>returnFunc()
        });
    }
    // 13) Bottom-Position 
    if (dynamicElements.has("expr-bottom")) {
        let element = dynamicElements!.get("expr-bottom");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "bottom", {
            get: ()=>returnFunc()
        });
    }
    // 14) x-Position 
    if (dynamicElements.has("expr-xpos")) {
        let element = dynamicElements!.get("expr-xpos");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "xpos", {
            get: ()=>returnFunc()
        });
    }
    // 15) y-Position 
    if (dynamicElements.has("expr-ypos")) {
        let element = dynamicElements!.get("expr-ypos");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "ypos", {
            get: ()=>returnFunc()
        });
    }
    // 16) Scaling
    if (dynamicElements.has("expr-scale")) {
        let element = dynamicElements!.get("expr-scale");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "scale", {
            get: ()=>returnFunc()
        });
    }
    // 17) Rotating
    if (dynamicElements.has("expr-angle")) {
        let element = dynamicElements!.get("expr-angle");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "angle", {
            get: ()=>returnFunc()
        });
    }
    // 18) Tooltip
    if (dynamicElements.has("expr-tooltip-display")){
        let element = dynamicElements!.get("expr-tooltip-display");
        let returnFunc = (ComSocket.singleton().evalFunction(element));
        Object.defineProperty(initial, "tooltip", {
            get: ()=>returnFunc()
        });
    }
    // 19) Deactivate Input
    if (dynamicElements.has("expr-input-disabled")){
        let element = dynamicElements!.get("expr-input-disabled");
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = ()=>{
            let value = returnFunc();
            if (value == "1"){
                return "none";
            } else {
                return "visible";
            }
        }
        Object.defineProperty(initial, "eventType", {
            get: ()=>wrapperFunc()
        });
    }
    
    // Piechart specific stuff ( start- and endangle)
    if (dynamicElements.has("expr-angle1")){
        let element = dynamicElements!.get("expr-angle1");
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = ()=>{
            let value = returnFunc();
            return (value % 360)
        }
        Object.defineProperty(initial, "startAngle", {
            get: ()=>wrapperFunc()
        });
    }
    if (dynamicElements.has("expr-angle2")){
        let element = dynamicElements!.get("expr-angle2");
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = ()=>{
            let value = returnFunc();
            return (value % 360)
        }
        Object.defineProperty(initial, "endAngle", {
            get: ()=>wrapperFunc()
        });
    }
    
    // We have to compute the dependent values after all the required static values ​​have been replaced by variables, placeholders or constant values 
    // E.g. the fillcolor depends on hasFillColor and alarm. This variables are called "computed" values. MobX will track their dependents and rerender the object by change.
    // We have to note that the rotation of polylines is not the same like simpleshapes. Simpleshapes keep their originally alignment, polyhapes transform every coordinate.
    
    // The fill color
    Object.defineProperty(initial, "fill", {
        get: function() {
            if (initial.alarm == false){
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
            return initial.lineWidth;
            }
    });
    
    Object.defineProperty(initial, "stroke", {
        get: function() {
            if (initial.alarm == false){
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
                if (initial.lineWidth == 0){
                    return 1;
                } else {
                    return initial.lineWidth;
                }
            } else {
                return 0;
            }
        }
    });
    
    // The transformed corner coordinates depends on the shapetype. The rotating operation is different for simpleshapes and polyshapes
    // Simpleshape:
    Object.defineProperty(initial, "transformedCornerCoord", {
        get: function() {
            let x1 = initial.absCornerCoord.x1;
            let x2 = initial.absCornerCoord.x2;
            let y1 = initial.absCornerCoord.y1;
            let y2 = initial.absCornerCoord.y2;
            let xc = initial.absCenterCoord.x;
            let yc = initial.absCenterCoord.y;
            // Scaling: the vector isnt normalized to 1
            let scale = (initial.scale / 1000);
            x1 = scale * (x1 - xc) + xc;
            y1 = scale * (y1 - yc) + yc;
            x2 = scale * (x2 - xc) + xc;
            y2 = scale * (y2 - yc) + yc;
            // Rotating
            let sinphi = Math.sin(initial.angle * (2 * Math.PI) / 360);
            let cosphi = Math.cos(initial.angle * (2 * Math.PI) / 360);
            let xoff = (x1 - xc) * cosphi - (y1 - yc) * sinphi - (x1 - xc);
            let yoff = (x1 - xc) * sinphi + (y1 - yc) * cosphi - (y1 - yc);
            // Add the offset
            x1 += initial.xpos + initial.left + xoff;
            x2 += initial.xpos + initial.right + xoff;
            y1 += initial.ypos + initial.top + yoff;
            y2 += initial.ypos + initial.bottom + yoff;
            // Init the interim return object
            let coord ={x1:x1,y1:y1,x2:x2,y2:y2};
            /*
            if (x1 > x2){
                coord.x1 = x2;
                coord.x2 = x1;
            }
            if (y1 > y2){
                coord.y1 = y2;
                coord.y2 = y1;
            }
            */
            return coord;
        }
    });
    Object.defineProperty(initial, "relCoord", {
        get: function() {
            let width = Math.abs(initial.transformedCornerCoord.x2 - initial.transformedCornerCoord.x1);
            let height = Math.abs(initial.transformedCornerCoord.y2 - initial.transformedCornerCoord.y1);
            return {width:width,height:height}
        }
    });
    
    Object.defineProperty(initial, "relMidpointCoord", {
        get: function() {
            let x = initial.relCoord.width / 2;
            let y = initial.relCoord.height / 2;
            return {x:x,y:y}
        }
    });
    
    // Define the object access variables
    Object.defineProperty(initial, "writeAccess", {
        get: function() {
            let current = ComSocket.singleton().oVisuVariables.get(".currentuserlevel")!.value;
            let currentNum = Number(current);
            if (currentNum !== NaN){
                if (subvisuShape.access_levels[currentNum].includes("w")){
                    return true
                } else {
                    return false
                }
            } else {
                return (false)
            }
        }
    });
    
    Object.defineProperty(initial, "readAccess", {
        get: function() {
            let current = ComSocket.singleton().oVisuVariables.get(".currentuserlevel")!.value;
            let currentNum = Number(current);
            if (currentNum !== NaN){
                if (subvisuShape.access_levels[currentNum].includes("r")){
                    return true
                } else {
                    return false
                }
            } else {
                return (false)
            }
        }
    });
    
    
    Object.defineProperty(initial, "visuScale", {
        get: function() {
            let xscaleFactor = relCoord.width / (subvisuShape.visu_size[0]);
            let yscaleFactor = relCoord.height / (subvisuShape.visu_size[1]);
            if (subvisuShape.original_frame) {
                return("scale(1)");
            } else if (subvisuShape.iso_frame) {
                return("scale(" + Math.min(xscaleFactor, yscaleFactor).toString() + ")");
            } else {
                return("scale(" + xscaleFactor.toString() + "," + yscaleFactor.toString() + ")");
            }
        }
    });

    return initial;
}
