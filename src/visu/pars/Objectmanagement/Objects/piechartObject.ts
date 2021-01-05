import ComSocket from '../../../communication/comsocket';
import { IPiechartObject } from '../../../Interfaces/jsinterfaces';
import { IPiechartShape } from '../../../Interfaces/javainterfaces';
import {
    numberToHexColor,
    computeMinMaxCoord,
    pointArrayToPiechartString,
} from '../../Utils/utilfunctions';

export function createPiechartObject(
    piechartShape: IPiechartShape,
    dynamicElements: Map<string, string[][]>,
): IPiechartObject {
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left
    const absCornerCoord = {
        x1: piechartShape.rect[0],
        y1: piechartShape.rect[1],
        x2: piechartShape.rect[2],
        y2: piechartShape.rect[3],
    };
    // absCenterCoord are the coordinates of the rotation and scale center
    const absCenterCoord = {
        x: piechartShape.center[0],
        y: piechartShape.center[1],
    };
    // relCoord are the width and the height in relation the div
    const relCoord = {
        width: piechartShape.rect[2] - piechartShape.rect[0],
        height: piechartShape.rect[3] - piechartShape.rect[1],
    };
    // the relCenterCoord are the coordinates of the midpoint of the div
    const relMidpointCoord = {
        x: (piechartShape.rect[2] - piechartShape.rect[0]) / 2,
        y: (piechartShape.rect[3] - piechartShape.rect[1]) / 2,
    };
    // The lineWidth is 0 in the xml if border width is 1 in the codesys dev env. Otherwise lineWidth is equal to the target border width. Very strange.
    const edge =
        piechartShape.lineWidth === 0 ? 1 : piechartShape.lineWidth;
    // Compute the strokeWidth through hasFrameColor
    const lineWidth = piechartShape.hasFrameColor ? edge : 0;
    // Compute the fill color through hasFillColor
    const fillColor = piechartShape.hasInsideColor
        ? piechartShape.fillColor
        : 'none';
    // Tooltip
    const tooltip = piechartShape.tooltip;
    const relPoints = [] as number[][];

    // The polyshape specific values will be generated if necessary
    piechartShape.points.forEach(function (item, index) {
        relPoints.push([
            item[0] - absCornerCoord.x1,
            item[1] - absCornerCoord.y1,
        ]);
    });
    // Calculate the init angles
    const v1 = [relPoints[2][0]- relPoints[0][0], relPoints[2][1]- relPoints[0][1]];
    const v2 = [relPoints[3][0]- relPoints[0][0], relPoints[3][1]- relPoints[0][1]];

    const abs1 = v1[0]/Math.sqrt(Math.pow(v1[0], 2)+Math.pow(v1[1], 2));
    const abs2 = v2[0]/Math.sqrt(Math.pow(v2[0], 2)+Math.pow(v2[1], 2));

    const sign1 = v1[1] >= 0 ? -1 : 1;
    const sign2 = v2[1] >= 0 ? -1 : 1;

    const startAngle = sign1*(Math.acos(abs1)*57.2957795);
    const endAngle = sign2*(Math.acos(abs2)*57.2957795);

    // Create an object with the initial parameters
    const initial: IPiechartObject = {
        // Variables will be initialised with the parameter values
        normalFillColor: piechartShape.fillColor,
        alarmFillColor: piechartShape.fillColorAlarm,
        normalFrameColor: piechartShape.frameColor,
        alarmFrameColor: piechartShape.frameColorAlarm,
        hasFillColor: piechartShape.hasInsideColor,
        hasFrameColor: piechartShape.hasFrameColor,
        lineWidth: lineWidth,
        // Positional arguments
        absCornerCoord: absCornerCoord,
        absCenterCoord: absCenterCoord,
        absPoints: piechartShape.points,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        xpos: 0,
        ypos: 0,
        scale: 1000, // a scale of 1000 means a representation of 1:1
        angle: 0,
        // Activate / deactivate input
        eventType: 'visible',
        // Computed
        fill: fillColor,
        edge: edge,
        stroke: piechartShape.frameColor,
        strokeDashArray: '0',
        display: 'visible' as any,
        alarm: false,
        tooltip: tooltip,
        strokeWidth: lineWidth,
        // Transformed corner coordinates, relative width and height
        transformedCornerCoord: absCornerCoord,
        relCoord: relCoord,
        relMidpointCoord: relMidpointCoord,
        relPoints: relPoints,
        // Variables for piechart
        startAngle: startAngle,
        endAngle: endAngle,
        piechartPath: '',
        // Access variables
        writeAccess: true,
        readAccess: true,
    };

    // Processing the variables for visual elements
    // A <expr-..-> tag initiate a variable, const or a placeholder
    // We have to implement the const value, the variable or the placeholdervalue if available for the static value
    // Polyshapes and Simpleshapes have the same <expr-...> possibilities

    if (dynamicElements.has('expr-toggle-color')) {
        const element = dynamicElements.get('expr-toggle-color');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            return value;
        };
        Object.defineProperty(initial, 'alarm', {
            get: () => wrapperFunc(),
        });
    }
    // 2) Set fill color
    if (dynamicElements.has('expr-fill-color')) {
        const element = dynamicElements!.get('expr-fill-color');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            const hexcolor = numberToHexColor(value);
            return hexcolor;
        };
        Object.defineProperty(initial, 'normalFillColor', {
            get: () => wrapperFunc(),
        });
    }
    // 3) Set alarm color
    if (dynamicElements.has('expr-fill-color-alarm')) {
        const element = dynamicElements!.get('expr-fill-color-alarm');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            const hexcolor = numberToHexColor(value);
            return hexcolor;
        };
        Object.defineProperty(initial, 'alarmFillColor', {
            get: () => wrapperFunc(),
        });
    }
    // 4) Set frame color
    if (dynamicElements.has('expr-frame-color')) {
        const element = dynamicElements!.get('expr-frame-color');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            const hexcolor = numberToHexColor(value);
            return hexcolor;
        };
        Object.defineProperty(initial, 'normalFrameColor', {
            get: () => wrapperFunc(),
        });
    }
    // 5) Set alarm frame color
    if (dynamicElements.has('expr-frame-color-alarm')) {
        const element = dynamicElements!.get('expr-frame-color-alarm');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            const hexcolor = numberToHexColor(value);
            return hexcolor;
        };
        Object.defineProperty(initial, 'alarmFrameColor', {
            get: () => wrapperFunc(),
        });
    }

    // 6) Set invisible state
    if (dynamicElements.has('expr-invisible')) {
        const element = dynamicElements!.get('expr-invisible');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = Number(returnFunc());
            if (value !== null && typeof value !== 'undefined') {
                if (value === 0) {
                    return 'visible';
                } else {
                    return 'hidden';
                }
            } else {
                return 'visible';
            }
        };
        Object.defineProperty(initial, 'display', {
            get: () => wrapperFunc(),
        });
    }
    // 7) Set fill flag state
    if (dynamicElements.has('expr-fill-flags')) {
        const element = dynamicElements!.get('expr-fill-flags');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = Number(returnFunc());
            if (value !== null && typeof value !== 'undefined') {
                if (value === 0) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        };
        Object.defineProperty(initial, 'hasFillColor', {
            get: () => wrapperFunc(),
        });
    }
    // 8) Set frame flag state
    if (dynamicElements.has('expr-frame-flags')) {
        const element = dynamicElements!.get('expr-frame-flags');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'hasFrameColor', {
            get: function () {
                const value = Number(returnFunc());
                return (value & 8) === 0;
            },
        });
        Object.defineProperty(initial, 'strokeDashArray', {
            get: function () {
                const value = Number(returnFunc());
                if (value === 4) {
                    return '8,2,2,2,2,2';
                } else if (value === 3) {
                    return '8,4,2,4';
                } else if (value === 2) {
                    return '2, 2';
                } else if (value === 1) {
                    return '13, 5';
                } else {
                    return '0';
                }
            },
        });
    }
    // 9) line-width
    if (dynamicElements.has('expr-line-width')) {
        const element = dynamicElements!.get('expr-line-width');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            const width = Number(value);
            if (width === 0) {
                return 1;
            } else {
                return width;
            }
        };
        Object.defineProperty(initial, 'lineWidth', {
            get: () => wrapperFunc(),
        });
    }

    // 10) Left-Position
    if (dynamicElements.has('expr-left')) {
        const element = dynamicElements!.get('expr-left');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'left', {
            get: () => returnFunc(),
        });
    }
    // 11) Right-Position
    if (dynamicElements.has('expr-right')) {
        const element = dynamicElements!.get('expr-right');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'right', {
            get: () => returnFunc(),
        });
    }
    // 12) Top-Position
    if (dynamicElements.has('expr-top')) {
        const element = dynamicElements!.get('expr-top');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'top', {
            get: () => returnFunc(),
        });
    }
    // 13) Bottom-Position
    if (dynamicElements.has('expr-bottom')) {
        const element = dynamicElements!.get('expr-bottom');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'bottom', {
            get: () => returnFunc(),
        });
    }
    // 14) x-Position
    if (dynamicElements.has('expr-xpos')) {
        const element = dynamicElements!.get('expr-xpos');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'xpos', {
            get: () => returnFunc(),
        });
    }
    // 15) y-Position
    if (dynamicElements.has('expr-ypos')) {
        const element = dynamicElements!.get('expr-ypos');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'ypos', {
            get: () => returnFunc(),
        });
    }
    // 16) Scaling
    if (dynamicElements.has('expr-scale')) {
        const element = dynamicElements!.get('expr-scale');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'scale', {
            get: () => returnFunc(),
        });
    }
    // 17) Rotating
    if (dynamicElements.has('expr-angle')) {
        const element = dynamicElements!.get('expr-angle');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'angle', {
            get: () => returnFunc(),
        });
    }
    // 18) Tooltip
    if (dynamicElements.has('expr-tooltip-display')) {
        const element = dynamicElements!.get('expr-tooltip-display');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'tooltip', {
            get: () => returnFunc(),
        });
    }
    // 19) Deactivate Input
    if (dynamicElements.has('expr-input-disabled')) {
        const element = dynamicElements!.get('expr-input-disabled');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            if (value === '1') {
                return 'none';
            } else {
                return 'visible';
            }
        };
        Object.defineProperty(initial, 'eventType', {
            get: () => wrapperFunc(),
        });
    }

    // Piechart specific stuff ( start- and endangle)
    if (dynamicElements.has('expr-angle1')) {
        const element = dynamicElements!.get('expr-angle1');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            return value % 360;
        };
        Object.defineProperty(initial, 'startAngle', {
            get: () => wrapperFunc(),
        });
    }
    if (dynamicElements.has('expr-angle2')) {
        const element = dynamicElements!.get('expr-angle2');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            return value % 360;
        };
        Object.defineProperty(initial, 'endAngle', {
            get: () => wrapperFunc(),
        });
    }

    // We have to compute the dependent values after all the required static values ​​have been replaced by variables, placeholders or constant values
    // E.g. the fillcolor depends on hasFillColor and alarm. This variables are called "computed" values. MobX will track their dependents and rerender the object by change.
    // We have to note that the rotation of polylines is not the same like simpleshapes. Simpleshapes keep their originally alignment, polyhapes transform every coordinate.

    // The fill color
    Object.defineProperty(initial, 'fill', {
        get: function () {
            if (initial.alarm) {
                return initial.alarmFillColor;
            } else {
                if (initial.hasFillColor) {
                    return initial.normalFillColor;
                } else {
                    return 'none';
                }
            }
        },
    });
    Object.defineProperty(initial, 'strokeWidth', {
        get: function () {
            return initial.lineWidth;
        },
    });

    Object.defineProperty(initial, 'stroke', {
        get: function () {
            if (initial.alarm) {
                return initial.alarmFrameColor;
            } else {
                if (initial.hasFrameColor) {
                    return initial.normalFrameColor;
                } else {
                    return 'none';
                }
            }
        },
    });

    Object.defineProperty(initial, 'edge', {
        get: function () {
            return initial.lineWidth;
        },
    });

    // The transformed corner coordinates depends on the shapetype. The rotating operation is different for simpleshapes and polyshapes
    Object.defineProperty(initial, 'transformedCornerCoord', {
        get: function () {
            let x1 = initial.absCornerCoord.x1;
            let x2 = initial.absCornerCoord.x2;
            let y1 = initial.absCornerCoord.y1;
            let y2 = initial.absCornerCoord.y2;
            const xc = initial.absCenterCoord.x;
            const yc = initial.absCenterCoord.y;
            // Scaling: the vector isnt normalized to 1
            const scale = initial.scale / 1000;
            x1 = scale * (x1 - xc) + xc;
            y1 = scale * (y1 - yc) + yc;
            x2 = scale * (x2 - xc) + xc;
            y2 = scale * (y2 - yc) + yc;
            // Rotating
            const sinphi = Math.sin(
                (initial.angle * (2 * Math.PI)) / 360,
            );
            const cosphi = Math.cos(
                (initial.angle * (2 * Math.PI)) / 360,
            );
            const xoff =
                (x1 - xc) * cosphi - (y1 - yc) * sinphi - (x1 - xc);
            const yoff =
                (x1 - xc) * sinphi + (y1 - yc) * cosphi - (y1 - yc);
            // Add the offset
            x1 += initial.xpos + initial.left + xoff;
            x2 += initial.xpos + initial.right + xoff;
            y1 += initial.ypos + initial.top + yoff;
            y2 += initial.ypos + initial.bottom + yoff;
            // Init the interim return object
            const coord = { x1: x1, y1: y1, x2: x2, y2: y2 };
            return coord;
        },
    });
    Object.defineProperty(initial, 'relCoord', {
        get: function () {
            const width = Math.abs(
                initial.transformedCornerCoord.x2 -
                    initial.transformedCornerCoord.x1,
            );
            const height = Math.abs(
                initial.transformedCornerCoord.y2 -
                    initial.transformedCornerCoord.y1,
            );
            return { width: width, height: height };
        },
    });

    Object.defineProperty(initial, 'relMidpointCoord', {
        get: function () {
            const x = initial.relCoord.width / 2;
            const y = initial.relCoord.height / 2;
            return { x: x, y: y };
        },
    });

    // Piechart path calculation
    if (['piechart'].includes(piechartShape.shape)) {
        Object.defineProperty(initial, 'piechartPath', {
            get: function () {
                const interim = pointArrayToPiechartString(
                    initial.relPoints,
                    initial.startAngle,
                    initial.endAngle,
                    initial.edge,
                );
                return interim;
            },
        });
    }

    // Define the object access variables
    Object.defineProperty(initial, 'writeAccess', {
        get: function () {
            const current = ComSocket.singleton().oVisuVariables.get(
                '.currentuserlevel',
            )!.value;
            const currentNum = Number(current);
            if (!isNaN(currentNum)) {
                if (
                    piechartShape.accessLevels[currentNum].includes(
                        'w',
                    )
                ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
    });

    Object.defineProperty(initial, 'readAccess', {
        get: function () {
            const current = ComSocket.singleton().oVisuVariables.get(
                '.currentuserlevel',
            )!.value;
            const currentNum = Number(current);
            if (!isNaN(currentNum)) {
                if (
                    piechartShape.accessLevels[currentNum].includes(
                        'r',
                    )
                ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
    });

    return initial;
}
