import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { Bezier } from './PolySubunits/bezier';
import { Polygon } from './PolySubunits/polygon';
import { Polyline } from './PolySubunits/polyline';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import { IPolyShape } from '../../../Interfaces/javainterfaces';
import {
    parseShapeParameters,
    parseTextParameters,
    parseClickEvent,
    parseTapEvent,
} from '../Features/Events/eventManager';

type Props = {
    section: Element;
};

export const PolyShape: React.FunctionComponent<Props> = ({
    section,
}) => {
    // Check if its on of the allowed shapes like polygon, bezier or polyline
    const shape = section.getElementsByTagName('poly-shape')[0]
        .innerHTML;
    // Parse the common informations
    if (['polygon', 'bezier', 'polyline'].includes(shape)) {
        // Parsing of the fixed parameters
        const polyShapeBasis: IPolyShape = {
            // ICommonShape properties
            shape: shape,
            elementId: section.getElementsByTagName('elem-id')[0]
                .innerHTML,
            center: util.stringToArray(
                section.getElementsByTagName('center')[0].innerHTML,
            ),
            // The lineWidth is 0 in the xml if border width is 1 in the codesys dev env.
            // Otherwise lineWidth is equal to the target border width. Very strange.
            lineWidth:
                Number(
                    section.getElementsByTagName('line-width')[0]
                        .innerHTML,
                ) === 0
                    ? 1
                    : Number(
                          section.getElementsByTagName(
                              'line-width',
                          )[0].innerHTML,
                      ),
            hasFrameColor: util.stringToBoolean(
                section.getElementsByTagName('has-frame-color')[0]
                    .innerHTML,
            ),
            hasInsideColor: util.stringToBoolean(
                section.getElementsByTagName('has-inside-color')[0]
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
            fillColor: util.rgbToHexString(
                section.getElementsByTagName('fill-color')[0]
                    .innerHTML,
            ),
            fillColorAlarm: util.rgbToHexString(
                section.getElementsByTagName('fill-color-alarm')[0]
                    .innerHTML,
            ),
            enableTextInput: util.stringToBoolean(
                section.getElementsByTagName('enable-text-input')[0]
                    .innerHTML,
            ),
            hiddenInput: util.stringToBoolean(
                section.getElementsByTagName('hidden-input')[0]
                    .innerHTML,
            ),

            // ICommonShape optional properties
            tooltip:
                section.getElementsByTagName('tooltip').length > 0
                    ? util.parseText(
                          section.getElementsByTagName('tooltip')[0]
                              .textContent,
                      )
                    : '',
            accessLevels: section.getElementsByTagName(
                'access-levels',
            ).length
                ? util.parseAccessLevels(
                      section.getElementsByTagName('access-levels')[0]
                          .innerHTML,
                  )
                : ['rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw'],

            // IPolyShape properties
            points: [] as number[][],

            // IPolyShape computed properties
            rect: [],
        };

        // Parsing the points coordinates
        const xmlPoints = section.getElementsByTagName('point');
        for (let index = 0; index < xmlPoints.length; index++) {
            const points = util.stringToArray(
                xmlPoints[index].innerHTML,
            );
            polyShapeBasis.points.push(points);
        }

        // Auxiliary values
        polyShapeBasis.rect = util.computeMinMaxCoord(
            polyShapeBasis.points,
        );

        // Parsing of observable events (like toggle color)
        const shapeParameters = parseShapeParameters(section);
        // Parsing of user events that causes a reaction like toggle or pop up input
        const onclick = parseClickEvent(section);
        const onmousedown = parseTapEvent(section, 'down');
        const onmouseup = parseTapEvent(section, 'up');

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

        // Parsing the textfields and returning a jsx object if it exists
        let textField: JSX.Element;
        if (section.getElementsByTagName('text-format').length) {
            const textParameters = parseTextParameters(section);
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

        // Return of the React-Node
        switch (shape) {
            case 'polygon': {
                return (
                    <Polygon
                        polyShape={polyShapeBasis}
                        textField={textField}
                        inputField={inputField}
                        dynamicParameters={shapeParameters}
                        onclick={onclick}
                        onmousedown={onmousedown}
                        onmouseup={onmouseup}
                    />
                );
            }
            case 'bezier': {
                return (
                    <Bezier
                        polyShape={polyShapeBasis}
                        textField={textField}
                        inputField={inputField}
                        dynamicParameters={shapeParameters}
                        onclick={onclick}
                        onmousedown={onmousedown}
                        onmouseup={onmouseup}
                    />
                );
            }
            case 'polyline': {
                return (
                    <Polyline
                        polyShape={polyShapeBasis}
                        textField={textField}
                        inputField={inputField}
                        dynamicParameters={shapeParameters}
                        onclick={onclick}
                        onmousedown={onmousedown}
                        onmouseup={onmouseup}
                    />
                );
            }
        }
    } else {
        console.warn('Poly-Shape: <' + shape + '> is not supported!');
        return null;
    }
};
