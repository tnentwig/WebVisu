import * as $ from 'jquery';

// This function is parsing all <expr-...> tags like toggle color and returns a map with the expression as key and the variable as value

export function parseReactions(section : JQuery<XMLDocument>) : Map<string, string> {
    let exprMap : Map<string,string>= new Map();
    let tags = [];
    tags.push("expr-toggle-color");         // Toggles normal and alarm color
    tags.push("expr-fill-color");           // Variable for the fill color
    tags.push("expr-fill-color-alarm");     
    tags.push("expr-frame-color");          // Variable for the frame color
    tags.push("expr-frame-color-alarm");
    tags.push("expr-invisible");            // Flag to make the object invisible
    tags.forEach(function(entry){
        section.children(entry).children("expr").each(function() {
        exprMap!.set(entry, $(this)!.children("var")!.text());
        })
    });
    return exprMap;
}
