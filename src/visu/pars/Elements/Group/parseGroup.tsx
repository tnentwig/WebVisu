import * as React from 'react';
import * as $ from 'jquery';
import {uid} from 'react-uid';
import ComSocket from '../../../communication/comsocket'
import {useLocalStore, useObserver } from 'mobx-react-lite';
import { Button } from '../Button/button'
import { SimpleShape } from '../Basicshapes/simpleshape';
import { PolyShape } from '../Basicshapes/polyshape';
import { stringToArray } from '../../Utils/utilfunctions';
import { parseDynamicShapeParameters } from '../Features/eventManager'
import ErrorBoundary from 'react-error-boundary';

type Props = {
    section : JQuery<XMLDocument>
}

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

function createInitial(section : JQuery<XMLDocument>){
    // Create a mobx store for the variables that are dependent on the comsocket variables
    let initial = {
        display : "hidden" as any
    }

    let dynamicElements= parseDynamicShapeParameters(section);
    // Invisble?
    if (dynamicElements.has("expr-invisible")) {
        let element = dynamicElements!.get("expr-invisible");
        let returnFunc = ComSocket.singleton().evalFunction(element);
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
    } else {
        initial.display="visible"
    }
    return initial;
}

export const Group :React.FunctionComponent<Props> = React.memo(({section})=>
{   
    // Define the stores for the group component
    const [scale, setScale] = React.useState("scale(1)");
    // The visuObjects are stored in a state
    const [visuObjects, setVisuObjects] = React.useState([]);
    // The rectangluar outer points are stored
    const [rectParent, setRectParent] = React.useState(stringToArray(section.children("rect").text()));
    // The rightdown corner coordinates of the subvisu will be stored
    const [rightDownCorner, setRightDownCorner] = React.useState([0, 0]);
    // Define state modifiying functions
    const addVisuObject = (visuObject : JSX.Element) => {
        let obj = {obj: visuObject, id:uid(visuObject)};
        setVisuObjects(visuObjects =>[...visuObjects, obj]);
    }

    // The xml description of the content includes a non scaled version of the group. So we have to cale manually
    // At first we have to evaluate the maximum dimensions
    
    // Rip all <element> sections
    React.useEffect(()=>{
        let rightdowncorner = [0, 0];
        section.children("element").each(function(){
            let section = $(this);
            // Determine the type of the element
            switch(section.attr("type")) {
                case "simple":
                    addVisuObject(<SimpleShape section={section}></SimpleShape>);
                    getDimension(rightdowncorner, stringToArray(section.children("rect").text()));
                    break;
                case "polygon":
                    addVisuObject(<PolyShape section={section}></PolyShape>);
                    section.children('point').each(function(){
                    getDimension(rightdowncorner, stringToArray($(this).text()));
                    });
                    break;
                case "button":
                    addVisuObject(<Button section={section}></Button>);
                    break;
                case "group":
                    addVisuObject(<Group section={section}></Group>)
                    break;
                }
            });
            setRightDownCorner(rightdowncorner);
    }, [section])
    
    // Calculate the scalefactor
    React.useEffect(()=>{
        let setY = rectParent[3]-rectParent[1];
        let setX = rectParent[2]-rectParent[0];
        let scaleOrientation = setX/setY;
        if (scaleOrientation < (rightDownCorner[0]/rightDownCorner[1])){
            let factor = setX/rightDownCorner[0];
            let interim ="scale("+factor+")";
            setScale(interim);
        } else {
            let factor = setY/rightDownCorner[1];
            let interim ="scale("+factor+")";
            setScale(interim);
        }
    }, [rectParent, rightDownCorner]);
        
   
    // Convert object to an observable one
    const state  = useLocalStore(()=>createInitial(section));

    return useObserver(()=> state.display == "visible" ?
        <div style={{pointerEvents: "none", position:"absolute", left:rectParent[0], top:rectParent[1], width:rectParent[2]-rectParent[0], height:rectParent[3]-rectParent[1]}}>
            <ErrorBoundary>
                <div style={{transformOrigin:"left top", transform:scale}}>
                {
                    visuObjects.map((element, index)=><React.Fragment key={element.id}>{element.obj}</React.Fragment>)
                }
                </div>
            </ErrorBoundary>
        </div>
        : null
    )
})


