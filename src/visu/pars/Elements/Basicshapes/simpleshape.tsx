import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { Roundrect } from './SimpleSubunits/roundrect'
import { Line } from './SimpleSubunits/line';
import { Circle } from './SimpleSubunits/circle'
import { Rectangle } from './SimpleSubunits/rectangle';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import { IBasicShape } from '../../../Interfaces/interfaces';
import { parseDynamicShapeParameters, parseDynamicTextParameters, parseClickEvent ,parseTapEvent} from '../Features/Events/eventManager';

type Props = {
  section : Element
}

export const SimpleShape : React.FunctionComponent<Props> = ({section})=> 
{	
	// Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
	let shape = section.getElementsByTagName("simple-shape")[0].innerHTML;
	// Parse the common informations
	if (['round-rect', 'circle', 'line', 'rectangle'].includes(shape)) {
		// Parsing of the fixed parameters
		let simpleShapeBasis : IBasicShape = {
			shape : shape,
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
			tooltip : section.getElementsByTagName("tooltip").length? section.getElementsByTagName("tooltip")[0].innerHTML : "",
			// Points only exists on polyforms
			points : []
		}
		// Parsing the textfields and returning a jsx object if it exists
		let textField : JSX.Element;
		if (section.getElementsByTagName("text-format").length){
			
			let dynamicTextParameters = parseDynamicTextParameters(section, shape);
			textField = <Textfield section={section} dynamicParameters={dynamicTextParameters}></Textfield>;
		} else {
			textField = null;
		}

		// Parsing the inputfield
		let inputField : JSX.Element;
		if (section.getElementsByTagName("enable-text-input").length){
			if(section.getElementsByTagName("enable-text-input")[0].innerHTML == "true"){
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

		// Return of the React-Node
		switch (shape){
			case 'round-rect':
				return(
					<Roundrect
					simpleShape={simpleShapeBasis} 
					textField={textField}
					input ={inputField}
					dynamicParameters={dynamicShapeParameters} 
					onclick={onclick} 
					onmousedown={onmousedown} 
					onmouseup={onmouseup}/>
				);
				break;
			case 'circle':
				return(
					<Circle 
						simpleShape={simpleShapeBasis} 
						textField={textField}
						input ={inputField}
						dynamicParameters={dynamicShapeParameters} 
						onclick={onclick} 
						onmousedown={onmousedown} 
						onmouseup={onmouseup}/>
				);
				break;
			case 'line':
				return(
					<Line 
						simpleShape={simpleShapeBasis} 
						textField={textField}
						input ={inputField}
						dynamicParameters={dynamicShapeParameters} 
						onclick={onclick} 
						onmousedown={onmousedown} 
						onmouseup={onmouseup}></Line>
				);
				break;
			case 'rectangle':
				return(
					<Rectangle 
					simpleShape={simpleShapeBasis} 
					textField={textField}
					input ={inputField}
					dynamicParameters={dynamicShapeParameters} 
					onclick={onclick} 
					onmousedown={onmousedown} 
					onmouseup={onmouseup}/>
				);
				break;
		}
	}
	// Else the name of the shape is not known
	else {
		console.error("Simple-Shape: <" + shape + "> is not supported!");
	}
}

