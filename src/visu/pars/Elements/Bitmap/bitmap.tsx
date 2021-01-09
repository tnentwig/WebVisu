import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { ImageField } from '../Features/Image/image';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import { IBasicShape } from '../../../Interfaces/javainterfaces';
import {
    parseShapeParameters,
    parseTextParameters,
    parseClickEvent,
    parseTapEvent,
} from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
    section: Element;
};

export const Bitmap: React.FunctionComponent<Props> = ({
    section,
}) => {
    // Parsing of the fixed parameters
    const bitmap: IBasicShape = {
        shape: 'bitmap',
        hasInsideColor: util.stringToBoolean(
            section.getElementsByTagName('has-inside-color')[0]
                .innerHTML,
        ),
        fillColor: util.rgbToHexString(
            section.getElementsByTagName('fill-color')[0].innerHTML,
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
            section.getElementsByTagName('frame-color')[0].innerHTML,
        ),
        frameColorAlarm: util.rgbToHexString(
            section.getElementsByTagName('frame-color-alarm')[0]
                .innerHTML,
        ),
        lineWidth: Number(
            section.getElementsByTagName('line-width')[0].innerHTML,
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
            section.getElementsByTagName('hidden-input')[0].innerHTML,
        ),
        enableTextInput: util.stringToBoolean(
            section.getElementsByTagName('enable-text-input')[0]
                .innerHTML,
        ),
        // Optional properties
        tooltip: section.getElementsByTagName('tooltip').length
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

    // Parsing of observable events (like toggle color)
    const shapeParameters = parseShapeParameters(section);
    // Parsing of user events that causes a reaction like toggle or pop up input
    const onclick = parseClickEvent(section);
    const onmousedown = parseTapEvent(section, 'down');
    const onmouseup = parseTapEvent(section, 'up');

    // Parsing the inputfield and returning a jsx object if it exists
    let inputField: JSX.Element;
    if (section.getElementsByTagName('enable-text-input').length) {
        if (
            section.getElementsByTagName('enable-text-input')[0]
                .innerHTML === 'true'
        ) {
            inputField = <Inputfield section={section}></Inputfield>;
        } else {
            inputField = null;
        }
    } else {
        inputField = null;
    }

    // Parsing the imageField and returning a jsx object if it exists
    let imageField: JSX.Element;
    if (
        section.getElementsByTagName('file-name').length ||
        section.getElementsByTagName('expr-fill-color').length
    ) {
        imageField = (
            <ImageField
                section={section}
                inlineElement={false}
            ></ImageField>
        );
    } else {
        imageField = null;
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

    // Convert object to an observable one
    const state = useLocalStore(() =>
        createVisuObject(bitmap, shapeParameters),
    );

    // Return of the react node
    return useObserver(() => (
        <div
            style={{
                cursor: 'auto',
                overflow: 'visible',
                pointerEvents: state.eventType,
                visibility: state.display,
                position: 'absolute',
                left: state.transformedCornerCoord.x1 - state.edge,
                top: state.transformedCornerCoord.y1 - state.edge,
                width: state.relCoord.width + 2 * state.edge,
                height: state.relCoord.height + 2 * state.edge,
            }}
        >
            {state.readAccess ? (
                <ErrorBoundary fallback={<div>Oh no</div>}>
                    {inputField}
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
                        cursor={
                            (typeof onclick !== 'undefined' &&
                                onclick !== null) ||
                            (typeof onmousedown !== 'undefined' &&
                                onmousedown !== null) ||
                            (typeof onmouseup !== 'undefined' &&
                                onmouseup !== null)
                                ? 'pointer'
                                : null
                        }
                        width={state.relCoord.width + 2 * state.edge}
                        height={
                            state.relCoord.height + 2 * state.edge
                        }
                        strokeDasharray={state.strokeDashArray}
                        overflow="visible"
                    >
                        {typeof state.tooltip === 'undefined' ||
                        state.tooltip === null ||
                        state.tooltip === '' ? null : (
                            <title>{state.tooltip}</title>
                        )}
                        {imageField}
                        {state.hasFrameColor ? (
                            <rect
                                width={state.relCoord.width}
                                height={state.relCoord.height}
                                x={state.edge}
                                y={state.edge}
                                fill="none"
                                stroke={state.stroke}
                                strokeWidth={state.strokeWidth}
                                transform={state.transform}
                            ></rect>
                        ) : null}
                        {typeof textField === 'undefined' ||
                        textField === null ? null : (
                            <svg
                                width={state.relCoord.width}
                                height={state.relCoord.height}
                                x={state.edge}
                                y={state.edge}
                                overflow="visible"
                            >
                                {textField}
                            </svg>
                        )}
                    </svg>
                </ErrorBoundary>
            ) : null}
        </div>
    ));
};
