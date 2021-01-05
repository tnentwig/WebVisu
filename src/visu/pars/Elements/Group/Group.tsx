import * as React from 'react';
import { uid } from 'react-uid';
import ComSocket from '../../../communication/comsocket';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import { Button } from '../Button/button';
import { Bitmap } from '../Bitmap/bitmap';
import { SimpleShape } from '../Basicshapes/simpleshape';
import { PolyShape } from '../Basicshapes/polyshape';
import { stringToArray } from '../../Utils/utilfunctions';
import { parseShapeParameters } from '../Features/Events/eventManager';
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

function createInitial(section: Element) {
    // Create a mobx store for the variables that are dependent on the comsocket variables
    const initial = {
        display: 'hidden' as any,
    };

    const shapeParameters = parseShapeParameters(section);
    // Invisble?
    if (shapeParameters.has('expr-invisible')) {
        const element = shapeParameters!.get('expr-invisible');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        const wrapperFunc = () => {
            const value = returnFunc();
            if (typeof value !== 'undefined') {
                if (parseInt(value) === 0) {
                    return 'visible';
                } else {
                    return 'hidden';
                }
            }
        };
        Object.defineProperty(initial, 'display', {
            get: () => wrapperFunc(),
        });
    } else {
        initial.display = 'visible';
    }
    return initial;
}

export const Group: React.FunctionComponent<Props> = ({
    section,
}) => {
    let scale = 'scale(1)';
    const rectParent = stringToArray(
        section.getElementsByTagName('rect')[0].innerHTML,
    );
    // The rightdown corner coordinates of the subvisu will be stored
    const rightDownCorner = [0, 0];

    const visuObjects: Array<{
        obj: JSX.Element;
        id: string;
    }> = [];
    const addVisuObject = (visuObject: JSX.Element) => {
        const obj = { obj: visuObject, id: uid(visuObject) };
        visuObjects.push(obj);
    };

    for (let i = 0; i < section.children.length; i++) {
        const element = section.children[i];
        if (element.nodeName === 'element') {
            // Determine the type of the element
            const type = element.getAttribute('type');
            switch (type) {
                case 'simple': {
                    addVisuObject(
                        <SimpleShape
                            section={element}
                        ></SimpleShape>,
                    );
                    getDimension(
                        rightDownCorner,
                        stringToArray(
                            element.getElementsByTagName('rect')[0]
                                .innerHTML,
                        ),
                    );
                    break;
                }
                case 'polygon': {
                    addVisuObject(
                        <PolyShape
                            section={element}
                        ></PolyShape>,
                    );
                    const points = element.getElementsByTagName(
                        'point',
                    );
                    for (let i = 0; i < points.length; i++) {
                        getDimension(
                            rightDownCorner,
                            stringToArray(points[i].innerHTML),
                        );
                    }
                    break;
                }
                case 'button': {
                    addVisuObject(
                        <Button
                            section={element}
                        ></Button>,
                    );
                    getDimension(
                        rightDownCorner,
                        stringToArray(
                            element.getElementsByTagName('rect')[0]
                                .innerHTML,
                        ),
                    );
                    break;
                }
                case 'bitmap': {
                    addVisuObject(
                        <Bitmap
                            section={element}
                        ></Bitmap>,
                    );
                    getDimension(
                        rightDownCorner,
                        stringToArray(
                            element.getElementsByTagName('rect')[0]
                                .innerHTML,
                        ),
                    );
                    break;
                }
                case 'group': {
                    addVisuObject(
                        <Group
                            section={element}
                        ></Group>,
                    );
                    getDimension(
                        rightDownCorner,
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

    // Calculate the scalefactor
    const setY = rectParent[3] - rectParent[1];
    const setX = rectParent[2] - rectParent[0];
    const scaleOrientation = setX / setY;
    if (scaleOrientation < rightDownCorner[0] / rightDownCorner[1]) {
        const factor = setX / rightDownCorner[0];
        scale = 'scale(' + factor + ')';
    } else {
        const factor = setY / rightDownCorner[1];
        scale = 'scale(' + factor + ')';
    }

    // Convert object to an observable one
    const state = useLocalStore(() => createInitial(section));

    return useObserver(() =>
        state.display === 'visible' ? (
            <div
                style={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    left: rectParent[0],
                    top: rectParent[1],
                    width: rectParent[2] - rectParent[0],
                    height: rectParent[3] - rectParent[1],
                }}
            >
                <ErrorBoundary fallback={<div>Oh no</div>}>
                    <div
                        style={{
                            transformOrigin: 'left top',
                            transform: scale,
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
                </ErrorBoundary>
            </div>
        ) : null,
    );
};
