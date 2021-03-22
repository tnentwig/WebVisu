import * as React from 'react';
import * as util from '../../Utils/utilfunctions';
import { HorizontalSlider } from './SliderSubunits/horizontal';
import { VerticalSlider } from './SliderSubunits/vertical';
import { ISliderShape } from '../../../Interfaces/javainterfaces';
import {
    parseShapeParameters,
    parseScrollUpdate,
} from '../Features/Events/eventManager';

type Props = {
    section: Element;
};

export const Slider: React.FunctionComponent<Props> = ({
    section,
}) => {
    const rect = util.stringToArray(
        section.getElementsByTagName('rect')[0].innerHTML,
    );
    const isHorizontal: boolean =
        rect[1] - rect[0] >= rect[3] - rect[2];
    // Parsing of the fixed parameters
    const slider: ISliderShape = {
        // ICommonShape properties
        shape: 'slider',
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
                      section.getElementsByTagName('line-width')[0]
                          .innerHTML,
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
            section.getElementsByTagName('frame-color')[0].innerHTML,
        ),
        frameColorAlarm: util.rgbToHexString(
            section.getElementsByTagName('frame-color-alarm')[0]
                .innerHTML,
        ),
        fillColor: util.rgbToHexString(
            section.getElementsByTagName('fill-color')[0].innerHTML,
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
            section.getElementsByTagName('hidden-input')[0].innerHTML,
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

        // ISliderShape properties
        rect: rect,
        // ISliderShape computed values
        isHorizontal: isHorizontal,
    };

    // Parsing of observable events
    const shapeParameters = parseShapeParameters(section);
    // Parse the scroll update function
    const update = parseScrollUpdate(section);
    // Return of the react node
    if (isHorizontal) {
        return (
            <HorizontalSlider
                sliderShape={slider}
                shapeParameters={shapeParameters}
                updateFunction={update}
            ></HorizontalSlider>
        );
    } else {
        return (
            <VerticalSlider
                sliderShape={slider}
                shapeParameters={shapeParameters}
                updateFunction={update}
            ></VerticalSlider>
        );
    }
};
