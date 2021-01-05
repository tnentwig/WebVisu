import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { IBasicShape } from '../../../Interfaces/javainterfaces';
import { Textfield } from '../Features/Text/textManager';
import { Inputfield } from '../Features/Input/inputManager';
import {
    parseDynamicShapeParameters,
    parseDynamicTextParameters,
    parseClickEvent,
    parseTapEvent,
} from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import { Image } from '../Features/Image/image';

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
        rect: util.stringToArray(
            section.getElementsByTagName('rect')[0].textContent,
        ),
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
        const dynamicTextParameters = parseDynamicTextParameters(
            section,
            bitmap.shape,
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
    // Parsing of observable events (like toggle color)
    const dynamicShapeParameters = parseDynamicShapeParameters(section);
    // Parsing of user events that causes a reaction like toggle or pop up input
    const onclick = parseClickEvent(section);
    const onmousedown = parseTapEvent(section, 'down');
    const onmouseup = parseTapEvent(section, 'up');

    const initial = createVisuObject(bitmap, dynamicShapeParameters);

    // Convert object to an observable one
    const state = useLocalStore(() => initial);

    // Return of the react node
    return useObserver(() => (
        <div
            style={{
                position: 'absolute',
                visibility: state.display,
                left: state.transformedCornerCoord.x1 - state.edge,
                top: state.transformedCornerCoord.y1 - state.edge,
                width: state.relCoord.width + 2 * state.edge,
                height: state.relCoord.height + 2 * state.edge,
            }}
            onClick={typeof onclick === 'undefined' || onclick === null ? null : () => onclick()}
            onMouseDown={
                typeof onmousedown === 'undefined' || onmousedown === null ? null : () => onmousedown()
            }
            onMouseUp={typeof onmouseup === 'undefined' || onmouseup === null ? null : () => onmouseup()}
            onMouseLeave={
                typeof onmouseup === 'undefined' || onmouseup === null ? null : () => onmouseup()
            }
        >
            <Image section={section} inlineElement={false}></Image>
        </div>
    ));
};
