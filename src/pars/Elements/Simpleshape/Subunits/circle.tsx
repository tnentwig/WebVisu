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
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left 
    let absCornerCoord = {x1:simpleShape.rect[0],y1:simpleShape.rect[1],x2:simpleShape.rect[2],y2:simpleShape.rect[3]};
    // absCenterCoord are the coordinates of the rotation and scale center
    let absCenterCoord = {x:simpleShape.center[0], y:simpleShape.center[1]};
    // relCoord are the width and the height in relation the div
    let relCoord = {width:simpleShape.rect[2]-simpleShape.rect[0], height:simpleShape.rect[3]-simpleShape.rect[1]};
    // the relCenterCoord are the coordinates of the midpoint of the div
    let relMidpointCoord = {x:(simpleShape.rect[2]-simpleShape.rect[0])/2, y:(simpleShape.rect[3]-simpleShape.rect[1])/2};
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
        // Positional arguments
        absCornerCoord : absCornerCoord,
        absCenterCoord : absCenterCoord,
        left : 0,
        right : 0,
        top : 0,
        bottom : 0,
        xpos : 0,
        ypos : 0,
        scale : 1000,   // a scale of 1000 means a representation of 1:1
        angle : 0,
        // Computedd
        transformedCoord : absCornerCoord,
        relCoord : relCoord,
        relMidpointCoord : relMidpointCoord,
        fill : fillColor,
        edge : edge,
        stroke : simpleShape.frame_color,
        display : "visible" as any,
        alarm : false
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

    Object.defineProperty(initial, "transformedCoord", {
        get: function() {
            let x1 = initial.absCornerCoord.x1;
            let x2 = initial.absCornerCoord.x2;
            let y1 = initial.absCornerCoord.y1;
            let y2 = initial.absCornerCoord.y2;
            let xc = initial.absCenterCoord.x;
            let yc = initial.absCenterCoord.y;
            // Scaling: the vector isnt normalized
            x1 = (initial.scale/1000)*(x1-xc)+xc;
            y1 = (initial.scale/1000)*(y1-yc)+yc;
            x2 = (initial.scale/1000)*(x2-xc)+xc;
            y2 = (initial.scale/1000)*(y2-yc)+yc;
            // Rotating
            let sinphi = Math.sin(initial.angle*(2*Math.PI)/360);
            let cosphi = Math.cos(initial.angle*(2*Math.PI)/360);
            let xoff = (x1-xc)*cosphi-(y1-yc)*sinphi-(x1-xc);
            let yoff = (x1-xc)*sinphi+(y1-yc)*cosphi-(y1-yc);
            // Add the offset
            x1 += initial.xpos+ initial.left+xoff;
            x2 += initial.xpos + initial.right+xoff;
            y1 += initial.ypos + initial.top+yoff;
            y2 += initial.ypos+ initial.bottom+yoff;
            // Init the interim return object
            let coord ={x1:x1,y1:y1,x2:x2,y2:y2};

            if (x1>x2){
                coord.x1 = x2;
                coord.x2 = x1;
            }
            if (y1>y2){
                coord.y1 = y2;
                coord.y2 = y1;
            }
            return coord
        }
    });
    
    Object.defineProperty(initial, "relCoord", {
        get: function() {
            let width = initial.transformedCoord.x2-initial.transformedCoord.x1;
            let height = initial.transformedCoord.y2-initial.transformedCoord.y1;
            return {width:width,height:height}
        }
    });

    Object.defineProperty(initial, "relMidpointCoord", {
        get: function() {
            let x = initial.relCoord.width/2;
            let y = initial.relCoord.height/2;
            return {x:x,y:y}
        }
    });

    // Convert object to an observable one
    const state  = useLocalStore(()=>initial);

    return useObserver(()=>
    <div style={{visibility : state.display, position:"absolute", left:state.transformedCoord.x1, top:state.transformedCoord.y1, width:state.relCoord.width+2*state.edge, height:state.relCoord.height+2*state.edge}}>
        <svg width={state.relCoord.width+2*state.edge} height={state.relCoord.height+2*state.edge}>   
            <g>
                <ellipse
                stroke={state.stroke}
                cx={state.relMidpointCoord.x+state.edge}
                cy={state.relMidpointCoord.y+state.edge}
                rx={state.relMidpointCoord.x}
                ry={state.relMidpointCoord.y}
                fill={state.fill}
                strokeWidth={state.strokeWidth}
                />
                {textField}
            </g>
        </svg>
    </div>
    )
}

