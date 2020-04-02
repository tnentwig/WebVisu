import * as React from 'react';
import * as $ from 'jquery';
import {uid} from 'react-uid';
import ComSocket from '../../../communication/comsocket'
import {useLocalStore } from 'mobx-react-lite';
import { Button } from '../Button/button'
import { parseSimpleShape } from '../Basicshapes/simpleshape';
import { parsePolyshape } from '../Basicshapes/polyshape';
import { stringToArray, evalRPN  } from '../../Utils/utilfunctions';
import { parseDynamicShapeParameters } from '../Features/eventManager'
import ErrorBoundary from 'react-error-boundary';

type Props = {
    section : JQuery<XMLDocument>
}

export const Group :React.FunctionComponent<Props> = ({section})=>
{   
    let rectParent = stringToArray(section.children("rect").text());
    let elemId = section.children("elem-id").text();
    let elemIdTransform = elemId + "trans;"

    let dynamicElements= parseDynamicShapeParameters(section);

    let initial = {
        display : "visible" as any
    }
    // The xml description of the content includes a non scaled version of the group. So we have to cale manually
    // At first we have to evaluate the maximum dimensions
    let rightdownCorner = [0, 0];
    function getDimension(actualDimension: Array<number>, newRect: Array<number>) {
        let len = newRect.length;
        if (len === 4){
            (actualDimension[0]<newRect[2])?(actualDimension[0]=newRect[2]):(newRect[0]=newRect[0]);
            (actualDimension[1]<newRect[3])?(actualDimension[1]=newRect[3]):(newRect[1]=newRect[1]);
        } else if (len===2){
            for (let i=0; i<2; i++){
                (actualDimension[i]<newRect[i])?(actualDimension[i]=newRect[0]):(newRect[0]=newRect[0]);
            }
        }
    }
    
    let visuObjects: Array<(JSX.Element | undefined | null)> =[];
    
    // Rip all <element> sections
    section.children("element").each(function(){
        let section = $(this);
        // Determine the type of the element
        switch(section.attr("type")) {
            case "simple":
                visuObjects.push(parseSimpleShape(section));
                getDimension(rightdownCorner, stringToArray(section.children("rect").text()));
                break;
            case "polygon":
                visuObjects.push(parsePolyshape(section));
                section.children('point').each(function(){
                getDimension(rightdownCorner, stringToArray($(this).text()));
                });
                break;
            case "button":
                visuObjects.push(<Button section={section}></Button>)
            }
        });

        // Invisble?
        if (dynamicElements.has("expr-invisible")) {
            let element = dynamicElements!.get("expr-invisible");
            let returnFunc = evalFunction(element);
            let wrapperFunc = ()=>{
                let value = returnFunc();
                if (value!== undefined){
                    if (value == 0){
                        return "visible";
                    } else {
                        return "hidden";
                    }
                }
            }
            Object.defineProperty(initial, "display", {
                get: ()=>wrapperFunc()
            });
        }

        const [scale, setScale] = React.useState("scale(1)");
        // Calculate the scalefactor
        React.useEffect(()=>{
            let setY = rectParent[3]-rectParent[1];
            let setX = rectParent[2]-rectParent[0];
            let scaleOrientation = setX/setY;
            if (scaleOrientation < (rightdownCorner[0]/rightdownCorner[1])){
                let factor = setX/rightdownCorner[0];
                let interim ="scale("+factor+")";
                setScale(interim);
            } else {
                let factor = setY/rightdownCorner[1];
                let interim ="scale("+factor+")";
                setScale(interim);
            }
        }, [rectParent, rightdownCorner]);
        
            // Convert object to an observable one
            const state  = useLocalStore(()=>initial);

        return ( state.display !== "visible" ? null :
            <div style={{visibility : state.display, overflow:"hidden", position:"absolute", left:rectParent[0], top:rectParent[1], width:rectParent[2]-rectParent[0], height:rectParent[3]-rectParent[1]}}>
                <ErrorBoundary>
                <div style={{transformOrigin:"left top", transform:scale}}>
                {
                    visuObjects.map((element, index)=><React.Fragment key={uid(element)}>{element}</React.Fragment>)
                }
                </div>
                </ErrorBoundary>
             </div>
        )
    }



    function evalFunction(stack: string[][]) : Function {
        var returnFunc = function () {
            let interim = "";
            for(let position = 0; position<stack.length; position++){
                let value = stack[position][1];
                switch(stack[position][0]){
                    case "var":
                        if(ComSocket.singleton().oVisuVariables.has(value)){
                            let varContent = ComSocket.singleton().oVisuVariables.get(value)!.value;                  
                            interim += varContent + " ";
                        } else{
                            interim += 0 + " ";
                        }
    
                        break;
                    case "const":
                        interim += value + " ";
                        break;
                    case "op":
                        interim += value + " ";
                        break;
                }
            }
            return evalRPN(interim);
        }
        return returnFunc;
    }