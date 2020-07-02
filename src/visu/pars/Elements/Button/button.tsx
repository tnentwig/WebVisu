import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { IBasicShape } from '../../../Interfaces/javainterfaces';
import { Textfield } from '../Features/Text/textManager';
import { parseDynamicShapeParameters, parseDynamicTextParameters, parseClickEvent ,parseTapEvent} from '../Features/Events/eventManager';
import {createVisuObject} from '../../Objectmanagement/objectManager'
import {useObserver, useLocalStore } from 'mobx-react-lite';
import { Image } from '../Features/Image/image'
import {ErrorBoundary} from 'react-error-boundary';

type Props = {
    section : Element
}

export const Button :React.FunctionComponent<Props> = ({section})=>
{
    // Parsing of the fixed parameters
    let button : IBasicShape = {
        shape : "button",
        has_inside_color : util.stringToBoolean(section.getElementsByTagName("has-inside-color")[0].innerHTML),
        fill_color : util.rgbToHexString(section.getElementsByTagName("fill-color")[0].innerHTML),
        fill_color_alarm : util.rgbToHexString(section.getElementsByTagName("fill-color-alarm")[0].innerHTML),
        has_frame_color : util.stringToBoolean(section.getElementsByTagName("has-frame-color")[0].innerHTML),
        frame_color : util.rgbToHexString(section.getElementsByTagName("frame-color")[0].innerHTML),
        frame_color_alarm : util.rgbToHexString(section.getElementsByTagName("frame-color-alarm")[0].innerHTML),
        line_width : Number(section.getElementsByTagName("line-width")[0].innerHTML),
        elem_id : section.getElementsByTagName("elem-id")[0].innerHTML,
        rect : util.stringToArray(section.getElementsByTagName("rect")[0].innerHTML),
        center : util.stringToArray(section.getElementsByTagName("center")[0].innerHTML),
        hidden_input : util.stringToBoolean(section.getElementsByTagName("hidden-input")[0].innerHTML),
        enable_text_input : util.stringToBoolean(section.getElementsByTagName("enable-text-input")[0].innerHTML),
        // Optional properties
        tooltip : section.getElementsByTagName("tooltip").length>0? section.getElementsByTagName("tooltip")[0].innerHTML : "",
        access_levels : section.getElementsByTagName("access-levels").length ? util.parseAccessLevels(section.getElementsByTagName("access-levels")[0].innerHTML) : ["rw","rw","rw","rw","rw","rw","rw","rw"]
      }

    // Parsing the textfields and returning a jsx object if it exists
		let textField : JSX.Element;
		if (section.getElementsByTagName("text-format").length){
			let dynamicTextParameters = parseDynamicTextParameters(section, button.shape);
			textField = <Textfield section={section} dynamicParameters={dynamicTextParameters}></Textfield>;
		} else {
			textField = null;
    }
    
    // Parsing the inline picture if necessary
    let pictureInside = false
    if (section.getElementsByTagName("file-name").length){
      pictureInside = true;
    }

    // Parsing of observable events (like toggle color)
    let dynamicShapeParameters = parseDynamicShapeParameters(section);
    // Parsing of user events that causes a reaction like toggle or pop up input
    let onclick =parseClickEvent(section);
    let onmousedown = parseTapEvent(section, "down");
    let onmouseup = parseTapEvent(section, "up");

    let initial = createVisuObject(button, dynamicShapeParameters)

     // Convert object to an observable one
    const state  = useLocalStore(()=>initial);

    // Return of the react node
    return useObserver(()=>
        <div style={{position:"absolute", visibility : state.display, left:state.transformedCornerCoord.x1, top:state.transformedCornerCoord.y1, width:state.relCoord.width, height:state.relCoord.height}}>
          {state.readAccess ?
          <ErrorBoundary fallback={<div>Oh no</div>}>
            <button
            title={state.tooltip} 
            onClick={onclick == null ? null : state.writeAccess ? ()=>onclick() : null} 
            onMouseDown={onmousedown == null ? null : state.writeAccess ? ()=>onmousedown() : null} 
            onMouseUp={onmouseup == null ? null : state.writeAccess ? ()=>onmouseup() : null}
            onMouseLeave={onmouseup == null ? null : state.writeAccess ? ()=>onmouseup () : null}  // We have to reset if somebody leaves the object with pressed key
            style={{backgroundColor: state.fill, width:state.relCoord.width, height:state.relCoord.height, position:"absolute"}}>               
            </button>
            {pictureInside ? <Image section={section} inlineElement={true}></Image> : null}           
            <div style={{width:"100%", height:"100%", position:"absolute", textAlign:"center",margin: "auto", top: 0, left: 0, bottom: 0, right: 0, pointerEvents:"none"}}>
              <svg width="100%" height="100%">
                {textField}
              </svg>
            </div>
            </ErrorBoundary>
            : null }
        </div>
    )

}