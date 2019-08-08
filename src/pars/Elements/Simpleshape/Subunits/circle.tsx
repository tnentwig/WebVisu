import * as React from "react";

export function Circle (textField : JSX.Element|undefined, has_inside_color : boolean, fill_color : string, fill_color_alarm : string, has_frame_color : boolean, frame_color : string,
frame_color_alarm : string, line_width : number, hidden_input : boolean, enable_text_input : boolean, rect : number[], center : number[]) 
{
    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    let relCenterCoord = {x:center[0]-rect[0], y:center[1]-rect[1]};
    // The line_width is 0 in the xml if border width is 1 in the codesys dev env. Otherwise line_width is equal to the target border width. Very strange.
    let edge = (line_width === 0) ? 1 :line_width ;
    // Compute the strokeWidth through has_frame_color
    let strokeWidth = (has_frame_color) ? edge : 0;
    // Compute the fill color through has_fill_color
    let fillColor = (has_inside_color) ? fill_color : 'none';
    // A 'circle' can be a circle or an ellipse.


    
    return(
    <div style={{position:"absolute", left:rect[0], top:rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
        <svg width={relCornerCoord.x2+2*edge} height={relCornerCoord.y2+2*edge}>   
            <g>
                <ellipse
                cx={relCenterCoord.x+edge}
                cy={relCenterCoord.y+edge}
                rx={relCornerCoord.x2/2}
                ry={relCornerCoord.y2/2}
                fill={fillColor}
                strokeWidth={strokeWidth}
                stroke={frame_color}
                />
                {textField}
            </g>
        </svg>
    </div>
    )
}

