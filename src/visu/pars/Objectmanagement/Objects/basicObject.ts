import ComSocket from '../../../communication/comsocket';
import { IBasicObject } from '../../../Interfaces/jsinterfaces';
import { IBasicShape } from '../../../Interfaces/javainterfaces';
import { numberToHexColor } from '../../Utils/utilfunctions';
import { sprintf } from 'sprintf-js';

export function createBasicObject(
    basicShape: IBasicShape,
    shapeParameters: Map<string, string[][]>,
): IBasicObject {
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left
    const absCornerCoord = {
        x1: basicShape.rect[0],
        y1: basicShape.rect[1],
        x2: basicShape.rect[2],
        y2: basicShape.rect[3],
    };
    // absCenterCoord are the coordinates of the rotation and scale center
    const absCenterCoord = {
        x: basicShape.center[0],
        y: basicShape.center[1],
    };
    // relCoord are the width and the height in relation the div
    const relCoord = {
        width: basicShape.rect[2] - basicShape.rect[0],
        height: basicShape.rect[3] - basicShape.rect[1],
    };
    // the relCenterCoord are the coordinates of the midpoint of the div
    const relMidpointCoord = {
        x: (basicShape.rect[2] - basicShape.rect[0]) / 2,
        y: (basicShape.rect[3] - basicShape.rect[1]) / 2,
    };
    // The lineWidth is 0 in the xml if border width is 1 in the codesys dev env. Otherwise lineWidth is equal to the target border width. Very strange.
    const edge =
        basicShape.lineWidth === 0 ? 1 : basicShape.lineWidth;
    // Compute the strokeWidth through hasFrameColor
    const lineWidth = basicShape.hasFrameColor ? edge : 0;
    // Compute the fill color through has_fill_color
    const fillColor = basicShape.hasInsideColor
        ? basicShape.fillColor
        : 'none';
    // Tooltip
    const tooltip = basicShape.tooltip;

    const shape = basicShape.shape;

    // Create an object with the initial parameters
    const initial: IBasicObject = {
        // Variables will be initialised with the parameter values
        normalFillColor: basicShape.fillColor,
        alarmFillColor: basicShape.fillColorAlarm,
        normalFrameColor: basicShape.frameColor,
        alarmFrameColor: basicShape.frameColorAlarm,
        hasFillColor: basicShape.hasInsideColor,
        hasFrameColor: basicShape.hasFrameColor,
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
        // scale: 1000, // a scale of 1000 means a representation of 1:1
        scale: 10, // a scale of 10 means a representation of 1:1
        angle: 0,
        transform: 'scale(1) rotate(0)',
        // Activate / deactivate input
        eventType: 'visible',
        // Computed
        fill: fillColor,
        edge: edge,
        stroke: basicShape.frameColor,
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
    };

    // Processing the variables for visual elements
    // A <expr-..-> tag initiate a variable, const or a placeholder
    // We have to implement the const value, the variable or the placeholdervalue if available for the static value
    // Polyshapes and Simpleshapes have the same <expr-...> possibilities
    if (shapeParameters.has('expr-toggle-color')) {
        const element = shapeParameters.get('expr-toggle-color');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        const wrapperFunc = () => {
            const value = Number(returnFunc());
            if (value !== null && typeof value !== 'undefined') {
                return value !== 0;
            } else {
                return false;
            }
        };
        Object.defineProperty(initial, 'alarm', {
            get: () => wrapperFunc(),
        });
    }
    if (shape === 'button') {
        Object.defineProperty(initial, 'alarm', {
            get: function () {
                let value = 0;
                if (shapeParameters.has('expr-toggle-var')) {
                    const element = shapeParameters.get(
                        'expr-toggle-var',
                    );
                    value = Number(
                        ComSocket.singleton().evalFunction(element)(),
                    );
                } else if (shapeParameters.has('expr-tap-var')) {
                    const element = shapeParameters.get(
                        'expr-tap-var',
                    );
                    value = Number(
                        ComSocket.singleton().evalFunction(element)(),
                    );
                }
                if (value !== null && typeof value !== 'undefined') {
                    return value !== 0;
                } else {
                    return false;
                }
            },
        });
    }

    // 2) Set fill color
    if (shapeParameters.has('expr-fill-color')) {
        const element = shapeParameters!.get('expr-fill-color');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
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
    if (shapeParameters.has('expr-fill-color-alarm')) {
        const element = shapeParameters!.get('expr-fill-color-alarm');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
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
    if (shapeParameters.has('expr-frame-color')) {
        const element = shapeParameters!.get('expr-frame-color');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
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
    if (shapeParameters.has('expr-frame-color-alarm')) {
        const element = shapeParameters!.get(
            'expr-frame-color-alarm',
        );
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
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
    if (shapeParameters.has('expr-invisible')) {
        const element = shapeParameters!.get('expr-invisible');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
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

    // 7) The fill flags state: 0 = show color, >0 = ignore setting
    if (shapeParameters.has('expr-fill-flags')) {
        const element = shapeParameters!.get('expr-fill-flags');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
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

    // 8) Display of frame: 0 full, 1 dashed ( _ _ _ ), 2 dotted ( .... ), 3 dash-point ( _._._ ), 4 dash-point-point (_.._.. ), 8 blind out line
    if (shapeParameters.has('expr-frame-flags')) {
        const element = shapeParameters!.get('expr-frame-flags');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'hasFrameColor', {
            get: function () {
                const value = Number(returnFunc());
                return (value & 8) === 0;
            },
        });
        Object.defineProperty(initial, 'strokeDashArray', {
            get: function () {
                const value = Number(returnFunc());
                // if (initial.lineWidth <= 1) {
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
                // } else {
                //     return '0';
                // }
            },
        });
    }

    // 9) line-width
    if (shapeParameters.has('expr-line-width')) {
        const element = shapeParameters!.get('expr-line-width');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
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
    if (shapeParameters.has('expr-left')) {
        const element = shapeParameters!.get('expr-left');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'left', {
            get: () => returnFunc(),
        });
    }

    // 11) Right-Position
    if (shapeParameters.has('expr-right')) {
        const element = shapeParameters!.get('expr-right');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'right', {
            get: () => returnFunc(),
        });
    }

    // 12) Top-Position
    if (shapeParameters.has('expr-top')) {
        const element = shapeParameters!.get('expr-top');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'top', {
            get: () => returnFunc(),
        });
    }

    // 13) Bottom-Position
    if (shapeParameters.has('expr-bottom')) {
        const element = shapeParameters!.get('expr-bottom');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'bottom', {
            get: () => returnFunc(),
        });
    }

    // 14) x-Position
    if (shapeParameters.has('expr-xpos')) {
        const element = shapeParameters!.get('expr-xpos');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'xpos', {
            get: () => returnFunc(),
        });
    }

    // 15) y-Position
    if (shapeParameters.has('expr-ypos')) {
        const element = shapeParameters!.get('expr-ypos');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'ypos', {
            get: () => returnFunc(),
        });
    }

    // 16) Scaling
    if (shapeParameters.has('expr-scale')) {
        const element = shapeParameters!.get('expr-scale');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'scale', {
            get: () => returnFunc(),
        });
    }

    // 17) Rotating
    if (shapeParameters.has('expr-angle')) {
        const element = shapeParameters!.get('expr-angle');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'angle', {
            get: () => returnFunc(),
        });
    }

    // 18) Tooltip
    if (shapeParameters.has('expr-tooltip-display')) {
        const element = shapeParameters!.get('expr-tooltip-display');
        Object.defineProperty(initial, 'tooltip', {
            get: function () {
                let output = '';
                let parsedTooltip =
                    tooltip === null || typeof tooltip === 'undefined'
                        ? ''
                        : tooltip;
                const value = ComSocket.singleton().getFunction(
                    element,
                )();
                try {
                    if (
                        parsedTooltip.includes('|<|') ||
                        parsedTooltip.includes('|>|')
                    ) {
                        parsedTooltip = parsedTooltip.replace(
                            /\|<\|/g,
                            '<',
                        );
                        parsedTooltip = parsedTooltip.replace(
                            /\|>\|/g,
                            '>',
                        );
                        output = parsedTooltip;
                    } else {
                        output = sprintf(parsedTooltip, value);
                    }
                } catch {
                    if (
                        !(
                            !parsedTooltip ||
                            /^\s*$/.test(parsedTooltip)
                        )
                    ) {
                        output = parsedTooltip;
                    }
                }
                return output;
            },
        });
    }

    // 19) Deactivate Input
    if (shapeParameters.has('expr-input-disabled')) {
        const element = shapeParameters!.get('expr-input-disabled');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
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
    if (shapeParameters.has('expr-angle1')) {
        const element = shapeParameters!.get('expr-angle1');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        const wrapperFunc = () => {
            const value = returnFunc();
            return value % 360;
        };
        Object.defineProperty(initial, 'startAngle', {
            get: () => wrapperFunc(),
        });
    }
    if (shapeParameters.has('expr-angle2')) {
        const element = shapeParameters!.get('expr-angle2');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        const wrapperFunc = () => {
            const value = returnFunc();
            return value % 360;
        };
        Object.defineProperty(initial, 'endAngle', {
            get: () => wrapperFunc(),
        });
    }

    // We have to compute the dependent values after all the required static values have been replaced by variables, placeholders or constant values
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
            if (initial.alarm) {
                return initial.lineWidth === 0
                    ? 1
                    : initial.lineWidth;
            } else {
                return initial.hasFrameColor ? initial.lineWidth : 0;
            }
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

    Object.defineProperty(initial, 'transform', {
        get: function () {
            // scale(<x> [<y>])
            // rotate(<a> [<x> <y>])
            let transform =
                'scale(' + initial.scale / 10 + ') rotate(';
            if (initial.angle !== 0) {
                transform =
                    transform +
                    initial.angle +
                    ',' +
                    initial.relMidpointCoord.x +
                    ',' +
                    initial.relMidpointCoord.y +
                    ')';
            } else {
                transform = transform + '0)';
            }
            return transform;
        },
    });

    Object.defineProperty(initial, 'edge', {
        get: function () {
            return initial.lineWidth;
        },
    });

    // The transformed corner coordinates depends on the shapetype. The rotating operation is different for simpleshapes and polyshapes
    // Simpleshape:
    Object.defineProperty(initial, 'transformedCornerCoord', {
        get: function () {
            const x1 = initial.absCornerCoord.x1;
            const x2 = initial.absCornerCoord.x2;
            const y1 = initial.absCornerCoord.y1;
            const y2 = initial.absCornerCoord.y2;
            /*
            const xc = initial.absCenterCoord.x;
            const yc = initial.absCenterCoord.y;
            // Scaling: the vector isnt normalized to 1
            // const scale = initial.scale / 1000;
            const scale = initial.scale / 10;
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
            */
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
            if (!isNaN(currentNum)) {
                if (
                    basicShape.accessLevels[currentNum].includes('w')
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
                    basicShape.accessLevels[currentNum].includes('r')
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
