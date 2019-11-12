import * as React from 'react';
import * as $ from 'jquery';
import { parseSimpleShape } from '../Basicshapes/simpleshape';
import { parsePolyshape } from '../Basicshapes/polyshape';
import { stringToArray } from '../../Utils/utilfunctions';


type Props = {
    section : JQuery<XMLDocument>
}

export const Group :React.FunctionComponent<Props> = ({section})=>
{   
    let rectParent = stringToArray(section.children("rect").text());
    let elemId = section.children("elem-id").text();
    let elemIdTransform = elemId + "trans;"

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
            }
        });

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
        
        return (
            <div id={elemId} style={{overflow:"hidden", position:"absolute", left:rectParent[0], top:rectParent[1], width:rectParent[2]-rectParent[0], height:rectParent[3]-rectParent[1]}}>
                <div id={elemIdTransform} style={{transformOrigin:"left top", transform:scale}}>
                {
                    visuObjects.map((element, index)=><React.Fragment>{element}</React.Fragment>)
                }
                </div>
             </div>
        )
    }