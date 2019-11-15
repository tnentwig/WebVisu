import * as $ from 'jquery';
import * as React from 'react';
import { VisuElements } from './pars/elementparser'
import { stringToArray } from './pars/Utils/utilfunctions'

type Props = {
    visualisation : XMLDocument
}

export const Visualisation :React.FunctionComponent<Props> = ({visualisation})=> {
    let thisXML=$(visualisation);
    
    let name = thisXML.children("visualisation").children("name").text()
    let rect = stringToArray(thisXML.children("visualisation").children("size").text());
    // The coverted sections are inserted in the virtual react DOM
    return (
        <div id={name} style={{position:"absolute", overflow:"hidden", left:0, top:0, width:rect[0]*1.1, height:rect[1]*1.1}}>
            {
                <VisuElements visualisation={thisXML}></VisuElements>
            }
        </div>
    )
}