import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { IPiechartShape } from '../../../Interfaces/javainterfaces';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import {
    parseShapeParameters,
    parseTextParameters,
    parseClickEvent,
    parseTapEvent,
} from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager';
import { useObserver, useLocalStore } from 'mobx-react-lite';

type Props = {
    section: Element;
};

export const Piechart: React.FunctionComponent<Props> = ({
    section,
}) => {
    // Parsing of the fixed parameters
    const piechart: IPiechartShape = {
        shape: 'piechart',
        hasInsideColor: util.stringToBoolean(
            section.getElementsByTagName('has-inside-color')[0]
                .textContent,
        ),
        fillColor: util.rgbToHexString(
            section.getElementsByTagName('fill-color')[0].textContent,
        ),
        fillColorAlarm: util.rgbToHexString(
            section.getElementsByTagName('fill-color-alarm')[0]
                .textContent,
        ),
        hasFrameColor: util.stringToBoolean(
            section.getElementsByTagName('has-frame-color')[0]
                .textContent,
        ),
        frameColor: util.rgbToHexString(
            section.getElementsByTagName('frame-color')[0]
                .textContent,
        ),
        frameColorAlarm: util.rgbToHexString(
            section.getElementsByTagName('frame-color-alarm')[0]
                .textContent,
        ),
        lineWidth: Number(
            section.getElementsByTagName('line-width')[0].textContent,
        ),
        elementId: section.getElementsByTagName('elem-id')[0]
            .textContent,
        rect: [],
        center: util.stringToArray(
            section.getElementsByTagName('center')[0].textContent,
        ),
        hiddenInput: util.stringToBoolean(
            section.getElementsByTagName('hidden-input')[0]
                .textContent,
        ),
        enableTextInput: util.stringToBoolean(
            section.getElementsByTagName('enable-text-input')[0]
                .textContent,
        ),
        // Points only exists on polyforms
        points: [],
        // Optional properties
        tooltip:
            section.getElementsByTagName('tooltip').length > 0
                ? util.parseText(
                      section.getElementsByTagName('tooltip')[0]
                          .textContent,
                  )
                : '',
        accessLevels: section.getElementsByTagName('access-levels')
            .length
            ? util.parseAccessLevels(
                  section.getElementsByTagName('access-levels')[0]
                      .innerHTML,
              )
            : ['rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw'],
    };

    // Parsing the point coordinates
    const xmlPoints = section.getElementsByTagName('point');
    for (let i = 0; i < xmlPoints.length; i++) {
        const points = util.stringToArray(xmlPoints[i].textContent);
        piechart.points.push(points);
    }
    // The piechart points consists of only 4 items
    //   [0]-> center
    //   [1]-> point bottom right
    //   [2]-> point startAngle
    //   [3]-> point endAngle
    // so we have to calculate the rect coordinates separatly
    piechart.rect = util.computePiechartRectCoord(piechart.points);

    // Parsing of observable events (like toggle color)
    const shapeParameters = parseShapeParameters(section);
    // Parsing of user events that causes a reaction like toggle or pop up input
    const onclick = parseClickEvent(section);
    const onmousedown = parseTapEvent(section, 'down');
    const onmouseup = parseTapEvent(section, 'up');

    // Parsing the inputfield
    let inputField: JSX.Element;
    if (section.getElementsByTagName('enable-text-input').length) {
        if (
            section.getElementsByTagName('enable-text-input')[0]
                .textContent === 'true'
        ) {
            inputField = <Inputfield section={section}></Inputfield>;
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

    const initial = createVisuObject(piechart, shapeParameters);

    // Convert object to an observable one
    const state = useLocalStore(() => initial);

    // Return of the react node
    return useObserver(() => (
        <div
            style={{
                position: 'absolute',
                left: state.transformedCornerCoord.x1 - state.edge,
                top: state.transformedCornerCoord.y1 - state.edge,
                width: state.relCoord.width + 2 * state.edge,
                height: state.relCoord.height + 2 * state.edge,
            }}
        >
            {inputField}
            <svg
                style={{ float: 'left' }}
                width={state.relCoord.width + 2 * state.edge}
                height={state.relCoord.height + 2 * state.edge}
                overflow="visible"
            >
                <svg
                    onClick={
                        typeof onclick === 'undefined' ||
                        onclick === null
                            ? null
                            : state.writeAccess
                            ? () => onclick()
                            : null
                    }
                    onMouseDown={
                        typeof onmousedown === 'undefined' ||
                        onmousedown === null
                            ? null
                            : state.writeAccess
                            ? () => onmousedown()
                            : null
                    }
                    onMouseUp={
                        typeof onmouseup === 'undefined' ||
                        onmouseup === null
                            ? null
                            : state.writeAccess
                            ? () => onmouseup()
                            : null
                    }
                    onMouseLeave={
                        typeof onmouseup === 'undefined' ||
                        onmouseup === null
                            ? null
                            : state.writeAccess
                            ? () => onmouseup()
                            : null
                    } // We have to reset if somebody leaves the object with pressed key
                    strokeDasharray={state.strokeDashArray}
                    overflow="visible"
                >
                    <path
                        d={state.piechartPath}
                        stroke={state.stroke}
                        strokeWidth={state.strokeWidth}
                        fill={state.fill}
                        transform={state.transform}
                    ></path>
                    <title>{state.tooltip}</title>
                </svg>
                <svg
                    width={state.relCoord.width + 2 * state.edge}
                    height={state.relCoord.height + 2 * state.edge}
                    overflow="visible"
                >
                    {textField}
                </svg>
            </svg>
        </div>
    ));
};
