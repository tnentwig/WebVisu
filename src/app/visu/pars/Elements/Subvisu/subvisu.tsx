import * as React from 'react';
import { VisuElements } from '../../elementparser';
import * as util from '../../Utils/utilfunctions';
import { ISubvisuShape } from '../../../Interfaces/javainterfaces';
import { parseShapeParameters } from '../Features/Events/eventManager';
import { createVisuObject } from '../../Objectmanagement/objectManager';
import { useObserver, useLocalStore } from 'mobx-react-lite';

type Props = {
    section: Element;
};

export const Subvisu: React.FunctionComponent<Props> = ({
    section,
}) => {
    console.log(section);
    const children = section.children;
    console.log(children);
    const referenceObject: { [id: string]: Element } = {};
    for (let i = 0; i < children.length; i++) {
        referenceObject[children[i].nodeName] = children[i];
    }

    // const subvisu: ISubvisuShape = {
    let subvisu: ISubvisuShape = {
        // ICommonShape properties
        shape: 'subvisu',
        elementId: section.getElementsByTagName('elem-id')[0]
            .innerHTML,
        // elementId: referenceObject['elem-id'].textContent,
        center: util.stringToArray(
            section.getElementsByTagName('center')[0].innerHTML,
            // referenceObject['center'].textContent,
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
                      section.getElementsByTagName('line-width')[0]
                          .innerHTML,
                  ),
        // lineWidth: Number(referenceObject['line-width'].textContent),
        hasFrameColor: util.stringToBoolean(
            section.getElementsByTagName('has-frame-color')[0]
                .innerHTML,
            // referenceObject['has-frame-color'].textContent,
        ),
        hasInsideColor: util.stringToBoolean(
            section.getElementsByTagName('has-inside-color')[0]
                .innerHTML,
            // referenceObject['has-inside-color'].textContent,
        ),
        frameColor: util.rgbToHexString(
            section.getElementsByTagName('frame-color')[0].innerHTML,
            // referenceObject['frame-color'].textContent,
        ),
        frameColorAlarm: util.rgbToHexString(
            section.getElementsByTagName('frame-color-alarm')[0]
                .innerHTML,
            // referenceObject['frame-color-alarm'].textContent,
        ),
        fillColor: util.rgbToHexString(
            section.getElementsByTagName('fill-color')[0].innerHTML,
            // referenceObject['fill-color'].textContent,
        ),
        fillColorAlarm: util.rgbToHexString(
            section.getElementsByTagName('fill-color-alarm')[0]
                .innerHTML,
            // referenceObject['fill-color-alarm'].textContent,
        ),
        enableTextInput: util.stringToBoolean(
            section.getElementsByTagName('enable-text-input')[0]
                .innerHTML,
            // referenceObject['enable-text-input'].textContent,
        ),
        hiddenInput: util.stringToBoolean(
            section.getElementsByTagName('hidden-input')[0].innerHTML,
            // referenceObject['hidden-input'].textContent,
        ),

        // ICommonShape optional properties
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

        // ISubvisuShape properties
        showFrame: util.stringToBoolean(
            section.getElementsByTagName('show-frame')[0].innerHTML,
            // referenceObject['show-frame'].textContent,
        ),
        clipFrame: util.stringToBoolean(
            section.getElementsByTagName('clip-frame')[0].innerHTML,
            // referenceObject['clip-frame'].textContent,
        ),
        isoFrame: util.stringToBoolean(
            section.getElementsByTagName('iso-frame')[0].innerHTML,
            // referenceObject['iso-frame'].textContent,
        ),
        originalFrame: util.stringToBoolean(
            section.getElementsByTagName('original-frame')[0]
                .innerHTML,
            // referenceObject['original-frame'].textContent,
        ),
        originalScrollableFrame: util.stringToBoolean(
            section.getElementsByTagName(
                'original-scrollable-frame',
            )[0].innerHTML,
            // referenceObject['original-scrollable-frame'].textContent,
        ),
        noFrameOffset: util.stringToBoolean(
            section.getElementsByTagName('no-frame-offset')[0]
                .innerHTML,
        ),
        name: section.getElementsByTagName('name')[0].innerHTML,
        rect: util.stringToArray(
            section.getElementsByTagName('rect')[0].innerHTML,
        ),
        // rect: util.stringToArray(referenceObject['rect'].textContent),
        // ISubvisuShape computed values
        visuName: referenceObject['name'].textContent,
        visuSize: util.stringToArray(
            referenceObject['size'].textContent,
        ),
    };
    console.log(subvisu);

    subvisu = {
        // ICommonShape properties
        shape: 'subvisu',
        elementId: referenceObject['elem-id'].textContent,
        center: util.stringToArray(
            referenceObject['center'].textContent,
        ),
        // The lineWidth is 0 in the xml if border width is 1 in the codesys dev env.
        // Otherwise lineWidth is equal to the target border width. Very strange.
        lineWidth:
            Number(referenceObject['line-width'].textContent) === 0
                ? 1
                : Number(referenceObject['line-width'].textContent),
        hasFrameColor: util.stringToBoolean(
            referenceObject['has-frame-color'].textContent,
        ),
        hasInsideColor: util.stringToBoolean(
            referenceObject['has-inside-color'].textContent,
        ),
        frameColor: util.rgbToHexString(
            referenceObject['frame-color'].textContent,
        ),
        frameColorAlarm: util.rgbToHexString(
            referenceObject['frame-color-alarm'].textContent,
        ),
        fillColor: util.rgbToHexString(
            referenceObject['fill-color'].textContent,
        ),
        fillColorAlarm: util.rgbToHexString(
            referenceObject['fill-color-alarm'].textContent,
        ),
        enableTextInput: util.stringToBoolean(
            referenceObject['enable-text-input'].textContent,
        ),
        hiddenInput: util.stringToBoolean(
            referenceObject['hidden-input'].textContent,
        ),

        // ICommonShape optional properties
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

        // ISubvisuShape properties
        showFrame: util.stringToBoolean(
            referenceObject['show-frame'].textContent,
        ),
        clipFrame: util.stringToBoolean(
            referenceObject['clip-frame'].textContent,
        ),
        isoFrame: util.stringToBoolean(
            referenceObject['iso-frame'].textContent,
        ),
        originalFrame: util.stringToBoolean(
            referenceObject['original-frame'].textContent,
        ),
        originalScrollableFrame: util.stringToBoolean(
            referenceObject['original-scrollable-frame'].textContent,
        ),
        noFrameOffset: util.stringToBoolean(
            section.getElementsByTagName('no-frame-offset')[0]
                .innerHTML,
        ),
        name: section.getElementsByTagName('name')[0].innerHTML,
        rect: util.stringToArray(referenceObject['rect'].textContent),

        // ISubvisuShape computed values
        visuName: referenceObject['name'].textContent,
        visuSize: util.stringToArray(
            referenceObject['size'].textContent,
        ),
    };
    console.log(subvisu);

    // Parsing of observable events (like toggle color)
    const shapeParameters = parseShapeParameters(section);

    const initial = createVisuObject(subvisu, shapeParameters);

    // Convert object to an observable one
    const state = useLocalStore(() => initial);

    // Return of the react node
    return useObserver(() => (
        <div
            title={subvisu.name}
            style={{
                display:
                    state.display === 'visible' ? 'inline' : 'none',
                position: 'absolute',
                overflow: subvisu.clipFrame ? 'hidden' : 'visible',
                left: state.transformedCornerCoord.x1 - state.edge,
                top: state.transformedCornerCoord.y1 - state.edge,
                width: state.relCoord.width + 2 * state.edge,
                height: state.relCoord.height + 2 * state.edge,
                transform: state.visuScale,
                transformOrigin: '0 0',
            }}
        >
            <VisuElements visualisation={section}></VisuElements>
            {subvisu.showFrame ? (
                <svg width="100%" height="100%">
                    <rect
                        width="100%"
                        height="100%"
                        fill="none"
                        stroke={state.stroke}
                        strokeWidth="1"
                    ></rect>
                </svg>
            ) : null}
        </div>
    ));
};
