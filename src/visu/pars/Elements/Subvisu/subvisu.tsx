import * as React from 'react';
import { VisuElements } from '../../elementparser';
import * as util from '../../Utils/utilfunctions';
import { ISubvisuShape } from '../../../Interfaces/javainterfaces';
import { parseDynamicShapeParameters } from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager'
import { useObserver, useLocalStore } from 'mobx-react-lite';

type Props = {
    section : Element
}

export const Subvisu :React.FunctionComponent<Props> = ({section})=>
{
    let children = section.children;
    let referenceObject : { [id:string]:Element}= {};
    for (let i=0; i < children.length; i++){
        referenceObject[children[i].nodeName] = children[i];
    }

    let subvisu: ISubvisuShape = {
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
        visuname : referenceObject["name"].textContent,
        show_frame : util.stringToBoolean(referenceObject["show-frame"].textContent),
        clip_frame : util.stringToBoolean(referenceObject["clip-frame"].textContent),
        iso_frame : util.stringToBoolean(referenceObject["iso-frame"].textContent),
        original_frame : util.stringToBoolean(referenceObject["original-frame"].textContent),
        original_scrollable_frame : util.stringToBoolean(referenceObject["original-scrollable-frame"].textContent),
        visu_size : util.stringToArray(referenceObject["size"].textContent),
        // Optional properties
        tooltip : section.getElementsByTagName("tooltip").length > 0 ? section.getElementsByTagName("tooltip")[0].innerHTML : "",
        access_levels : section.getElementsByTagName("access-levels").length ? util.parseAccessLevels(section.getElementsByTagName("access-levels")[0].innerHTML) : ["rw","rw","rw","rw","rw","rw","rw","rw"]
      }
      
    // Parsing of observable events (like toggle color)
    let dynamicShapeParameters = parseDynamicShapeParameters(section);
    
    let initial = createVisuObject(subvisu, dynamicShapeParameters)

    // Convert object to an observable one
    const state = useLocalStore(() => initial);

    // Return of the react node
    return useObserver(()=>
        <div 
            title={subvisu.visuname}
            style={{ display : state.display=="visible" ?"inline":"none", position: "absolute", left: state.transformedCornerCoord.x1 - state.edge, top: state.transformedCornerCoord.y1 - state.edge, width: state.relCoord.width + 2 * state.edge, height: state.relCoord.height + 2 * state.edge, transform:state.visuScale, transformOrigin:"0 0"}}
            >
            <VisuElements visualisation={section}></VisuElements>
        </div>
    )
}
