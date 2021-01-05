import ComSocket from '../../../communication/comsocket';
import { ISubvisuObject } from '../../../Interfaces/jsinterfaces';
import { ISubvisuShape } from '../../../Interfaces/javainterfaces';
import { numberToHexColor } from '../../Utils/utilfunctions';

export function createSubvisuObject(
    subvisuShape: ISubvisuShape,
    dynamicElements: Map<string, string[][]>,
): ISubvisuObject {
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left
    const absCornerCoord = {
        x1: subvisuShape.rect[0],
        y1: subvisuShape.rect[1],
        x2: subvisuShape.rect[2],
        y2: subvisuShape.rect[3],
    };
    // absCenterCoord are the coordinates of the rotation and scale center
    const absCenterCoord = {
        x: subvisuShape.center[0],
        y: subvisuShape.center[1],
    };
    // relCoord are the width and the height in relation the div
    const relCoord = {
        width: subvisuShape.rect[2] - subvisuShape.rect[0],
        height: subvisuShape.rect[3] - subvisuShape.rect[1],
    };
    // the relCenterCoord are the coordinates of the midpoint of the div
    const relMidpointCoord = {
        x: (subvisuShape.rect[2] - subvisuShape.rect[0]) / 2,
        y: (subvisuShape.rect[3] - subvisuShape.rect[1]) / 2,
    };
    // The lineWidth is 0 in the xml if border width is 1 in the codesys dev env. Otherwise lineWidth is equal to the target border width. Very strange.
    const edge =
        subvisuShape.lineWidth === 0 ? 1 : subvisuShape.lineWidth;
    // Compute the strokeWidth through hasFrameColor
    const lineWidth = subvisuShape.hasFrameColor ? edge : 0;
    // Compute the fill color through hasFillColor
    const fillColor = subvisuShape.hasInsideColor
        ? subvisuShape.fillColor
        : 'none';
    // Tooltip
    const tooltip = subvisuShape.tooltip;

    // Create an object with the initial parameters
    const initial: ISubvisuObject = {
        // Variables will be initialised with the parameter values
        normalFillColor: subvisuShape.fillColor,
        alarmFillColor: subvisuShape.fillColorAlarm,
        normalFrameColor: subvisuShape.frameColor,
        alarmFrameColor: subvisuShape.frameColorAlarm,
        hasFillColor: subvisuShape.hasInsideColor,
        hasFrameColor: subvisuShape.hasFrameColor,
        lineWidth: lineWidth,
        // Positional arguments
        absCornerCoord: absCornerCoord,
        absCenterCoord: absCenterCoord,
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
        stroke: subvisuShape.frameColor,
        strokeDashArray: '0',
        display: 'visible' as any,
        alarm: false,
        tooltip: tooltip,
        strokeWidth: lineWidth,
        // Transformed corner coordinates, relative width and height
        transformedCornerCoord: absCornerCoord,
        relCoord: relCoord,
        relMidpointCoord: relMidpointCoord,
        // Access variables
        writeAccess: true,
        readAccess: true,
        // Scaling
        visuScale: 'scale(1)',
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
            const value = returnFunc();
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
    }
    // 7) Set fill flag state
    if (dynamicElements.has('expr-fill-flags')) {
        const element = dynamicElements!.get('expr-fill-flags');
        const returnFunc = ComSocket.singleton().evalFunction(element);
        const wrapperFunc = () => {
            const value = returnFunc();
            if (value == '1') {
                return false;
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
                const value = returnFunc() == '8' ? false : true;
                return value;
            },
        });
        Object.defineProperty(initial, 'strokeDashArray', {
            get: function () {
                const value = returnFunc();
                if (initial.lineWidth <= 1) {
                    if (value == '4') {
                        return '20,10,5,5,5,10';
                    } else if (value == '3') {
                        return '20,5,5,5';
                    } else if (value == '2') {
                        return '5,5';
                    } else if (value == '1') {
                        return '10,10';
                    } else {
                        return '0';
                    }
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
            if (width == 0) {
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
            if (value == '1') {
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
            if (initial.alarm == false) {
                if (initial.hasFillColor) {
                    return initial.normalFillColor;
                } else {
                    return 'none';
                }
            } else {
                return initial.alarmFillColor;
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
            if (initial.alarm == false) {
                if (initial.hasFrameColor) {
                    return initial.normalFrameColor;
                } else {
                    return 'none';
                }
            } else {
                return initial.alarmFrameColor;
            }
        },
    });

    Object.defineProperty(initial, 'edge', {
        get: function () {
            if (initial.hasFrameColor || initial.alarm) {
                if (initial.lineWidth == 0) {
                    return 1;
                } else {
                    return initial.lineWidth;
                }
            } else {
                return 0;
            }
        },
    });

    // The transformed corner coordinates depends on the shapetype. The rotating operation is different for simpleshapes and polyshapes
    // Simpleshape:
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
            /*
            if (x1 > x2){
                coord.x1 = x2;
                coord.x2 = x1;
            }
            if (y1 > y2){
                coord.y1 = y2;
                coord.y2 = y1;
            }
            */
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

    // Define the object access variables
    Object.defineProperty(initial, 'writeAccess', {
        get: function () {
            const current = ComSocket.singleton().oVisuVariables.get(
                '.currentuserlevel',
            )!.value;
            const currentNum = Number(current);
            if (currentNum !== NaN) {
                if (
                    subvisuShape.accessLevels[currentNum].includes(
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
            if (currentNum !== NaN) {
                if (
                    subvisuShape.accessLevels[currentNum].includes(
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

    Object.defineProperty(initial, 'visuScale', {
        get: function () {
            const xscaleFactor =
                relCoord.width / subvisuShape.visuSize[0];
            const yscaleFactor =
                relCoord.height / subvisuShape.visuSize[1];
            if (subvisuShape.originalFrame) {
                return 'scale(1)';
            } else if (subvisuShape.isoFrame) {
                return (
                    'scale(' +
                    Math.min(xscaleFactor, yscaleFactor).toString() +
                    ')'
                );
            } else {
                return (
                    'scale(' +
                    xscaleFactor.toString() +
                    ',' +
                    yscaleFactor.toString() +
                    ')'
                );
            }
        },
    });

    return initial;
}
