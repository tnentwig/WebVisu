import * as React from 'react';
import * as $ from 'jquery';
import {useObserver } from 'mobx-react-lite';
import {stringToArray } from '../../Utils/utilfunctions';
import {Visualisation} from '../../../visuparser'

type Props = {
    section : JQuery<XMLDocument>
}

function getPlaceholders(section : JQuery<XMLDocument>){
    let placeholders : Map<string,string> = new Map();
    section.children("placeholderentry").each(function (){
        let variable = $(this);
        let placeholder = variable.attr("placeholder");
        let replacement = variable.attr("replacement");
        placeholders.set(placeholder.toLowerCase(), replacement.toLowerCase())
    })
    return placeholders;
}

export const Subvisu :React.FunctionComponent<Props> = ({section})=>
{
    const [visuname, setVisuname] = React.useState(section.children("name").text().toLowerCase());
    const [rect, setRect] = React.useState(stringToArray(section.children("rect").text()));
    const [placeholders, setPlaceholders] = React.useState(getPlaceholders(section));
   
    // Return of the react node
    return useObserver(()=>
        <div title={name} style={{position:"absolute", left:rect[0], top:rect[1], width:rect[2]-rect[0], height:rect[3]-rect[1]}}>
            <Visualisation visuname={visuname} mainVisu={false} replacementSet={placeholders} width={rect[2]-rect[0]}></Visualisation>
        </div>
    )
}