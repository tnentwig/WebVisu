import * as React from 'react';
import { ISimpleShape } from '../../../Interfaces/interfaces';

export function RoundRect (simpleShape : ISimpleShape) 
{
    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:simpleShape.rect[2]-simpleShape.rect[0], y2:simpleShape.rect[3]-simpleShape.rect[1]};
    let relCenterCoord = {x:simpleShape.center[0]-simpleShape.rect[0], y:simpleShape.center[1]-simpleShape.rect[1]};
    let edge = 1;
    return(
    <div style={{position:"absolute", left:simpleShape.rect[0], top:simpleShape.rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
        <svg width={relCornerCoord.x2+2*edge} height={relCornerCoord.y2+2*edge}>   
            <rect 
                width={relCornerCoord.x2}
                height={relCornerCoord.y2}
                x={edge}
                y={edge}
                rx={10}
                ry={10}
                fill={simpleShape.fill_color}
                strokeWidth={edge}
                stroke={simpleShape.frame_color}
            />
        </svg>
    </div>
    )
}