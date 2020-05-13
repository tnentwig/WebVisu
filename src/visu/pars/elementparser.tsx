import * as $ from 'jquery';
import * as React from 'react';
import {uid} from 'react-uid';
import { SimpleShape } from '../pars/Elements/Basicshapes/simpleshape';
import { PolyShape } from '../pars/Elements/Basicshapes/polyshape';
import { Button } from '../pars/Elements/Button/button';
import { Piechart } from '../pars/Elements/Piechart/piechart';
import { Scrollbar } from '../pars/Elements/Scrollbar/scrollbar';
import { ArrayTable } from './Elements/Arraytable/arraytable';
import { Bitmap } from './Elements/Bitmap/bitmap';
import { Group } from '../pars/Elements/Group/parseGroup';
import { Subvisu } from '../pars/Elements/Subvisu/subvisu'

type Props = {
    visualisation: XMLDocument
}
export const VisuElements :React.FunctionComponent<Props> =React.memo(({visualisation})=>{
    // The visuObjects are stored in a state
    const [visuObjects, setVisuObjects] = React.useState([]);
    // Add a visuObject to the store
    const addVisuObject = (visuObject : JSX.Element) => {
        let obj = {obj: visuObject, id:uid(visuObject)};
        setVisuObjects(visuObjects =>[...visuObjects, obj]);
    }
    // The effect is called if the visualisation prop change
    React.useEffect(()=>{
        // Rip all <element> sections
        $(visualisation).children("visualisation").children("element").each(function(){
            let section : JQuery<XMLDocument>= $(this);
            // Determine the type of the element
            switch(section.attr("type")) {
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
                default:
                    console.log("Type <"+section.attr("type")+"> is not supported yet!");
            }
        });
    },[visualisation])

    return (
        <React.Fragment>
            {
                visuObjects.map((element, index)=><React.Fragment key={element.id}>{element.obj}</React.Fragment>)
            }
        </React.Fragment>
    )
})
