import * as React from 'react';
import {HorizontalScrollbar} from './horizontal';
import * as util from '../../Utils/utilfunctions';
import {useObserver} from 'mobx-react-lite';

type Props = {
    section : Element
}

export const Scrollbar :React.FunctionComponent<Props> = ({section})=>
{
    // Parsing of the fixed parameters
    let rect = util.stringToArray(section.getElementsByTagName("rect")[0].innerHTML)
    // Compute the orientation of the slider
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    let horzOrientation : boolean = ((relCornerCoord.x2>relCornerCoord.y2) ? true : false);

    // Return of the react node
    return useObserver(()=>
        <div style={{position:"absolute", left:rect[0], top:rect[1], width:rect[2]-rect[0], height:rect[3]-rect[1], backgroundColor: "lightgrey"}}>
            {horzOrientation ? <HorizontalScrollbar section={section}></HorizontalScrollbar> : null}
        </div>
    )
}