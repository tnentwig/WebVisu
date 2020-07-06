import * as React from 'react';
import { HorizontalScrollbar } from './horizontal';
import { VerticalScrollbar } from './vertical';
import { IScrollbarShape } from '../../../Interfaces/javainterfaces';
import * as util from '../../Utils/utilfunctions';
import { parseDynamicShapeParameters, parseScrollUpdate } from '../Features/Events/eventManager';

type Props = {
    section : Element
}

export const Scrollbar :React.FunctionComponent<Props> = ({section})=>
{
    let rect = util.stringToArray(section.getElementsByTagName("rect")[0].innerHTML);
    let horz_position : boolean = (((rect[1]-rect[0])>(rect[3]-rect[2])) ? true : false);
    // Parsing of the fixed parameters
    let scrollbar : IScrollbarShape = {
        shape : "scrollbar",
        rect : rect,
        horz_position : horz_position,
        tooltip : section.getElementsByTagName("tooltip").length>0? section.getElementsByTagName("tooltip")[0].innerHTML : "",
    }
    
    // Parsing of observable events
    let dynamicShapeParameters = parseDynamicShapeParameters(section);
    // Parse the scroll update function
    let update = parseScrollUpdate(section);
    // Return of the react node
    if (horz_position){
        return(<HorizontalScrollbar shape={scrollbar} dynamicParameters={dynamicShapeParameters} updateFunction={update}></HorizontalScrollbar>)
    } else {
        return(<VerticalScrollbar shape={scrollbar} dynamicParameters={dynamicShapeParameters} updateFunction={update}></VerticalScrollbar>)
    }
}
