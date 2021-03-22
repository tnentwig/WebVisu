import ComSocket from '../../../communication/comsocket';
import { ISliderObject } from '../../../Interfaces/jsinterfaces';
import { ISliderShape } from '../../../Interfaces/javainterfaces';
import { sprintf } from 'sprintf-js';

export function createSliderObject(
    sliderShape: ISliderShape,
    shapeParameters: Map<string, string[][]>,
): ISliderObject {
    /* 
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left
    const absCornerCoord = {
        x1: sliderShape.rect[0],
        y1: sliderShape.rect[1],
        x2: sliderShape.rect[2],
        y2: sliderShape.rect[3],
    };
    // relCoord are the width and the height in relation the div
    const relCoord = {
        width: sliderShape.rect[2] - sliderShape.rect[0],
        height: sliderShape.rect[3] - sliderShape.rect[1],
    };
    const relCornerCoord = {
        x1: 0,
        y1: 0,
        x2: sliderShape.rect[2] - sliderShape.rect[0],
        y2: sliderShape.rect[3] - sliderShape.rect[1],
    };
    // the relCenterCoord are the coordinates of the midpoint of the div
    const relMidpointCoord = {
        x: (sliderShape.rect[2] - sliderShape.rect[0]) / 2,
        y: (sliderShape.rect[3] - sliderShape.rect[1]) / 2,
    };

    // Swap variables for horizontal and vertical attachement
    let swap1: number;
    let swap2: number;

    // Define the swap values in depending on the orientation
    if (sliderShape.isHorizontal) {
        swap1 = relCoord.height;
        swap2 = relCoord.width;
    } else {
        swap1 = relCoord.width;
        swap2 = relCoord.height;
    }
    */
    const width = sliderShape.rect[2] - sliderShape.rect[0];
    const height = sliderShape.rect[3] - sliderShape.rect[1];

    const swap1 = sliderShape.isHorizontal ? height : width;
    const swap2 = sliderShape.isHorizontal ? width : height;

    // button width is a quater of overall length, but maximum as long as height
    const interim = 0.25 * Math.max(width, height);
    const buttonSize =
        interim < Math.min(width, height)
            ? interim
            : Math.min(width, height);
    // Scrollelement width is a sixth of overall length, but maximum as long as 2/3 height
    //interim = 0.167 * Math.max(width, height);
    //const sliderSize = interim < 0.667 * Math.min(width, height) ? interim : 0.667 * Math.min(width, height);
    const sliderSize = 0.667 * buttonSize;

    // Tooltip
    const tooltip = sliderShape.tooltip;
    // AccessLevels
    const accessLevels = sliderShape.accessLevels;
    // Create an object with the initial parameters
    const initial: ISliderObject = {
        // Variables will be initialised with the parameter values
        cornerCoord: {
            x1: sliderShape.rect[0],
            y1: sliderShape.rect[1],
            x2: sliderShape.rect[2],
            y2: sliderShape.rect[3],
        },
        centerCoord: {
            x: sliderShape.center[0],
            y: sliderShape.center[1],
        },
        size: {
            width: width,
            height: height,
        },
        // Variables for slider
        minimumValue: 0,
        slider: 0,
        maximumValue: 0,
        sliderValue: 0,
        buttonSize: buttonSize, // Dimesions of the outer buttons
        sliderSize: sliderSize, // Dimesions of the slider
        // Computed
        /// <div> variables
        visibility: 'visible', // Show / Hide the object
        /// <svg> variables
        tooltip: tooltip, // Tooltip of the object.
        // Access variables
        writeAccess: true,
        readAccess: true,
    };

    // Processing the variables for visual elements
    // A <expr-..-> tag initiate a variable, const or a placeholder
    // We have to implement the const value, the variable or the placeholdervalue if available for the static value
    // Polyshapes and Simpleshapes have the same <expr-...> possibilities

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

    // We have to compute the dependent values after all the required static values have been replaced by variables, placeholders or constant values
    // E.g. the fillcolor depends on hasFillColor and alarm. This variables are called "computed" values. MobX will track their dependents and rerender the object by change.
    // We have to note that the rotation of polylines is not the same like simpleshapes. Simpleshapes keep their originally alignment, polyhapes transform every coordinate.

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

    if (shapeParameters.has('expr-lower-bound')) {
        const element = shapeParameters!.get('expr-lower-bound');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        const wrapperFunc = () => {
            const value = returnFunc();
            return Number(value);
        };
        Object.defineProperty(initial, 'minimumValue', {
            get: () => wrapperFunc(),
        });
    }

    if (shapeParameters.has('expr-upper-bound')) {
        const element = shapeParameters!.get('expr-upper-bound');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        const wrapperFunc = () => {
            const value = returnFunc();
            return Number(value);
        };
        Object.defineProperty(initial, 'maximumValue', {
            get: () => wrapperFunc(),
        });
    }

    if (shapeParameters.has('expr-tap-var')) {
        const element = shapeParameters!.get('expr-tap-var');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'slider', {
            get: () => returnFunc(),
        });
    }

    Object.defineProperty(initial, 'sliderValue', {
        get: function () {
            const interval = Math.abs(
                initial.maximumValue - initial.minimumValue,
            );
            if (interval !== 0) {
                const b = sliderShape.isHorizontal
                    ? initial.size.width
                    : initial.size.height;
                if (initial.minimumValue < initial.maximumValue) {
                    const interim =
                        ((b -
                            2 * initial.buttonSize -
                            initial.sliderSize) *
                            Math.abs(
                                initial.slider - initial.minimumValue,
                            )) /
                        interval;
                    return interim;
                } else {
                    const interim =
                        (b -
                            2 * initial.buttonSize -
                            initial.sliderSize) *
                        (1 -
                            Math.abs(
                                initial.slider - initial.maximumValue,
                            ) /
                                interval);
                    return interim;
                }
            } else {
                return 0;
            }
        },
    });
    /*
    if (sliderShape.isHorizontal) {
        Object.defineProperty(initial, 'sliderValue', {
            get: function () {
                const interval = Math.abs(
                    initial.maximumValue - initial.minimumValue,
                );
                if (interval !== 0) {
                    if (initial.minimumValue < initial.maximumValue) {
                        const interim =
                            ((initial.size.width -
                                2 * initial.b1 -
                                initial.sliderSize) *
                                Math.abs(
                                    initial.slider -
                                        initial.minimumValue,
                                )) /
                            interval;
                        return interim;
                    } else {
                        const interim =
                            (initial.size.width -
                                2 * initial.b1 -
                                initial.sliderSize) *
                            (1 -
                                Math.abs(
                                    initial.slider -
                                        initial.maximumValue,
                                ) /
                                    interval);
                        return interim;
                    }
                } else {
                    return 0;
                }
            },
        });
    } else {
        Object.defineProperty(initial, 'sliderValue', {
            get: function () {
                const interval = Math.abs(
                    initial.maximumValue - initial.minimumValue,
                );
                if (interval !== 0) {
                    if (initial.minimumValue < initial.maximumValue) {
                        const interim =
                            ((initial.size.height -
                                2 * initial.b1 -
                                initial.sliderSize) *
                                Math.abs(
                                    initial.slider -
                                        initial.minimumValue,
                                )) /
                            interval;
                        return interim;
                    } else {
                        const interim =
                            (initial.size.height -
                                2 * initial.b1 -
                                initial.sliderSize) *
                            (1 -
                                Math.abs(
                                    initial.slider -
                                        initial.maximumValue,
                                ) /
                                    interval);
                        return interim;
                    }
                } else {
                    return 0;
                }
            },
        });
    }
    */
    return initial;
}
