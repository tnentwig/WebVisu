import * as $ from 'jquery';
import * as React from 'react';
import {uid} from 'react-uid';
import { parseSimpleShape } from '../pars/Elements/Basicshapes/simpleshape';
import { parsePolyshape } from '../pars/Elements/Basicshapes/polyshape';
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
export const VisuElements :React.FunctionComponent<Props> =({visualisation})=>{
        
    let visuObjects: Array<(JSX.Element | undefined | null)> =[];
    // Rip all <element> sections
    $(visualisation).children("visualisation").children("element").each(function(){
        let section : JQuery<XMLDocument>= $(this);
        // Determine the type of the element
        switch(section.attr("type")) {
            // Is a simple shape like rectangle, round-rectangle, circle or line
            case "simple":
                visuObjects.push(parseSimpleShape(section));
                break;
            // Is a bitmap
            case "bitmap":
                visuObjects.push(<Bitmap section={section}></Bitmap>);
                break;
            // Is a button
            case "button":
                visuObjects.push(<Button section={section}></Button>);
                break;
            // Is a polygon - As polygon, polyline or bezier
            case "polygon":
                visuObjects.push(parsePolyshape(section))
                break;
            // Is a piechart
            case "piechart":
                visuObjects.push(<Piechart section={section}></Piechart>)
                break;
            // Is a group (Dynamic elements like a graph)
            case "group":
                visuObjects.push(<Group section={section}></Group>);
                break;
            // Is a Scrollbar
            case "scrollbar":
                visuObjects.push(<Scrollbar section={section}></Scrollbar>);
                break;
            case "reference":
                visuObjects.push(<Subvisu section={section}></Subvisu>);
                break;
            default:
                console.log("Type <"+section.attr("type")+"> is not supported yet!");
        }
    });
    
    return (
        <React.Fragment>
            {
                visuObjects.map((element, index)=><React.Fragment key={uid(element)}>{element}</React.Fragment>)
            }
        </React.Fragment>
    )
}
