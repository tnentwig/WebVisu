import * as React from 'react';
import {HorizontalScrollbar} from './horizontal';
import {stringToArray } from '../../Utils/utilfunctions';
import {useObserver} from 'mobx-react-lite';

type Props = {
    section : JQuery<XMLDocument>
}

export const Scrollbar :React.FunctionComponent<Props> = ({section})=>
{
    // Parsing of the fixed parameters
    let elem_id = section.children("elem-id").text();
    let rect = stringToArray(section.children("rect").text());
    // Compute the orientation of the slider
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    let horzOrientation : boolean = ((relCornerCoord.x2>relCornerCoord.y2) ? true : false);
    let tooltip = (section.children("tooltip").text()).length>0? section.children("tooltip").text() : ""

    // Return of the react node
    return useObserver(()=>
        <div title={tooltip} style={{position:"absolute", left:rect[0], top:rect[1], width:rect[2]-rect[0], height:rect[3]-rect[1], backgroundColor: "lightgrey"}}>
            {horzOrientation ? <HorizontalScrollbar section={section}></HorizontalScrollbar> : null}
        </div>
    )
}