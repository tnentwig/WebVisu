import * as React from 'react';
import { ISimpleShape } from '../../../Interfaces/interfaces';
import ComSocket from '../../../../com/comsocket';
import {useObserver, useComputed} from 'mobx-react-lite';

type Props = {
    simpleShape: ISimpleShape,
    textField : JSX.Element|undefined,
}

export const Circle :React.FunctionComponent<Props> = ({simpleShape, textField})=> 
{
    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:simpleShape.rect[2]-simpleShape.rect[0], y2:simpleShape.rect[3]-simpleShape.rect[1]};
    let relCenterCoord = {x:simpleShape.center[0]-simpleShape.rect[0], y:simpleShape.center[1]-simpleShape.rect[1]};
    // The line_width is 0 in the xml if border width is 1 in the codesys dev env. Otherwise line_width is equal to the target border width. Very strange.
    let edge = (simpleShape.line_width === 0) ? 1 :simpleShape.line_width ;
    // Compute the strokeWidth through has_frame_color
    let strokeWidth = (simpleShape.has_frame_color) ? edge : 0;
    // Compute the fill color through has_fill_color
    let fillColor = (simpleShape.has_inside_color) ? simpleShape.fill_color : 'none';
    // A 'circle' can be a circle or an ellipse.

    // We have to decide if an alarm was toggled

    return useObserver(()=>
    <div style={{position:"absolute", left:simpleShape.rect[0], top:simpleShape.rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
        <svg width={relCornerCoord.x2+2*edge} height={relCornerCoord.y2+2*edge}>   
            <g>
                <ellipse
                cx={relCenterCoord.x+edge}
                cy={relCenterCoord.y+edge}
                rx={relCornerCoord.x2/2}
                ry={relCornerCoord.y2/2}
                fill={ComSocket.singleton().oVisuVariables.get(".xTest2")!.value==="0" ? fillColor : simpleShape.fill_color_alarm}
                strokeWidth={strokeWidth}
                stroke={simpleShape.frame_color}
                />
                {textField}
            </g>
        </svg>
    </div>
    )
}

