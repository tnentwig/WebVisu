import * as React from 'react';
import { IBasicShape } from '../../../Interfaces/interfaces';
import {createVisuObject} from '../Features/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { coordArrayToBezierString } from '../../../Utils/utilfunctions'

type Props = {
    polyShape: IBasicShape,
    textField : JSX.Element|undefined,
    input : JSX.Element,
    dynamicParameters : Map<string, string>,
    onmousedown : Function,
    onmouseup : Function,
    onclick : Function
}

export const Bezier :React.FunctionComponent<Props> = ({polyShape, textField, input, dynamicParameters, onclick, onmousedown, onmouseup})=> 
{
    // Attach the dynamic paramters like color variable
    let initial = createVisuObject(polyShape, dynamicParameters)
    
    // Convert object to an observable one
    const state  = useLocalStore(()=>initial);

    return useObserver(()=>
    <div style={{cursor: "auto", pointerEvents: state.eventType, visibility : state.display, position:"absolute", left:state.absCornerCoord.x1-state.edge, top:state.absCornerCoord.y1-state.edge, width:state.absCornerCoord.x2-state.absCornerCoord.x1+state.edge, height:state.absCornerCoord.y1-state.absCornerCoord.y2+state.edge}}>
        {input}
        <svg 
            onClick={()=>onclick()} 
            onMouseDown={()=>onmousedown()} 
            onMouseUp={()=>onmouseup()}
            onMouseLeave={()=>onmouseup()}  // We have to reset if somebody leaves the object with pressed key
            width={state.absCornerCoord.x2-state.absCornerCoord.x1+2*state.edge} 
            height={state.absCornerCoord.y2-state.absCornerCoord.y1+2*state.edge} 
            strokeDasharray={state.strokeDashArray}>   
            <g>
            <path 
                d={coordArrayToBezierString(state.points, state.absCornerCoord.x1, state.absCornerCoord.y1)}
                fill={state.fill}
                strokeWidth={state.strokeWidth}
                stroke={state.stroke}
                />
                <title>{state.tooltip}</title>
                {textField}
            </g>

        </svg>
    </div>
    )
}

