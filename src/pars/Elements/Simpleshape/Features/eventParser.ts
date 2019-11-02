import * as $ from 'jquery';
import ComSocket from '../../../../com/comsocket';
// This function is parsing all <expr-...> tags like toggle color and returns a map with the expression as key and the variable as value

export function parseDynamicShapeParameters(section : JQuery<XMLDocument>, shape : string) : Map<string, string> {
    let exprMap : Map<string,string>= new Map();
    let tags : Array<string>= [];
    // Styling tags
    tags.push("expr-toggle-color");         // 1) Set alarm
    tags.push("expr-fill-color");           // 2) Variable for the fill color
    tags.push("expr-fill-color-alarm");     
    tags.push("expr-frame-color");          // 4) Variable for the frame color
    tags.push("expr-frame-color-alarm");
    tags.push("expr-invisible");            // 6) Flag to make the object invisible
    tags.push("expr-fill-flags");           // 7) Toggles the "has-inside-color"
    tags.push("expr-frame-flags");          // 8) Toggles the "has-frame-color"
    tags.push("expr-line-width");           // 9) line-width
 
    // Transition tags
    tags.push("expr-left");                 // Relative left
    tags.push("expr-right");                // Relative right
    tags.push("expr-top");                  // Relative top
    tags.push("expr-bottom");               // Relative bottom
    tags.push("expr-xpos");                 // Absolute x-position
    tags.push("expr-ypos");                 // Absolute y-position
    tags.push("expr-scale");                // Scale with middle reference point
    tags.push("expr-angle");                // Turn around center with angle

    // Tooltip
    tags.push("expr-tooltip-display");      // tooltip variable
    // Deactivate Input
    tags.push("expr-input-disabled");

    tags.forEach(function(entry){
        section.children(entry).children("expr").each(function() {
            let varName = $(this)!.children("var").text();
            // Determine if the deposited variable exists in the process image. There could be a misspelling of a variable name in the Codesysproject.
            if(ComSocket.singleton().oVisuVariables.has(varName)){
                exprMap.set(entry, varName);
            }
            else{
                let placeholderName = $(this)!.children("placeholder").text();
                console.log("A placeholder variable: "+placeholderName+" at <"+shape+ "> object for <"+entry+"> was found.");
            }
        })
    });

    return exprMap;
}

export function parseDynamicTextParameters(section : JQuery<XMLDocument>, shape: string) : Map<string, string> {
    let exprMap : Map<string,string>= new Map();
    let tags : Array<string>= [];
    // Styling tags
    tags.push("expr-text-flags");          // 1) The textflags sets the alignment of the text
    tags.push("expr-font-flags");          // 2) The font flags sets the external appearance
    tags.push("expr-font-name");           // 3) Sets the font name
    tags.push("text-display");             // 4) Sets the variable that has to be displayed
    tags.push("expr-text-color");          // 5) Sets the text color
    tags.push("expr-font-height");         // 6) Sets the font height

    tags.forEach(function(entry){
        section.children(entry).children("expr").each(function() {
            let varName = $(this)!.children("var").text();
            if(ComSocket.singleton().oVisuVariables.has(varName)){
                exprMap.set(entry, varName);
            }
            else{
                let placeholderName = $(this)!.children("placeholder").text();
                console.log("A placeholder variable: "+placeholderName+" at <"+shape+ "> object for <"+entry+"> was found.");
            }
        })
    });
    return exprMap;
}

export function parseUserEvent(section : JQuery<XMLDocument>) : string[] {
    let varList : string[] = [];
    // Parse the <expr-toggle-var><expr><var> ... elements => toggle color
    section.children("expr-toggle-var").children("expr").each(function() {
       varList.push($(this).children("var").text());
    })
    return varList;
}
