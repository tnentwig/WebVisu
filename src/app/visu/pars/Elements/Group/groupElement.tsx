import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { uid } from 'react-uid';
import ComSocket from '../../../communication/comsocket';
import { Button } from '../Button/button';
import { Bitmap } from '../Bitmap/bitmap';
import { SimpleShape } from '../Basicshapes/simpleshape';
import { PolyShape } from '../Basicshapes/polyshape';
import { stringToArray } from '../../Utils/utilfunctions';

import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import { IGroupShape } from '../../../Interfaces/javainterfaces';
import {
    parseShapeParameters,
    parseTextParameters,
    parseClickEvent,
    parseTapEvent,
} from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
    section: Element;
};

function getDimension(
    actualDimension: Array<number>,
    newRect: Array<number>,
) {
    const len = newRect.length;
    if (len === 4) {
        actualDimension[0] < newRect[2]
            ? (actualDimension[0] = newRect[2])
            : 0;
        actualDimension[1] < newRect[3]
            ? (actualDimension[1] = newRect[3])
            : 0;
    } else if (len === 2) {
        for (let i = 0; i < 2; i++) {
            actualDimension[i] < newRect[i]
                ? (actualDimension[i] = newRect[0])
                : 0;
        }
    }
}

export const Group: React.FunctionComponent<Props> = ({
    section,
}) => {

    // Parsing of the fixed parameters
    const group: IGroupShape = {
        // ICommonShape properties
        shape: 'group',
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
        ),//

        // IGroupShape properties
        rect: util.stringToArray(
            util.getElementHTML(section, 'rect', '0,0,0,0'),
        ),
        showFrame: util.stringToBoolean(
            util.getElementHTML(section, 'show-frame', 'false'),
        ),
        clipFrame: util.stringToBoolean(
            util.getElementHTML(section, 'clip-frame', 'false'),
        ),
        isoFrame: util.stringToBoolean(
            util.getElementHTML(section, 'iso-frame', 'false'),
        ),
        originalFrame: util.stringToBoolean(
            util.getElementHTML(section, 'original-frame', 'false'),
        ),
        animateChilds: util.stringToBoolean(
            util.getElementHTML(section, 'animate-childs', 'false'),
        ),
        // Computed values
        rightDownCorner: [0, 0],
    };
    
    // Create an array of visu object from the group childs
    const visuObjects: Array<{
        obj: JSX.Element;
        id: string;
    }> = [];
    // Create the function to parse the group childs
    const addVisuObject = (visuObject: JSX.Element) => {
        const obj = { obj: visuObject, id: uid(visuObject) };
        visuObjects.push(obj);
    };
    // The rightdown corner coordinates of the subvisu will be stored
    for (let i = 0; i < section.children.length; i++) {
        const element = section.children[i];
        if (element.nodeName === 'element') {
            // Determine the type of the element
            const type = element.getAttribute('type');
            switch (type) {
                case 'simple': {
                    addVisuObject(
                        <SimpleShape section={element}></SimpleShape>,
                    );
                    getDimension(
                        group.rightDownCorner,
                        stringToArray(
                            element.getElementsByTagName('rect')[0]
                                .innerHTML,
                        ),
                    );
                    break;
                }
                case 'polygon': {
                    addVisuObject(
                        <PolyShape section={element}></PolyShape>,
                    );
                    const points = element.getElementsByTagName(
                        'point',
                    );
                    for (let i = 0; i < points.length; i++) {
                        getDimension(
                            group.rightDownCorner,
                            stringToArray(points[i].innerHTML),
                        );
                    }
                    break;
                }
                case 'button': {
                    addVisuObject(
                        <Button section={element}></Button>,
                    );
                    getDimension(
                        group.rightDownCorner,
                        stringToArray(
                            element.getElementsByTagName('rect')[0]
                                .innerHTML,
                        ),
                    );
                    break;
                }
                case 'bitmap': {
                    addVisuObject(
                        <Bitmap section={element}></Bitmap>,
                    );
                    getDimension(
                        group.rightDownCorner,
                        stringToArray(
                            element.getElementsByTagName('rect')[0]
                                .innerHTML,
                        ),
                    );
                    break;
                }
                case 'group': {
                    addVisuObject(<Group section={element}></Group>);
                    getDimension(
                        group.rightDownCorner,
                        stringToArray(
                            element.getElementsByTagName('rect')[0]
                                .innerHTML,
                        ),
                    );
                    break;
                }
            }
        }
    }

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
        createVisuObject(group, shapeParameters),
    );

    return useObserver(() =>
        <div
            style={{
                cursor: 'auto',
                overflow: 'visible',
                pointerEvents: state.pointerEvents,
                visibility: state.visibility,
                position: 'absolute',
                left:
                    Math.min(
                        state.transformedCornerCoord.x1,
                        state.transformedCornerCoord.x2,
                    ) +
                    state.transformedStartCoord.left -
                    state.lineWidth,
                top:
                    Math.min(
                        state.transformedCornerCoord.y1,
                        state.transformedCornerCoord.y2,
                    ) +
                    state.transformedStartCoord.top -
                    state.lineWidth,
                width:
                    state.transformedSize.width +
                    2 * state.lineWidth,
                height:
                    state.transformedSize.height +
                    2 * state.lineWidth,
            }}
        >
            {state.readAccess ? (
                <ErrorBoundary fallback={<div>Oh no</div>}>
                    {inputField}
                    <div
                        style={{
                            width: state.groupSize.width,
                            height: state.groupSize.height,
                            transformOrigin: 'left top',
                            transform: 'scale(' + state.groupScale.x + ',' + state.groupScale.y + ')',
                            overflow: group.clipFrame ? 'hidden' : 'visible',
                        }}
                    >
                        {
                            // visuObjects.map((element, index) => (
                            visuObjects.map((element) => (
                                <React.Fragment key={element.id}>
                                    {element.obj}
                                </React.Fragment>
                            ))
                        }
                    </div>
                    <svg
                        style={{position: 'absolute', left: 0 - (2 * state.lineWidth), top: 0 - (2 * state.lineWidth),}}
                        width={
                            state.transformedSize.width *
                                (state.motionAbsScale /
                                    1000) +
                            2 * state.lineWidth
                        }
                        height={
                            state.transformedSize.height *
                                (state.motionAbsScale /
                                    1000) +
                            2 * state.lineWidth
                        }
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
                            width={
                                state.transformedSize.width +
                                2 * state.lineWidth
                            }
                            height={
                                state.transformedSize.height +
                                2 * state.lineWidth
                            }
                            overflow="visible"
                            transform={state.transform}
                        >
                            {typeof state.tooltip === 'undefined' ||
                            state.tooltip === null ||
                            state.tooltip === '' ? null : (
                                <title>{state.tooltip}</title>
                            )}
                            {state.hasFrameColor ? (
                                <rect
                                    width={
                                        state.transformedSize.width
                                    }
                                    height={
                                        state.transformedSize.height
                                    }
                                    x={state.lineWidth}
                                    y={state.lineWidth}
                                    fill="none"
                                    stroke={state.stroke}
                                    strokeWidth={state.strokeWidth}
                                    strokeDasharray={
                                        state.strokeDasharray
                                    }
                                ></rect>
                            ) : null}
                            {typeof textField === 'undefined' ||
                            textField === null ? null : (
                                <svg
                                    width={
                                        state.transformedSize.width
                                    }
                                    height={
                                        state.transformedSize.height
                                    }
                                    x={state.lineWidth}
                                    y={state.lineWidth}
                                    overflow="visible"
                                >
                                    {textField}
                                </svg>
                            )}
                        </svg>
                    </svg>
                </ErrorBoundary>
            ) : null}
        </div>
    );
};
