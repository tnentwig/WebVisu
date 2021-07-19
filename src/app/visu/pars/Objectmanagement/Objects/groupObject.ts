import ComSocket from '../../../communication/comsocket';
import { IGroupObject } from '../../../Interfaces/jsinterfaces';
import { IGroupShape } from '../../../Interfaces/javainterfaces';
import { numberToHexColor } from '../../Utils/utilfunctions';
import { sprintf } from 'sprintf-js';

export function createGroupObject(
    groupShape: IGroupShape,
    shapeParameters: Map<string, string[][]>,
): IGroupObject {
    // Compute the fill color through has_fill_color
    const fill = groupShape.hasInsideColor
        ? groupShape.fillColor
        : 'none';
    // Tooltip
    const tooltip = groupShape.tooltip;
    // AccessLevels
    const accessLevels = groupShape.accessLevels;
    // Create an object with the initial parameters
    const initial: IGroupObject = {
        // Variables will be initialised with the parameter values
        cornerCoord: {
            x1: groupShape.rect[0],
            y1: groupShape.rect[1],
            x2: groupShape.rect[2],
            y2: groupShape.rect[3],
        },
        centerCoord: {
            x: groupShape.center[0],
            y: groupShape.center[1],
        },
        isAlarm: false,
        fillColor: groupShape.fillColor,
        fillColorAlarm: groupShape.fillColorAlarm,
        frameColor: groupShape.frameColor,
        frameColorAlarm: groupShape.frameColorAlarm,
        hasFillColor: groupShape.hasInsideColor,
        hasFrameColor: groupShape.hasFrameColor,
        lineWidth: groupShape.lineWidth,
        // Positional arguments
        motionRelLeft: null,
        motionRelRight: null,
        motionRelTop: null,
        motionRelBottom: null,
        motionAbsX: null,
        motionAbsY: null,
        motionAbsScale: 1000, // a scale of 1000 means a representation of 1:1
        motionAbsAngle: 0,
        // Computed
        transformedCornerCoord: {
            // Transformed corner coordinates
            x1: groupShape.rect[0],
            y1: groupShape.rect[1],
            x2: groupShape.rect[2],
            y2: groupShape.rect[3],
        },
        transformedCenterCoord: {
            // Transformed center coordinates
            x: groupShape.center[0],
            y: groupShape.center[1],
        },
        transformedSize: {
            // Transformed width and height
            width:
                groupShape.rect[2] -
                groupShape.rect[0] +
                2 * groupShape.lineWidth,
            height:
                groupShape.rect[3] -
                groupShape.rect[1] +
                2 * groupShape.lineWidth,
        },
        transformedStartCoord: {
            // Transformed center coordinates
            left: 0,
            top: 0,
            x: 0,
            y: 0,
        },
        /// <div> variables
        pointerEvents: 'visible', // Activate / deactivate input
        visibility: 'visible', // Show / Hide the object
        /// <svg> variables
        fill: fill, // Inside color
        stroke: groupShape.frameColor, // Frame color
        strokeWidth: groupShape.hasFrameColor
            ? groupShape.lineWidth
            : 0, // Frame width
        strokeDashArray: '0', // Frame style
        transform: 'scale(1) rotate(0)', // Transform the object (scale and rotation only)
        tooltip: tooltip, // Tooltip of the object.
        // Access variables
        writeAccess: true,
        readAccess: true,
        
        // Group special
        groupScale: {
            // Group master scaling
            x: 1,
            y: 1,
        },
        groupSize: {
            // Group master size
            width: 0,
            height: 0,
        },
    };

    // Processing the variables for visual elements
    // A <expr-..-> tag initiate a variable, const or a placeholder
    // We have to implement the const value, the variable or the placeholdervalue if available for the static value
    // Polyshapes and Simpleshapes have the same <expr-...> possibilities

    // 1) Set alarm variable
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
        Object.defineProperty(initial, 'isAlarm', {
            get: () => wrapperFunc(),
        });
    }

    // 2) Set fill color (normal)
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
        Object.defineProperty(initial, 'fillColor', {
            get: () => wrapperFunc(),
        });
    }

    // 3) Set fill color (alarm)
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
        Object.defineProperty(initial, 'fillColorAlarm', {
            get: () => wrapperFunc(),
        });
    }

    // 4) Set frame color (normal)
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
        Object.defineProperty(initial, 'frameColor', {
            get: () => wrapperFunc(),
        });
    }

    // 5) Set frame color (alarm)
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
        Object.defineProperty(initial, 'frameColorAlarm', {
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
        Object.defineProperty(initial, 'visibility', {
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

    // 10) Motion relative left edge
    if (shapeParameters.has('expr-left')) {
        const element = shapeParameters!.get('expr-left');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'motionRelLeft', {
            get: () => returnFunc(),
        });
    }

    // 11) Motion relative right edge
    if (shapeParameters.has('expr-right')) {
        const element = shapeParameters!.get('expr-right');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'motionRelRight', {
            get: () => returnFunc(),
        });
    }

    // 12) Motion relative top edge
    if (shapeParameters.has('expr-top')) {
        const element = shapeParameters!.get('expr-top');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'motionRelTop', {
            get: () => returnFunc(),
        });
    }

    // 13) Motion relative bottom edge
    if (shapeParameters.has('expr-bottom')) {
        const element = shapeParameters!.get('expr-bottom');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'motionRelBottom', {
            get: () => returnFunc(),
        });
    }

    // 14) Motion absolute x-Offset
    if (shapeParameters.has('expr-xpos')) {
        const element = shapeParameters!.get('expr-xpos');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'motionAbsX', {
            get: () => returnFunc(),
        });
    }

    // 15) Motion absolute y-Offset
    if (shapeParameters.has('expr-ypos')) {
        const element = shapeParameters!.get('expr-ypos');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'motionAbsY', {
            get: () => returnFunc(),
        });
    }

    // 16) Motion absolute scale
    if (shapeParameters.has('expr-scale')) {
        const element = shapeParameters!.get('expr-scale');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'motionAbsScale', {
            get: function () {
                const scale = returnFunc();
                return scale === 0 ? 1 : scale;
            },
        });
    }

    // 17) Motion absolute angle
    if (shapeParameters.has('expr-angle')) {
        const element = shapeParameters!.get('expr-angle');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'motionAbsAngle', {
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
        Object.defineProperty(initial, 'pointerEvents', {
            get: () => wrapperFunc(),
        });
    }

    // We have to compute the dependent values after all the required static values have been replaced by variables, placeholders or constant values
    // E.g. the fillcolor depends on hasFillColor and alarm. This variables are called "computed" values. MobX will track their dependents and rerender the object by change.
    // We have to note that the rotation of polylines is not the same like simpleshapes. Simpleshapes keep their originally alignment, polyhapes transform every coordinate.

    // The fill color
    Object.defineProperty(initial, 'fill', {
        get: function () {
            if (initial.isAlarm) {
                return initial.fillColorAlarm;
            } else {
                if (initial.hasFillColor) {
                    return initial.fillColor;
                } else {
                    return 'none';
                }
            }
        },
    });

    Object.defineProperty(initial, 'strokeWidth', {
        get: function () {
            const lineWidth = initial.lineWidth;
            if (initial.isAlarm) {
                return lineWidth === 0 ? 1 : lineWidth;
            } else {
                return initial.hasFrameColor ? lineWidth : 0;
            }
        },
    });

    Object.defineProperty(initial, 'stroke', {
        get: function () {
            if (initial.isAlarm) {
                return initial.frameColorAlarm;
            } else {
                if (initial.hasFrameColor) {
                    return initial.frameColor;
                } else {
                    return 'none';
                }
            }
        },
    });

    // The transformed center coordinates.
    Object.defineProperty(initial, 'transformedCenterCoord', {
        get: function () {
            // The center coordinate are only shifted with the Motion absolute X-Offset and Y-Offset
            const centerCoord = initial.centerCoord;
            const x = centerCoord.x + initial.motionAbsX / 2;
            const y = centerCoord.y + initial.motionAbsY / 2;
            // Init the interim return object
            const coord = { x: x, y: y };
            return coord;
        },
    });

    // The transformed corner coordinates depends on the shapetype.
    Object.defineProperty(initial, 'transformedCornerCoord', {
        get: function () {
            // The corner coordinater are shifted with the Motion absolute X-Offset and Y-Offset
            const cornerCoord = initial.cornerCoord;
            let x1 = cornerCoord.x1;
            let y1 = cornerCoord.y1;
            let x2 = cornerCoord.x2;
            let y2 = cornerCoord.y2;
            const motionAbsX = initial.motionAbsX;
            if (
                motionAbsX !== null &&
                typeof motionAbsX !== undefined
            ) {
                x1 = x1 + motionAbsX;
                x2 = x2 + motionAbsX;
            }
            const motionAbsY = initial.motionAbsY;
            if (
                motionAbsY !== null &&
                typeof motionAbsY !== undefined
            ) {
                y1 = y1 + motionAbsY;
                y2 = y2 + motionAbsY;
            }

            // The corner are ovveriten by the Motion relative left, right, top and bottom
            const motionRelLeft = initial.motionRelLeft;
            const motionRelTop = initial.motionRelTop;
            const motionRelRight = initial.motionRelRight;
            const motionRelBottom = initial.motionRelBottom;
            if (
                motionRelLeft !== null &&
                typeof motionRelLeft !== undefined
            ) {
                x1 = x1 + motionRelLeft;
            }
            if (
                motionRelTop !== null &&
                typeof motionRelTop !== undefined
            ) {
                y1 = y1 + motionRelTop;
            }
            if (
                motionRelRight !== null &&
                typeof motionRelRight !== undefined
            ) {
                x2 = x2 + motionRelRight;
            }
            if (
                motionRelBottom !== null &&
                typeof motionRelBottom !== undefined
            ) {
                y2 = y2 + motionRelBottom;
            }
            // Init the interim return object
            const coord = { x1: x1, y1: y1, x2: x2, y2: y2 };
            return coord;
        },
    });

    // The transformed width.
    Object.defineProperty(initial, 'transformedSize', {
        get: function () {
            const transformedCornerCoord =
                initial.transformedCornerCoord;
            const width = Math.abs(
                transformedCornerCoord.x2 - transformedCornerCoord.x1,
            );
            const height = Math.abs(
                transformedCornerCoord.y2 - transformedCornerCoord.y1,
            );
            return { width: width, height: height };
        },
    });

    Object.defineProperty(initial, 'transform', {
        get: function () {
            // scale(<x> [<y>])
            // rotate(<a> [<x> <y>])
            let transform =
                'scale(' +
                initial.motionAbsScale / 1000 +
                ') rotate(';
            const motionAbsAngle = initial.motionAbsAngle;
            if (motionAbsAngle !== 0) {
                const transformedSize = initial.transformedSize;
                transform =
                    transform +
                    motionAbsAngle +
                    ',' +
                    transformedSize.width / 2 +
                    ',' +
                    transformedSize.height / 2 +
                    ')';
            } else {
                transform = transform + '0)';
            }
            return transform;
        },
    });

    Object.defineProperty(initial, 'transformedStartCoord', {
        get: function () {
            let left = 0;
            let top = 0;
            let x = 0;
            let y = 0;
            const motionAbsScale = initial.motionAbsScale;
            if (motionAbsScale !== 1000 && motionAbsScale !== 0) {
                const scale = motionAbsScale / 1000;
                const transformedSize = initial.transformedSize;
                left =
                    (transformedSize.width -
                        transformedSize.width * scale) /
                    2;
                top =
                    (transformedSize.height -
                        transformedSize.height * scale) /
                    2;
                x =
                    (transformedSize.width -
                        transformedSize.width * scale) /
                    (2 * scale);
                y =
                    (transformedSize.height -
                        transformedSize.height * scale) /
                    (2 * scale);
            }
            // Init the interim return object
            const coord = { left: left, top: top, x: x, y: y };
            return coord;
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
                if (accessLevels[currentNum].includes('w')) {
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
                if (accessLevels[currentNum].includes('r')) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        },
    });

    Object.defineProperty(initial, 'groupScale', {
        get: function () {
            // Calculate the scalefactor
            const transformedSize = initial.transformedSize;
            const rightDownCorner = groupShape.rightDownCorner;
            const scaleX = transformedSize.width / rightDownCorner[0];
            const scaleY = transformedSize.height / rightDownCorner[1];
            const scale = Math.min(scaleX, scaleY);
            if (groupShape.originalFrame) {
                return { x: 1, y: 1 };
            } else if (groupShape.isoFrame) {
                return { x: scale, y: scale };
            } else {
                return { x: scaleX, y: scaleY };
            }
        },
    });

    Object.defineProperty(initial, 'groupSize', {
        get: function () {
            const transformedSize = initial.transformedSize;
            const motionAbsScale = initial.motionAbsScale;
            const lineWidth = initial.lineWidth;
            let width = transformedSize.width * (motionAbsScale / 1000) + 2 * lineWidth;
            let height = transformedSize.height * (motionAbsScale / 1000) + 2 * lineWidth;
            const groupScale = initial.groupScale;
            width = width / groupScale.x;
            height = height / groupScale.y;
            return { width: width, height: height };
        },
    });

    return initial;
}
