import * as React from 'react';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { IScrollbarShape } from '../../../Interfaces/javainterfaces';
import {createVisuObject} from '../../Objectmanagement/objectManager';

type Props = {
    shape: IScrollbarShape,
    dynamicParameters : Map<string,string[][]>,
    updateFunction : Function,
}

export const HorizontalScrollbar :React.FunctionComponent<Props> = ({shape, dynamicParameters, updateFunction})=>
{

   // Convert object to an observable one
    const state  = useLocalStore(()=>createVisuObject(shape, dynamicParameters));

    let centerx = state.relCornerCoord.y2/2;
    let centery = state.relCornerCoord.y2/2;

    let path1 = ""+0.4*centerx+","+centery+" "+1.6*centerx+","+0.4*centery+" "+1.6*centerx+","+1.6*centery;
    let path2 = ""+1.6*centerx+","+centery+" "+0.4*centerx+","+1.6*centery+" "+0.4*centerx+","+0.4*centery;

   const handleSliderChange = (event : React.ChangeEvent<HTMLInputElement>) => {
       updateFunction(event.target.value);
   };

   const increment = ()=>{
       console.log(state.value)
       if (state.value < state.upperBound){
           updateFunction(state.value+1)
       }
   }

   const decrement = ()=>{
       if (state.value > state.lowerBound){
           updateFunction(state.value-1)
       }
   }
   


   // Return of the react node
   return useObserver(()=>
    <div style={{position:"absolute", left:state.absCornerCoord.x1, top:state.absCornerCoord.y1, width:state.relCoord.width, height:state.relCoord.height, backgroundColor: "#f4f6f6"}}>
    
           <svg 
            onClick={decrement} 
            style ={{
               height: state.relCornerCoord.y2, 
               width: state.relCornerCoord.y2,  
               position :"absolute", 
               left : 0}}>
                <rect width={state.relCornerCoord.y2} height={state.relCornerCoord.y2} style={{fill:"#DCDCDC", stroke:"darkgrey"}}  />
                <polygon points={path1}/>
           </svg>
           
           <svg style ={{
               height: state.relCornerCoord.y2, 
               width: state.relCornerCoord.y2,
               left : state.relCornerCoord.y2+state.value,
               position :"absolute"
               }}>
               <rect width={state.relCornerCoord.x2 - 2*state.relCornerCoord.y2+1} height={state.relCornerCoord.y2} style={{fill:"#DCDCDC",stroke:"darkgrey"} } onMouseDown={()=>console.log("gi")} />
           </svg>
           
           <svg
            onClick={increment}
            style ={{
               height: state.relCornerCoord.y2, 
               width: state.relCornerCoord.y2,  
               position :"absolute",
               right : 0}}>
                <rect width={state.relCornerCoord.y2} height={state.relCornerCoord.y2} style={{fill:"#DCDCDC",stroke:"darkgrey"}}   />
                <polygon points={path2} pointerEvents={"visiblePoint"}/>
           </svg>
       </div>
   )

}