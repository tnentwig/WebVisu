import * as React from 'react';
import { HorizontalScrollbar } from './horizontal';
import { VerticalScrollbar } from './vertical';
import { IScrollbarShape } from '../../../Interfaces/javainterfaces';
import * as util from '../../Utils/utilfunctions';
import {
    parseShapeParameters,
    parseScrollUpdate,
} from '../Features/Events/eventManager';

type Props = {
    section: Element;
};

export const Scrollbar: React.FunctionComponent<Props> = ({
    section,
}) => {
    const rect = util.stringToArray(
        section.getElementsByTagName('rect')[0].innerHTML,
    );
    const horzPosition: boolean =
        rect[1] - rect[0] > rect[3] - rect[2];
    // Parsing of the fixed parameters
    const scrollbar: IScrollbarShape = {
        shape: 'scrollbar',
        rect: rect,
        horzPosition: horzPosition,
        tooltip:
            section.getElementsByTagName('tooltip').length > 0
                ? util.parseText(
                      section.getElementsByTagName('tooltip')[0]
                          .textContent,
                  )
                : '',
    };

    // Parsing of observable events
    const shapeParameters = parseShapeParameters(section);
    // Parse the scroll update function
    const update = parseScrollUpdate(section);
    // Return of the react node
    if (horzPosition) {
        return (
            <HorizontalScrollbar
                shape={scrollbar}
                shapeParameters={shapeParameters}
                updateFunction={update}
            ></HorizontalScrollbar>
        );
    } else {
        return (
            <VerticalScrollbar
                shape={scrollbar}
                shapeParameters={shapeParameters}
                updateFunction={update}
            ></VerticalScrollbar>
        );
    }
};
