import * as React from 'react';
import { uid } from 'react-uid';
import { SimpleShape } from '../pars/Elements/Basicshapes/simpleshape';
import { PolyShape } from '../pars/Elements/Basicshapes/polyshape';
import { Button } from '../pars/Elements/Button/button';
import { Piechart } from '../pars/Elements/Piechart/piechart';
import { Scrollbar } from '../pars/Elements/Scrollbar/scrollbar';
import { ArrayTable } from './Elements/Arraytable/arraytable';
import { Bitmap } from './Elements/Bitmap/bitmap';
import { Group } from './Elements/Group/group';
import { Subvisu } from '../pars/Elements/Subvisu/subvisu'

type Props = {
    visualisation: Element
}
export const VisuElements :React.FunctionComponent<Props> = React.memo(({visualisation})=>{
    let visuObjects : Array<{obj:JSX.Element, id: string}>= [];
    const addVisuObject = (visuObject : JSX.Element) => {
        let obj = {obj: visuObject, id:uid(visuObject)};
        visuObjects.push(obj)
    }
    // The effect is called if the visualisation prop change
    // Rip all <element> sections
    for (let i=0; i<visualisation.children.length; i++){
        let section = visualisation.children[i];
        if (visualisation.children[i].nodeName === "element"){
            // Determine the type of the element
            let type = section.getAttribute("type");
            switch(type) {
                // Is a simple shape like rectangle, round-rectangle, circle or line
                case "simple":
                    addVisuObject(<SimpleShape section={section}></SimpleShape>);
                    break;
                // Is a bitmap
                case "bitmap":
                    addVisuObject(<Bitmap section={section}></Bitmap>);
                    break;
                // Is a button
                case "button":
                    addVisuObject(<Button section={section}></Button>);
                    break;
                // Is a polygon - As polygon, polyline or bezier
                case "polygon":
                    addVisuObject(<PolyShape section={section}></PolyShape>)
                    break;
                // Is a piechart
                case "piechart":
                    addVisuObject(<Piechart section={section}></Piechart>)
                    break;
                // Is a group (Dynamic elements like a graph)
                case "group":
                    addVisuObject(<Group section={section}></Group>);
                    break;
                // Is a Scrollbar
                case "scrollbar":
                    addVisuObject(<Scrollbar section={section}></Scrollbar>);
                    break;
                case "reference":
                    addVisuObject(<Subvisu section={section}></Subvisu>);
                    break;
            }
        } 
    };

    return (
        <React.Fragment>
            {
                visuObjects.map((element, index)=><React.Fragment key={element.id}>{element.obj}</React.Fragment>)
            }
        </React.Fragment>
    )
})
