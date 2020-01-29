import * as React from 'react';
import { IBasicShape } from '../../../Interfaces/interfaces';
import {createVisuObject} from '../../Features/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';

type Props = {
    simpleShape: IBasicShape,
    textField : JSX.Element|undefined,
    input : JSX.Element,
    dynamicParameters : Map<string,string[][]>,
    onmousedown : Function,
    onmouseup : Function,
    onclick : Function
}

export const Roundrect :React.FunctionComponent<Props> = ({simpleShape, textField, input, dynamicParameters, onclick, onmousedown, onmouseup})=>
{
    // Attach the dynamic paramters like color variable
    let initial = createVisuObject(simpleShape, dynamicParameters)
        
    // Convert object to an observable one
    const state  = useLocalStore(()=>initial);
    
    return useObserver(()=>
    <div style={{cursor: "auto",overflow:"hidden", pointerEvents: state.eventType, visibility : state.display, position:"absolute", left:state.transformedCornerCoord.x1-state.edge, top:state.transformedCornerCoord.y1-state.edge, width:state.relCoord.width+2*state.edge, height:state.relCoord.height+2*state.edge}}>
        {input}
        <svg style={{float: "left"}} width={state.relCoord.width+2*state.edge} height={state.relCoord.height+2*state.edge} >
            <svg 
                onClick={()=>onclick()} 
                onMouseDown={()=>onmousedown()} 
                onMouseUp={()=>onmouseup()}
                onMouseLeave={()=>onmouseup()}  // We have to reset if somebody leaves the object with pressed key
                width={state.relCoord.width+2*state.edge} 
                height={state.relCoord.height+2*state.edge} 
                strokeDasharray={state.strokeDashArray}>   
                <rect
                    width={state.relCoord.width}
                    height={state.relCoord.height}
                    x={state.edge}
                    y={state.edge}
                    rx={10}
                    ry={10}
                    fill={state.fill}
                    stroke={state.stroke}
                    strokeWidth={state.strokeWidth}
                    >
                    <title>{state.tooltip}</title>
                </rect>
                <svg>
                    {textField}
                </svg>
            </svg>
        </svg>
    </div>
    )
}