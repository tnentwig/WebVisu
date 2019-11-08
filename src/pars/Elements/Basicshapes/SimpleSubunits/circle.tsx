import * as React from 'react';
import { IBasicShape } from '../../../Interfaces/interfaces';
import {createVisuObject} from '../Features/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { IVisuObject } from '../Features/interfaces';

type Props = {
    simpleShape: IBasicShape,
    textField : JSX.Element|undefined,
    input : JSX.Element,
    dynamicParameters : Map<string, string>,
    onmousedown : Function,
    onmouseup : Function,
    onclick : Function
}

export const Circle :React.FunctionComponent<Props> = ({simpleShape, textField, input, dynamicParameters, onclick, onmousedown, onmouseup})=> 
{
    // Attach the dynamic paramters like color variable
    let initial = createVisuObject(simpleShape, dynamicParameters)
    
    // Convert object to an observable one
    const state  = useLocalStore(()=>initial);

    return useObserver(()=>
    <div style={{cursor: "auto", pointerEvents: state.eventType, visibility : state.display, position:"absolute", left:state.transformedCornerCoord.x1-state.edge, top:state.transformedCornerCoord.y1-state.edge, width:state.relCoord.width+state.edge, height:state.relCoord.height+state.edge}}>
        {input}
        <svg 
            onClick={()=>onclick()} 
            onMouseDown={()=>onmousedown()} 
            onMouseUp={()=>onmouseup()}
            onMouseLeave={()=>onmouseup()}  // We have to reset if somebody leaves the object with pressed key
            width={state.relCoord.width+2*state.edge} 
            height={state.relCoord.height+2*state.edge} 
            strokeDasharray={state.strokeDashArray}>   
            <g>
                <ellipse
                stroke={state.stroke}
                cx={state.relMidpointCoord.x+state.edge}
                cy={state.relMidpointCoord.y+state.edge}
                rx={state.relMidpointCoord.x}
                ry={state.relMidpointCoord.y}
                fill={state.fill}
                strokeWidth={state.strokeWidth}
                >
                <title>{state.tooltip}</title>
                </ellipse>
                {textField}
            </g>

        </svg>
    </div>
    )
}

