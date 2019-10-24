import * as React from 'react';
import { ISimpleShape } from '../../../Interfaces/interfaces';
import {attachDynamicParameters} from '../Features/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { IVisuObject } from '../Features/interfaces';

type Props = {
    simpleShape: ISimpleShape,
    textField : JSX.Element|undefined,
    dynamicParameters : Map<string, string>
}

export const Circle :React.FunctionComponent<Props> = ({simpleShape, textField, dynamicParameters})=> 
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
    let initial  : IVisuObject= {
        // Variables will be initialised with the parameter values 
        normalFillColor : simpleShape.fill_color,
        alarmFillColor : simpleShape.fill_color_alarm,
        normalFrameColor : simpleShape.frame_color,
        alarmFrameColor : simpleShape.frame_color_alarm,
        hasFillColor : simpleShape.has_inside_color,
        hasFrameColor : simpleShape.has_frame_color,
        strokeWidth : strokeWidth,

        absCornerCoord : {x1:simpleShape.rect[0],y1:simpleShape.rect[1],x2:simpleShape.rect[3],y2:simpleShape.rect[4]},
        edge : edge,
        display : "visible" as any,
        alarm : false,
        // Computed
        relCornerCoord : relCornerCoord,
        relCenterCoord : relCenterCoord,
        fill : fillColor,
        stroke : simpleShape.frame_color
    }
    // Attach the dynamic paramters like color variable
    initial = attachDynamicParameters(initial, dynamicParameters)

    Object.defineProperty(initial, "fill", {
        get: function() {
            if (initial.alarm === false){
                if (initial.hasFillColor){
                    return "none";
                } else {
                    return initial.normalFillColor;
                }
            } else {
                return initial.alarmFillColor;
            }
        }
    });

    Object.defineProperty(initial, "stroke", {
        get: function() {
            if (initial.alarm === false){
                if (initial.hasFrameColor){
                    return initial.normalFrameColor;
                } else {
                    return "none";
                }
            } else {
                return initial.alarmFrameColor;
            }
        }
    });

    Object.defineProperty(initial, "edge", {
        get: function() {
            if (initial.hasFrameColor || initial.alarm){
                if (initial.strokeWidth === 0){
                    return 1;
                } else {
                    return initial.strokeWidth;
                }
            } else {
                return 0;
            }
        }
    });

    
    // Convert object to an observable one
    const state  = useLocalStore(()=>initial);

    return useObserver(()=>
    <div style={{visibility : state.display, position:"absolute", left:state.absCornerCoord.x1, top:state.absCornerCoord.y1, width:state.relCornerCoord.x2+2*state.edge, height:state.relCornerCoord.y2+2*state.edge}}>
        <svg width={state.relCornerCoord.x2+2*state.edge} height={state.relCornerCoord.y2+2*state.edge}>   
            <g>
                <ellipse
                stroke={state.stroke}
                cx={state.relCenterCoord.x+state.edge}
                cy={state.relCenterCoord.y+state.edge}
                rx={state.relCornerCoord.x2/2}
                ry={state.relCornerCoord.y2/2}
                fill={state.fill}
                strokeWidth={state.strokeWidth}
                />
                {textField}
            </g>
        </svg>
    </div>
    )
}

