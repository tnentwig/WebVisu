import * as React from 'react';
import * as $ from 'jquery';
import {useObserver } from 'mobx-react-lite';
import {stringToArray } from '../../Utils/utilfunctions';
import {Visualisation} from '../../../visuparser'

type Props = {
    section : JQuery<XMLDocument>
}

export const Subvisu :React.FunctionComponent<Props> = ({section})=>
{
    // Parsing of the fixed parameters
    let rect = stringToArray(section.children("rect").text());
    let width = rect[2]-rect[0];
    let name = section.children("name").text();
    let tooltip = (section.children("tooltip").text()).length>0? section.children("tooltip").text() : ""
    // Auxiliary values
    let relCornerCoord = {x1:0, y1:0, x2:rect[2]-rect[0], y2:rect[3]-rect[1]};
    // Parsing of the placeholder variables
    let placeholders : Map<string,string> = new Map();
    section.children("placeholderentry").each(function (){
        let variable = $(this);
        let placeholder = variable.attr("placeholder");
        let replacement = variable.attr("replacement");
        placeholders.set(placeholder.toLowerCase(), replacement.toLowerCase())
    })

    // Return of the react node
    return useObserver(()=>
        <div title={name} style={{position:"absolute", left:rect[0], top:rect[1], width:relCornerCoord.x2, height:relCornerCoord.y2}}>
            <Visualisation visuname={name.toLowerCase()} mainVisu={false} replacementSet={placeholders} width={width}></Visualisation>
        </div>
    )
}