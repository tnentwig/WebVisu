import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { ImageField } from '../Features/Image/image';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import { IButtonShape } from '../../../Interfaces/javainterfaces';
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

export const Button: React.FunctionComponent<Props> = ({
    section,
}) => {
    // Parsing of the fixed parameters
    const button: IButtonShape = {
        // ICommonShape properties
        shape: 'button',
        elementId: util.getElementHTML(section, 'elem-id', '0'),
        center: util.stringToArray(
            util.getElementHTML(section, 'center', '0,0'),
        ),
        // The lineWidth is 0 in the xml if border width is 1 in the codesys dev env.
        // Otherwise lineWidth is equal to the target border width. Very strange.
        lineWidth:
            Number(
                util.getElementHTML(section, 'line-width', '1'),
            ) === 0
                ? 1
                : Number(
                      util.getElementHTML(section, 'line-width', '1'),
                  ),
        hasFrameColor: util.stringToBoolean(
            util.getElementHTML(section, 'has-frame-color', 'true'),
        ),
        hasInsideColor: util.stringToBoolean(
            util.getElementHTML(section, 'has-inside-color', 'true'),
        ),
        frameColor: util.rgbToHexString(
            util.getElementHTML(section, 'frame-color', '0,0,0'),
        ),
        frameColorAlarm: util.rgbToHexString(
            util.getElementHTML(
                section,
                'frame-color-alarm',
                '0,0,0',
            ),
        ),
        fillColor: util.rgbToHexString(
            util.getElementHTML(section, 'fill-color', '255,255,255'),
        ),
        fillColorAlarm: util.rgbToHexString(
            util.getElementHTML(
                section,
                'fill-color-alarm',
                '255,255,255',
            ),
        ),
        enableTextInput: util.stringToBoolean(
            util.getElementHTML(
                section,
                'enable-text-input',
                'false',
            ),
        ),
        hiddenInput: util.stringToBoolean(
            util.getElementHTML(section, 'hidden-input', 'false'),
        ),

        // ICommonShape optional properties
        tooltip: util.parseText(
            util.getElementText(section, 'tooltip', ''),
        ),
        accessLevels: util.parseAccessLevels(
            util.getElementHTML(
                section,
                'access-levels',
                'rw,rw,rw,rw,rw,rw,rw,rw',
            ),
        ),

        // IButtonShape properties
        frameType: util.getElementHTML(
            section,
            'frame-type',
            'anisotropic',
        ),
        rect: util.stringToArray(
            util.getElementHTML(section, 'rect', '0,0,0,0'),
        ),
    };

    // Parsing of observable events (like toggle color)
    const shapeParameters = parseShapeParameters(section);

    // Parsing of user events that causes a reaction like toggle or pop up input
    const onclick = parseClickEvent(section);
    const onmousedown = parseTapEvent(section, 'down');
    const onmouseup = parseTapEvent(section, 'up');
    const cursor =
        (typeof onclick !== 'undefined' && onclick !== null) ||
        (typeof onmousedown !== 'undefined' &&
            onmousedown !== null) ||
        (typeof onmouseup !== 'undefined' && onmouseup !== null)
            ? 'pointer'
            : null;
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
                inlineElement={true}
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
        createVisuObject(button, shapeParameters),
    );

    const [buttonPressed, setButtonPressed] = React.useState(false);

    const mouseUp = () => {
        if (state.writeAccess) {
            if ((typeof onmouseup !== 'undefined') && (onmouseup !== null)) {
                onmouseup();
            }
            setButtonPressed(false);
        }
    };
    const mouseDown = () => {
        if (state.writeAccess) {
            if ((typeof onmousedown !== 'undefined') && (onmousedown !== null)) {
                onmousedown();
            }
            setButtonPressed(true);
        }
    };

    // Return of the react node
    return useObserver(() => (
        <div
            style={{
                cursor: 'auto',
                overflow: 'visible',
                pointerEvents: state.eventType,
                visibility: state.display,
                position: 'absolute',
                left: state.transformedCornerCoord.x1,
                top: state.transformedCornerCoord.y1,
                width: state.relCoord.width,
                height: state.relCoord.height,
            }}
        >
            {state.readAccess ? (
                <ErrorBoundary fallback={<div>Oh no</div>}>
                    {inputField}
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
                            () => mouseDown() 
                        }
                        onMouseUp={
                            () => mouseUp()
                        }
                        onMouseLeave={
                            () => mouseUp()
                        } // We have to reset if somebody leaves the object with pressed key
                        style={{
                            cursor: cursor,
                            backgroundColor: buttonPressed ? state.alarmFillColor : state.fill,
                            borderColor: buttonPressed ? state.alarmFillColor : state.fill,
                            width: state.relCoord.width,
                            height: state.relCoord.height,
                            position: 'absolute',
                            textIndent: '-45%',
                        }}
                    >
                        <svg
                            width={state.relCoord.width - 4}
                            height={state.relCoord.height - 4}
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                textAlign: 'center',
                                // margin: 'auto',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                pointerEvents: 'none',
                            }}
                            overflow="visible"
                        >
                            {imageField}
                            {typeof textField === 'undefined' ||
                            textField === null
                                ? null
                                : textField}
                        </svg>
                    </button>
                </ErrorBoundary>
            ) : null}
        </div>
    ));
};
