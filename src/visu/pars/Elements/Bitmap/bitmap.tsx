import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { IBasicShape } from '../../../Interfaces/javainterfaces';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import { parseDynamicShapeParameters, parseDynamicTextParameters, parseClickEvent, parseTapEvent } from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager'
import { useObserver, useLocalStore } from 'mobx-react-lite';
import { Image } from '../Features/Image/image'

type Props = {
  section: Element
}

export const Bitmap: React.FunctionComponent<Props> = ({ section }) => {
  // Parsing of the fixed parameters

  let bitmap: IBasicShape = {
    shape: "bitmap",
    has_inside_color: util.stringToBoolean(section.getElementsByTagName("has-inside-color")[0].textContent),
    fill_color: util.rgbToHexString(section.getElementsByTagName("fill-color")[0].textContent),
    fill_color_alarm: util.rgbToHexString(section.getElementsByTagName("fill-color-alarm")[0].textContent),
    has_frame_color: util.stringToBoolean(section.getElementsByTagName("has-frame-color")[0].textContent),
    frame_color: util.rgbToHexString(section.getElementsByTagName("frame-color")[0].textContent),
    frame_color_alarm: util.rgbToHexString(section.getElementsByTagName("frame-color-alarm")[0].textContent),
    line_width: Number(section.getElementsByTagName("line-width")[0].textContent),
    elem_id: section.getElementsByTagName("elem-id")[0].textContent,
    rect: util.stringToArray(section.getElementsByTagName("rect")[0].textContent),
    center: util.stringToArray(section.getElementsByTagName("center")[0].textContent),
    hidden_input: util.stringToBoolean(section.getElementsByTagName("hidden-input")[0].textContent),
    enable_text_input: util.stringToBoolean(section.getElementsByTagName("enable-text-input")[0].textContent),
    // Optional properties
    tooltip : section.getElementsByTagName("tooltip").length>0? section.getElementsByTagName("tooltip")[0].innerHTML : "",
    access_levels : section.getElementsByTagName("access-levels").length ? util.parseAccessLevels(section.getElementsByTagName("access-levels")[0].innerHTML) : ["rw","rw","rw","rw","rw","rw","rw","rw"]
  }

  // Parsing the textfields and returning a jsx object if it exists
  let textField : JSX.Element;
  if (section.getElementsByTagName("text-format").length){
    let dynamicTextParameters = parseDynamicTextParameters(section, bitmap.shape);
    textField = <Textfield section={section} dynamicParameters={dynamicTextParameters}></Textfield>;
  } else {
    textField = null;
  }

  // Parsing the inputfield
  let inputField : JSX.Element;
  if (section.getElementsByTagName("enable-text-input").length){
    if(section.getElementsByTagName("enable-text-input")[0].textContent == "true"){
      inputField = <Inputfield section={section}></Inputfield>
    } else {
      inputField = null;
    }
  } else {
    inputField = null;
  }
  // Parsing of observable events (like toggle color)
  let dynamicShapeParameters = parseDynamicShapeParameters(section);
  // Parsing of user events that causes a reaction like toggle or pop up input
  let onclick = parseClickEvent(section);
  let onmousedown = parseTapEvent(section, "down");
  let onmouseup = parseTapEvent(section, "up");

  let initial = createVisuObject(bitmap, dynamicShapeParameters)

  // Convert object to an observable one
  const state = useLocalStore(() => initial);

  // Return of the react node
  return useObserver(() =>
    <div
      style={{ position: "absolute", left: state.transformedCornerCoord.x1 - state.edge, top: state.transformedCornerCoord.y1 - state.edge, width: state.relCoord.width + 2 * state.edge, height: state.relCoord.height + 2 * state.edge }}
      onClick={onclick == null ? null : () => onclick()}
      onMouseDown={onmousedown == null ? null : () => onmousedown()}
      onMouseUp={onmouseup == null ? null : () => onmouseup()}
      onMouseLeave={onmouseup == null ? null : () => onmouseup()}
    >
      <Image section={section} inlineElement={false}></Image>
    </div>
  )

}