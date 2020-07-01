import * as React from 'react';
import {Visualisation} from '../../../visuparser';
import * as util from '../../Utils/utilfunctions';
import { IBasicShape } from '../../../Interfaces/javainterfaces';
import { parseDynamicShapeParameters } from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager'
import { useObserver, useLocalStore } from 'mobx-react-lite';

type Props = {
    section : Element
}

function getPlaceholders(section : Element){
    let placeholders : Map<string,string> = new Map();
    let placeholderentry = section.getElementsByTagName("placeholderentry");
    for (let i=0; i<placeholderentry.length; i++){
        let variable = placeholderentry[i];
        let placeholder = variable.getAttribute("placeholder");
        let replacement = variable.getAttribute("replacement");
        placeholders.set(placeholder.toLowerCase(), replacement.toLowerCase())
    }
    return placeholders;
}

export const Subvisu :React.FunctionComponent<Props> = ({section})=>
{
    let children = section.children;
    let referenceObject : { [id:string]:Element}= {};
    for (let i=0; i < children.length; i++){
        referenceObject[children[i].nodeName] = children[i];
    }

    let subvisu: IBasicShape = {
        shape: "subvisu",
        has_inside_color: util.stringToBoolean(referenceObject["has-inside-color"].textContent),
        fill_color: util.rgbToHexString(referenceObject["fill-color"].textContent),
        fill_color_alarm: util.rgbToHexString(referenceObject["fill-color-alarm"].textContent),
        has_frame_color: util.stringToBoolean(referenceObject["has-frame-color"].textContent),
        frame_color: util.rgbToHexString(referenceObject["frame-color"].textContent),
        frame_color_alarm: util.rgbToHexString(referenceObject["frame-color-alarm"].textContent),
        line_width: Number(referenceObject["line-width"].textContent),
        elem_id: referenceObject["elem-id"].textContent,
        rect: util.stringToArray(referenceObject["rect"].textContent),
        center: util.stringToArray(referenceObject["center"].textContent),
        hidden_input: util.stringToBoolean(referenceObject["hidden-input"].textContent),
        enable_text_input: util.stringToBoolean(referenceObject["enable-text-input"].textContent),
        // Optional properties
        tooltip : section.getElementsByTagName("tooltip").length>0? section.getElementsByTagName("tooltip")[0].innerHTML : "",
        access_levels : section.getElementsByTagName("access-levels").length ? util.parseAccessLevels(section.getElementsByTagName("access-levels")[0].innerHTML) : ["rw","rw","rw","rw","rw","rw","rw","rw"]
      }

    // Subvisu specials
    let visuname = section.getElementsByTagName("name")[0].innerHTML.toLowerCase();
    let placeholders = getPlaceholders(section);
   
    // Parsing of observable events (like toggle color)
    let dynamicShapeParameters = parseDynamicShapeParameters(section);

    let initial = createVisuObject(subvisu, dynamicShapeParameters)

// Convert object to an observable one
const state = useLocalStore(() => initial);



    // Return of the react node
    return useObserver(()=>
        <div 
            title={name} 
            style={{ display : state.display=="visible" ?"inline":"none", position: "absolute", left: state.transformedCornerCoord.x1 - state.edge, top: state.transformedCornerCoord.y1 - state.edge, width: state.relCoord.width + 2 * state.edge, height: state.relCoord.height + 2 * state.edge }}
            >
            <Visualisation visuname={visuname} mainVisu={false} replacementSet={placeholders} width={state.relCoord.width} ></Visualisation>
        </div>
    )
}