import * as React from 'react';
import { IBasicShape } from '../../../../Interfaces/interfaces';
import {createVisuObject} from '../../Features/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';
import ErrorBoundary from 'react-error-boundary';

type Props = {
    simpleShape: IBasicShape,
    textField : JSX.Element|undefined,
    input : JSX.Element,
    dynamicParameters : Map<string,string[][]>,
    onmousedown : Function,
    onmouseup : Function,
    onclick : Function
}

function onRenderCallback(
    id : any, // the "id" prop of the Profiler tree that has just committed
    phase : any, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration : any, // time spent rendering the committed update
    baseDuration : any, // estimated time to render the entire subtree without memoization
    startTime : any, // when React began rendering this update
    commitTime : any, // when React committed this update
    interactions : any // the Set of interactions belonging to this update
  ) {
    // Aggregate or log render timings...
    console.log("The comp "+ id + " spend " + actualDuration + " at phase "+phase);
  }

export const Roundrect :React.FunctionComponent<Props> = React.memo(({simpleShape, textField, input, dynamicParameters, onclick, onmousedown, onmouseup})=>
{
    // Convert object to an observable one
    const state  = useLocalStore(()=>createVisuObject(simpleShape, dynamicParameters));
    
    return useObserver(()=>
    <React.Profiler id="simple" onRender={onRenderCallback}>
    <div style={{cursor: "auto",overflow:"hidden", pointerEvents: state.eventType, visibility : state.display, position:"absolute", left:state.transformedCornerCoord.x1-state.edge, top:state.transformedCornerCoord.y1-state.edge, width:state.relCoord.width+2*state.edge, height:state.relCoord.height+2*state.edge}}>
        <ErrorBoundary>
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
                        rx={5}
                        ry={5}
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
        </ErrorBoundary>
    </div>
    </React.Profiler>
    )
})