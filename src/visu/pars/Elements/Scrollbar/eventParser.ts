import * as $ from 'jquery';
import ComSocket from '../../../communication/comsocket';
// This function is parsing all <expr-...> tags like toggle color and returns a map with the expression as key and the variable as value

export function parseScrollbarParameters(section : JQuery<XMLDocument>) : Map<string, {type:string, value:string}> {
    let exprMap : Map<string,{type:string, value:string}>= new Map();
    let tags : Array<string>= [];
    // Styling tags
    tags.push("expr-lower-bound");          // The textflags sets the alignment of the text
    tags.push("expr-upper-bound");          // The font flags sets the external appearance
    tags.push("expr-invisible");            // Invisible
    // Tooltip
    tags.push("expr-tooltip-display");      // tooltip variable
    // Variable for the value
    tags.push("expr-tap-var");

    tags.forEach(function(entry){
        section.children(entry).children("expr").each(function() {
            // The expression could be a variable, a placeholder or a constant value
            if ($(this).children("var").text().length){
                let varName = $(this).children("var").text();
                if(ComSocket.singleton().oVisuVariables.has(varName)){
                    exprMap.set(entry, {type:"var", value:varName});
                }
            }else if($(this).children("const").text().length){
                let constValue = $(this).children("const").text();
                exprMap.set(entry, {type:"const", value:constValue});
                
            }else if($(this).children("placeholder").text().length){
                let placeholderName = $(this)!.children("placeholder").text();
                //console.log("A placeholder variable: "+placeholderName+" for <"+entry+"> was found.");
            }
        })
    });
    return exprMap;
}

export function updateScrollvalue(section : JQuery<XMLDocument>) : Function {
    let update : Function;
     section.children("expr-tap-var").children("expr").each(function() {
        let varName = $(this).children("var").text();
        let com = ComSocket.singleton();
        if(com.oVisuVariables.has(varName)){
            update = function(setValue : string):void{
                com.setValue(varName, setValue);
            }
        }
        else{
            let placeholderName = $(this)!.children("placeholder").text();
        }
     })

    return update;
}
