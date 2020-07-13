import * as React from 'react';
import { uid } from 'react-uid';
import ComSocket from '../../../communication/comsocket';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import { Button } from '../Button/button';
import { SimpleShape } from '../Basicshapes/simpleshape';
import { PolyShape } from '../Basicshapes/polyshape';
import { stringToArray } from '../../Utils/utilfunctions';
import { parseDynamicShapeParameters } from '../Features/Events/eventManager';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
    section: Element;
};

export const Group: React.FunctionComponent<Props> = React.memo(
    ({ section }) => {
        let scale = 'scale(1)';
        const rectParent = stringToArray(
            section.getElementsByTagName('rect')[0].innerHTML,
        );
        // The rightdown corner coordinates of the subvisu will be stored
        let rightDownCorner = [0, 0];

        let visuObjects: Array<{ obj: JSX.Element; id: string }> = [];
        const addVisuObject = (visuObject: JSX.Element) => {
            let obj = { obj: visuObject, id: uid(visuObject) };
            visuObjects.push(obj);
        };

        for (let i = 0; i < section.children.length; i++) {
            let element = section.children[i];
            if (element.nodeName === 'element') {
                // Determine the type of the element
                let type = element.getAttribute('type');
                switch (type) {
                    case 'simple':
                        addVisuObject(
                            <SimpleShape
                                section={element}
                            ></SimpleShape>,
                        );
                        getDimension(
                            rightDownCorner,
                            stringToArray(
                                element.getElementsByTagName(
                                    'rect',
                                )[0].innerHTML,
                            ),
                        );
                        break;
                    case 'polygon':
                        addVisuObject(
                            <PolyShape section={element}></PolyShape>,
                        );
                        let points = element.getElementsByTagName(
                            'point',
                        );
                        for (let i = 0; i < points.length; i++) {
                            getDimension(
                                rightDownCorner,
                                stringToArray(points[i].innerHTML),
                            );
                        }
                        break;
                    case 'button':
                        addVisuObject(
                            <Button section={element}></Button>,
                        );
                        break;
                    case 'group':
                        addVisuObject(
                            <Group section={element}></Group>,
                        );
                        getDimension(
                            rightDownCorner,
                            stringToArray(
                                element.getElementsByTagName(
                                    'rect',
                                )[0].innerHTML,
                            ),
                        );
                        break;
                }
            }
        }

        // Calculate the scalefactor
        let setY = rectParent[3] - rectParent[1];
        let setX = rectParent[2] - rectParent[0];
        let scaleOrientation = setX / setY;
        if (
            scaleOrientation <
            rightDownCorner[0] / rightDownCorner[1]
        ) {
            let factor = setX / rightDownCorner[0];
            scale = 'scale(' + factor + ')';
        } else {
            let factor = setY / rightDownCorner[1];
            scale = 'scale(' + factor + ')';
        }

        // Convert object to an observable one
        const state = useLocalStore(() => createInitial(section));

        return useObserver(() =>
            state.display == 'visible' ? (
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
                            {visuObjects.map((element, index) => (
                                <React.Fragment key={element.id}>
                                    {element.obj}
                                </React.Fragment>
                            ))}
                        </div>
                    </ErrorBoundary>
                </div>
            ) : null,
        );
    },
);

function getDimension(
    actualDimension: Array<number>,
    newRect: Array<number>,
) {
    let len = newRect.length;
    if (len === 4) {
        actualDimension[0] < newRect[2]
            ? (actualDimension[0] = newRect[2])
            : (newRect[0] = newRect[0]);
        actualDimension[1] < newRect[3]
            ? (actualDimension[1] = newRect[3])
            : (newRect[1] = newRect[1]);
    } else if (len === 2) {
        for (let i = 0; i < 2; i++) {
            actualDimension[i] < newRect[i]
                ? (actualDimension[i] = newRect[0])
                : (newRect[0] = newRect[0]);
        }
    }
}

function createInitial(section: Element) {
    // Create a mobx store for the variables that are dependent on the comsocket variables
    let initial = {
        display: 'hidden' as any,
    };

    let dynamicElements = parseDynamicShapeParameters(section);
    // Invisble?
    if (dynamicElements.has('expr-invisible')) {
        let element = dynamicElements!.get('expr-invisible');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            if (value !== undefined) {
                if (value == 0) {
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
