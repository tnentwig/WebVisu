import * as React from "react";

export function Circle (has_inside_color : boolean, fill_color : string, fill_color_alarm : string, has_frame_color : boolean, frame_color : string,
frame_color_alarm : string, line_width : number, hidden_input : boolean, enable_text_input : boolean, rect : number[], center : number[]) 
{
    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    let relCenterCoord = {x:center[0]-rect[0], y:center[1]-rect[1]};
    let edge = 1;
    
    // A 'circle' can be a circle or an ellipse.
    return(
    <div style={{position:"absolute", left:rect[0], top:rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
        <svg width={relCornerCoord.x2+2*edge} height={relCornerCoord.y2+2*edge}>   
            <ellipse
                cx={relCenterCoord.x+edge}
                cy={relCenterCoord.y+edge}
                rx={relCornerCoord.x2/2}
                ry={relCornerCoord.y2/2}
                fill={fill_color}
                strokeWidth={edge}
                stroke={frame_color}
            />
        </svg>
    </div>
    )
}

