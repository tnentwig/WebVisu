import * as React from 'react';
import { ISimpleShape } from '../../../Interfaces/interfaces';
import ComSocket from '../../../../com/comsocket';
import * as util from '../../../Utils/utilfunctions';
import {useObserver, useObservable, } from 'mobx-react-lite';

type Props = {
    simpleShape: ISimpleShape,
    textField : JSX.Element|undefined,
    reactions : Map<string, string>
}

export const Circle :React.FunctionComponent<Props> = ({simpleShape, textField, reactions})=> 
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
    
    // Create an object with the initial parameters
    let initial  = {
        absCornerCoord : {x1:simpleShape.rect[0],y1:simpleShape.rect[1],x2:simpleShape.rect[3],y2:simpleShape.rect[4]},
        relCornerCoord : relCornerCoord,
        relCenterCoord : relCenterCoord,
        edge : (simpleShape.line_width === 0) ? 1 :simpleShape.line_width,
        cx : relCenterCoord.x+edge,
        cy : relCenterCoord.y+edge,
        rx : relCornerCoord.x2/2,
        ry : relCornerCoord.y2/2,
        normalColor : simpleShape.fill_color,
        alarmColor : simpleShape.fill_color_alarm,
        fill : fillColor,
        strokeWidth : (simpleShape.has_frame_color) ? edge : 0,
        stroke : simpleShape.frame_color,
        display : "true",
        alarm : false
    }
    // Processing the variables for visual elements
    // 1) Set alarm state
    if (typeof(reactions.has("expr-toggle-color"))) {
        let reaction = reactions!.get("expr-toggle-color");
        Object.defineProperty(initial, "fill", {
            get: function() {
                return ComSocket.singleton().oVisuVariables.get(reaction)!.value==="0" ? initial.normalColor : initial.alarmColor;
            }
        });
    }
       // 2) Set invisible state
       if (typeof(reactions.has("expr-invisible"))) {
        let reaction = reactions!.get("expr-toggle-color");
        Object.defineProperty(initial, "display", {
            get: function() {
                return ComSocket.singleton().oVisuVariables.get(reaction)!.value==="0" ? "true" : false;
            }
        });
    }
    // Convert object to an observable one
    const state = useObservable(initial);

    return useObserver(()=>
    <div style={{display : state.display, position:"absolute", left:state.absCornerCoord.x1, top:simpleShape.rect[1], width:relCornerCoord.x2+2*edge, height:relCornerCoord.y2+2*edge}}>
        <svg width={relCornerCoord.x2+2*edge} height={relCornerCoord.y2+2*edge}>   
            <g>
                <ellipse
                cx={state.relCenterCoord.x+edge}
                cy={state.relCenterCoord.y+edge}
                rx={state.relCornerCoord.x2/2}
                ry={state.relCornerCoord.y2/2}
                fill={state.fill}
                strokeWidth={state.strokeWidth}
                stroke={state.stroke}
                />
                {textField}
            </g>
        </svg>
    </div>
    )
}

