import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { Roundrect } from './SimpleSubunits/roundrect';
import { Line } from './SimpleSubunits/line';
import { Circle } from './SimpleSubunits/circle';
import { Rectangle } from './SimpleSubunits/rectangle';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import { IBasicShape } from '../../../Interfaces/javainterfaces';
import {
    parseShapeParameters,
    parseTextParameters,
    parseClickEvent,
    parseTapEvent,
} from '../Features/Events/eventManager';

type Props = {
    section: Element;
};

export const SimpleShape: React.FunctionComponent<Props> = ({
    section,
}) => {
    // Check if its on of the allowed shapes like rectangle, round-rectangle, circle or line
    const shape = section.getElementsByTagName('simple-shape')[0]
        .innerHTML;
    // Parse the common informations
    if (
        ['round-rect', 'circle', 'line', 'rectangle'].includes(shape)
    ) {
        // Parsing of the fixed parameters
        const simpleShapeBasis: IBasicShape = {
            shape: shape,
            hasInsideColor: util.stringToBoolean(
                section.getElementsByTagName('has-inside-color')[0]
                    .innerHTML,
            ),
            fillColor: util.rgbToHexString(
                section.getElementsByTagName('fill-color')[0]
                    .innerHTML,
            ),
            fillColorAlarm: util.rgbToHexString(
                section.getElementsByTagName('fill-color-alarm')[0]
                    .innerHTML,
            ),
            hasFrameColor: util.stringToBoolean(
                section.getElementsByTagName('has-frame-color')[0]
                    .innerHTML,
            ),
            frameColor: util.rgbToHexString(
                section.getElementsByTagName('frame-color')[0]
                    .innerHTML,
            ),
            frameColorAlarm: util.rgbToHexString(
                section.getElementsByTagName('frame-color-alarm')[0]
                    .innerHTML,
            ),
            lineWidth: Number(
                section.getElementsByTagName('line-width')[0]
                    .innerHTML,
            ),
            elementId: section.getElementsByTagName('elem-id')[0]
                .innerHTML,
            rect: util.stringToArray(
                section.getElementsByTagName('rect')[0].innerHTML,
            ),
            center: util.stringToArray(
                section.getElementsByTagName('center')[0].innerHTML,
            ),
            hiddenInput: util.stringToBoolean(
                section.getElementsByTagName('hidden-input')[0]
                    .innerHTML,
            ),
            enableTextInput: util.stringToBoolean(
                section.getElementsByTagName('enable-text-input')[0]
                    .innerHTML,
            ),
            // Optional properties
            tooltip: section.getElementsByTagName('tooltip').length
                ? section.getElementsByTagName('tooltip')[0].innerHTML
                : '',
            accessLevels: section.getElementsByTagName(
                'access-levels',
            ).length
                ? util.parseAccessLevels(
                      section.getElementsByTagName('access-levels')[0]
                          .innerHTML,
                  )
                : ['rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw'],
        };

        // Parsing of observable events (like toggle color)
        const shapeParameters = parseShapeParameters(
            section,
        );

        // Parsing the textfields and returning a jsx object if it exists
        let textField: JSX.Element;
        if (section.getElementsByTagName('text-format').length) {
            const textParameters = parseTextParameters(
                section,
            );
            textField = (
                <Textfield
                    section={section}
                    textParameters={textParameters}
                    shapeParameters={shapeParameters}
                ></Textfield>
            );
        } else {
            textField = null;
        }

        // Parsing the inputfield
        let inputField: JSX.Element;
        if (
            section.getElementsByTagName('enable-text-input').length
        ) {
            if (
                section.getElementsByTagName('enable-text-input')[0]
                    .innerHTML === 'true'
            ) {
                inputField = (
                    <Inputfield section={section}></Inputfield>
                );
            } else {
                inputField = null;
            }
        } else {
            inputField = null;
        }

        // Parsing of user events that causes a reaction like toggle or pop up input
        const onclick = parseClickEvent(section);
        const onmousedown = parseTapEvent(section, 'down');
        const onmouseup = parseTapEvent(section, 'up');

        // Return of the React-Node
        switch (shape) {
            case 'round-rect':
                return (
                    <Roundrect
                        simpleShape={simpleShapeBasis}
                        textField={textField}
                        input={inputField}
                        dynamicParameters={shapeParameters}
                        onclick={onclick}
                        onmousedown={onmousedown}
                        onmouseup={onmouseup}
                    />
                );
                break;
            case 'circle':
                return (
                    <Circle
                        simpleShape={simpleShapeBasis}
                        textField={textField}
                        input={inputField}
                        dynamicParameters={shapeParameters}
                        onclick={onclick}
                        onmousedown={onmousedown}
                        onmouseup={onmouseup}
                    />
                );
                break;
            case 'line':
                return (
                    <Line
                        simpleShape={simpleShapeBasis}
                        textField={textField}
                        input={inputField}
                        dynamicParameters={shapeParameters}
                        onclick={onclick}
                        onmousedown={onmousedown}
                        onmouseup={onmouseup}
                    ></Line>
                );
                break;
            case 'rectangle':
                return (
                    <Rectangle
                        simpleShape={simpleShapeBasis}
                        textField={textField}
                        input={inputField}
                        dynamicParameters={shapeParameters}
                        onclick={onclick}
                        onmousedown={onmousedown}
                        onmouseup={onmouseup}
                    />
                );
                break;
        }
    }
    // Else the name of the shape is not known
    else {
        console.log(
            'Simple-Shape: <' + shape + '> is not supported!',
        );
        return null;
    }
};
