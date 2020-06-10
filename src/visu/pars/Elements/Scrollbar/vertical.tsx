import * as React from 'react';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { IScrollbarShape } from '../../../Interfaces/javainterfaces';
import {createVisuObject} from '../../Objectmanagement/objectManager';

type Props = {
    shape: IScrollbarShape,
    dynamicParameters : Map<string,string[][]>,
    updateFunction : Function,
}

export const VerticalScrollbar :React.FunctionComponent<Props> = ({shape, dynamicParameters, updateFunction})=>
{

   // Convert object to an observable one
    const state  = useLocalStore(()=>createVisuObject(shape, dynamicParameters));

    let centerx = state.a/2;
    let centery = state.b1/2;

    let path1 = ""+centerx+","+0.4*centery+" "+1.6*centerx+","+1.6*centery+" "+0.4*centerx+","+1.6*centery;
    let path2 = ""+0.4*centerx+","+0.4*centery+" "+1.6*centerx+","+0.4*centery+" "+centerx+","+1.6*centery;

   const handleSliderChange = (event : React.ChangeEvent<HTMLInputElement>) => {
       updateFunction(event.target.value);
   };

   const increment = ()=>{
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
    <div style={{position:"absolute", left:state.absCornerCoord.x1, top:state.absCornerCoord.y1, width:state.relCoord.width, height:state.relCoord.height, backgroundColor: "#e6e6e6"}}>
    
           <svg 
            onClick={decrement}
            cursor={"pointer"}
            style ={{
               height: state.b1, 
               width: state.a,  
               position :"absolute", 
               top : 0}}>
                <rect width={state.a} height={state.b1} style={{fill:"#d4d0c8", stroke:"darkgrey"}}  />
                <polygon points={path1}/>
           </svg>
           
           <svg 
            cursor={"pointer"}
            style ={{
               height: state.b2, 
               width: state.a,
               top : state.b1+state.scrollvalue,
               position :"absolute"
               }}>
               <rect width={state.a} height={state.b2} style={{fill:"#d4d0c8",stroke:"darkgrey"} } onMouseDown={()=>console.log("gi")} />
           </svg>
           
           <svg
            cursor={"pointer"}
            onClick={increment}
            style ={{
               height: state.b1, 
               width: state.a,  
               position :"absolute",
               bottom : 0}}>
                <rect width={state.a} height={state.b1} style={{fill:"#d4d0c8",stroke:"darkgrey"}}   />
                <polygon points={path2}/>
           </svg>
       </div>
   )

}