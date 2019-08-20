import * as $ from 'jquery';

export function parseUserEvent(section : JQuery<XMLDocument>) : string[] {
    let varList : string[] = [];
    // Parse the <expr-toggle-var><expr><var> ... elements
    section.children("expr-toggle-var").children("expr").each(function() {
       varList.push($(this).children("var").text());
    })
    return varList;
}
