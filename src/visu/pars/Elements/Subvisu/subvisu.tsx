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
    const children = section.children;
    const referenceObject: { [id: string]: Element } = {};
    for (let i = 0; i < children.length; i++) {
        referenceObject[children[i].nodeName] = children[i];
    }

    const subvisu: ISubvisuShape = {
        shape: 'subvisu',
        hasInsideColor: util.stringToBoolean(
            referenceObject['has-inside-color'].textContent,
        ),
        fillColor: util.rgbToHexString(
            referenceObject['fill-color'].textContent,
        ),
        fillColorAlarm: util.rgbToHexString(
            referenceObject['fill-color-alarm'].textContent,
        ),
        hasFrameColor: util.stringToBoolean(
            referenceObject['has-frame-color'].textContent,
        ),
        frameColor: util.rgbToHexString(
            referenceObject['frame-color'].textContent,
        ),
        frameColorAlarm: util.rgbToHexString(
            referenceObject['frame-color-alarm'].textContent,
        ),
        lineWidth: Number(referenceObject['line-width'].textContent),
        elementId: referenceObject['elem-id'].textContent,
        rect: util.stringToArray(referenceObject['rect'].textContent),
        center: util.stringToArray(
            referenceObject['center'].textContent,
        ),
        hiddenInput: util.stringToBoolean(
            referenceObject['hidden-input'].textContent,
        ),
        enableTextInput: util.stringToBoolean(
            referenceObject['enable-text-input'].textContent,
        ),
        visuName: referenceObject['name'].textContent,
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
        visuSize: util.stringToArray(
            referenceObject['size'].textContent,
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

    // Parsing of observable events (like toggle color)
    const dynamicShapeParameters = parseShapeParameters(section);

    const initial = createVisuObject(subvisu, dynamicShapeParameters);

    // Convert object to an observable one
    const state = useLocalStore(() => initial);

    // Return of the react node
    return useObserver(() => (
        <div
            title={subvisu.visuName}
            style={{
                display:
                    state.display === 'visible' ? 'inline' : 'none',
                position: 'absolute',
                left: state.transformedCornerCoord.x1 - state.edge,
                top: state.transformedCornerCoord.y1 - state.edge,
                width: state.relCoord.width + 2 * state.edge,
                height: state.relCoord.height + 2 * state.edge,
                transform: state.visuScale,
                transformOrigin: '0 0',
            }}
        >
            <VisuElements visualisation={section}></VisuElements>
        </div>
    ));
};
