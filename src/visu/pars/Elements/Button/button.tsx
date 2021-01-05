import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { IBasicShape } from '../../../Interfaces/javainterfaces';
import { Textfield } from '../Features/Text/textManager';
import {
    parseShapeParameters,
    parseTextParameters,
    parseClickEvent,
    parseTapEvent,
} from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import { Image } from '../Features/Image/image';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
    section: Element;
};

export const Button: React.FunctionComponent<Props> = ({
    section,
}) => {
    // Parsing of the fixed parameters
    const button: IBasicShape = {
        shape: 'button',
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
        elementId: section.getElementsByTagName('elem-id')[0].innerHTML,
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
        tooltip:
            section.getElementsByTagName('tooltip').length > 0
                ? section.getElementsByTagName('tooltip')[0].innerHTML
                : '',
        accessLevels: section.getElementsByTagName('access-levels')
            .length
            ? util.parseAccessLevels(
                  section.getElementsByTagName('access-levels')[0]
                      .innerHTML,
              )
            : ['rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw'],
    };

    // Parsing the textfields and returning a jsx object if it exists
    let textField: JSX.Element;
    if (section.getElementsByTagName('text-format').length) {
        const dynamicTextParameters = parseTextParameters(
            section,
            button.shape,
        );
        textField = (
            <Textfield
                section={section}
                dynamicParameters={dynamicTextParameters}
            ></Textfield>
        );
    } else {
        textField = null;
    }

    // Parsing the inline picture if necessary
    let pictureInside = false;
    if (section.getElementsByTagName('file-name').length) {
        pictureInside = true;
    }

    // Parsing of observable events (like toggle color)
    const dynamicShapeParameters = parseShapeParameters(section);
    // Parsing of user events that causes a reaction like toggle or pop up input
    const onclick = parseClickEvent(section);
    const onmousedown = parseTapEvent(section, 'down');
    const onmouseup = parseTapEvent(section, 'up');

    const initial = createVisuObject(button, dynamicShapeParameters);

    // Convert object to an observable one
    const state = useLocalStore(() => initial);

    // Return of the react node
    return useObserver(() => (
        <div
            style={{
                position: 'absolute',
                visibility: state.display,
                left: state.transformedCornerCoord.x1,
                top: state.transformedCornerCoord.y1,
                width: state.relCoord.width,
                height: state.relCoord.height,
            }}
        >
            {state.readAccess ? (
                <ErrorBoundary fallback={<div>Oh no</div>}>
                    <button
                        title={state.tooltip}
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
                        style={{
                            backgroundColor: state.fill,
                            width: state.relCoord.width,
                            height: state.relCoord.height,
                            position: 'absolute',
                        }}
                    ></button>
                    {pictureInside ? (
                        <Image
                            section={section}
                            inlineElement={true}
                        ></Image>
                    ) : null}
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            textAlign: 'center',
                            margin: 'auto',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            pointerEvents: 'none',
                        }}
                    >
                        <svg width="100%" height="100%">
                            {textField}
                        </svg>
                    </div>
                </ErrorBoundary>
            ) : null}
        </div>
    ));
};
