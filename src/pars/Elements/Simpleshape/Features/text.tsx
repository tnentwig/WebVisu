import * as util from '../../../Utils/utilfunctions'
import * as React from "react";

export function parseTextfield(section : JQuery<XMLDocument>) : JSX.Element | undefined {
    // Check if a text tag is given
    if (section.children('text-format').length > 0) {
        // Parse the <font-...> tags
        let font_height = Number(section.children("font-height").text());
        let font_height_point_size = Number(section.children("font-height-point-size").text());
        let font_weight = Number(section.children("font-weight").text());
        let font_italic = util.stringToBoolean(section.children("font-italic").text());
        let font_strike_out = util.stringToBoolean(section.children("font-strike-out").text());
        let font_underline = util.stringToBoolean(section.children("font-underline").text());
        let font_char_set = Number(section.children("font-char-set").text());
        let font_color = util.rgbToHexString(section.children("font-color").text());
        // Parse the <text-...> tags
        let text_id = Number(section.children("text-id").text());
        let text_align_horz = section.children("text-align-horz").text();
        let text_align_vert = section.children("text-align-vert").text();
        let text = section.children("text-format").text();

        return (
            <text 
            x={0} 
            y={30} 
            pointerEvents={'none'}
            >{text}</text>
        )
    }
    else {
        return undefined;
    }
}