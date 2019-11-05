import * as React from 'react';
import { IBasicShape } from '../../../Interfaces/interfaces';
import {createVisuObject} from '../Features/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { coordArrayToString } from '../../../Utils/utilfunctions'

type Props = {
    polyShape: IBasicShape,
    textField : JSX.Element|undefined,
    input : JSX.Element,
    dynamicParameters : Map<string, string>,
    onmousedown : Function,
    onmouseup : Function,
    onclick : Function
}

export const Polygon :React.FunctionComponent<Props> = ({polyShape, textField, input, dynamicParameters, onclick, onmousedown, onmouseup})=> 
{
    // Attach the dynamic paramters like color variable
    let initial = createVisuObject(polyShape, dynamicParameters)
    
    // Convert object to an observable one
    const state  = useLocalStore(()=>initial);

    return useObserver(()=>
    <div style={{cursor: "auto", pointerEvents: state.eventType, visibility : state.display, position:"absolute", left:state.transformedCoord.x1-state.edge, top:state.transformedCoord.y1-state.edge, width:state.relCoord.width+state.edge, height:state.relCoord.height+state.edge}}>
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
            <polygon
                points={coordArrayToString(state.points, state.relCoord.width-state.edge, state.relCoord.height-state.edge)}
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
