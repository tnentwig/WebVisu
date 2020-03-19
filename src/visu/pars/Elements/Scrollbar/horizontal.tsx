import * as React from 'react';
import {useObserver, useLocalStore } from 'mobx-react-lite';
import {stringToArray } from '../../Utils/utilfunctions';
import {parseScrollbarParameters, updateScrollvalue} from '../Scrollbar/eventParser'
import ComSocket from '../../../communication/comsocket';


type Props = {
    section : JQuery<XMLDocument>
}

export const HorizontalScrollbar :React.FunctionComponent<Props> = ({section})=>
{
   let rect = stringToArray(section.children("rect").text());
   // Auxiliary values
   let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};

   let initial ={
       lowerBound : 0,
       upperBound : 0,
       value : 0,
       display : "visible"
   }

   let dynamicElements = parseScrollbarParameters(section);
   let updateFunction = updateScrollvalue(section);

   if (dynamicElements.has("expr-lower-bound")){
       let element = dynamicElements!.get("expr-lower-bound");
       if (element.type==="var"){
           Object.defineProperty(initial, "lowerBound", {
               get: function() {
                   return Number(ComSocket.singleton().oVisuVariables.get(element.value)!.value);
                   }
           });
       } else if (element.type==="const"){
           initial.lowerBound= Number(element.value);
       }
   }
   if (dynamicElements.has("expr-upper-bound")){
       let element = dynamicElements!.get("expr-upper-bound");
       if (element.type==="var"){
           Object.defineProperty(initial, "upperBound", {
               get: function() {
                   return Number(ComSocket.singleton().oVisuVariables.get(element.value)!.value);
                   }
           });
       } else if (element.type==="const"){
           initial.upperBound= Number(element.value);
       }
   }
   if (dynamicElements.has("expr-invisible")){
       let element = dynamicElements!.get("expr-invisible");
       if (element.type==="var"){
           Object.defineProperty(initial, "display", {
               get: function() {
                   let value = ComSocket.singleton().oVisuVariables.get(element.value)!.value;
                   if (value == "0"){
                       return "visible";
                   } else {
                       return "none";
                   }
               }
           });
       } else if (element.type==="const"){
           let value;
           if (element.value === "0"){
               value = "visible";
           } else {
              value = "none";
           }
           initial.display =value;
       }
   }    
   if (dynamicElements.has("expr-tooltip-display")){
       let element = dynamicElements!.get("expr-tooltip-display");
       if (element.type==="var"){
           Object.defineProperty(initial, "tooltip", {
               get: function() {
                   return ComSocket.singleton().oVisuVariables.get(element.value)!.value;
                   }
           });
       }
   }

   if (dynamicElements.has("expr-tap-var")){
       let element = dynamicElements!.get("expr-tap-var");
       if (element.type==="const"){
           initial.value= Number(element.value);
       }
       else if (element.type==="var"){
           Object.defineProperty(initial, "value", {
               get: function() {
                   return Number(ComSocket.singleton().oVisuVariables.get(element.value)!.value);
                   }

           });
       }
   }


   const handleSliderChange = (event : React.ChangeEvent<HTMLInputElement>) => {
       updateFunction(event.target.value);
   };

   const increment = ()=>{
       if (initial.value < initial.upperBound){
           updateFunction(initial.value+1)
       }
   }

   const decrement = ()=>{
       if (initial.value > initial.lowerBound){
           updateFunction(initial.value-1)
       }
   }

   function throttled(delay : number, fn : Function) {
       let lastCall = 0;
       return function (...args : any[]) {
           const now = (new Date).getTime();
           if (now - lastCall < delay) {
           return;
           }
           lastCall = now;
           return fn(...args);
       }
   }
   const tHandleSliderChange = throttled(10, handleSliderChange);

   const state  = useLocalStore(()=>initial);

   // Return of the react node
   return useObserver(()=>
       <div style={{position:"absolute", left:0, width:relCornerCoord.x2, height:relCornerCoord.y2}}>
    
           <svg style ={{
               height: relCornerCoord.y2, 
               width: relCornerCoord.y2,  
               position :"absolute", 
               left : 0}}>
               <rect width={relCornerCoord.y2} height={relCornerCoord.y2} style={{fill:"grey", stroke:"darkgrey"}} onClick={decrement}  />
           </svg>
           
           <svg  style ={{
               height: relCornerCoord.y2, 
               width: relCornerCoord.y2,
               left : relCornerCoord.y2,
               position :"absolute"
               }}>
               <rect width={relCornerCoord.x2 - 2*relCornerCoord.y2+1} height={relCornerCoord.y2} style={{fill:"grey",stroke:"darkgrey"}}  />
           </svg>
           
           <svg style ={{
               height: relCornerCoord.y2, 
               width: relCornerCoord.y2,  
               position :"absolute",
               right : 0}}>
               <rect width={relCornerCoord.y2} height={relCornerCoord.y2} style={{fill:"grey",stroke:"darkgrey"}} onClick={increment}  />
           </svg>
       </div>
   )
}