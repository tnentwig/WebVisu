import ComSocket from '../../../communication/comsocket';
import { IScrollbarObject } from '../../../Interfaces/jsinterfaces';
import { IScrollbarShape } from '../../../Interfaces/javainterfaces';
import { sprintf } from 'sprintf-js';

export function createScrollbarObject(
    scrollbarShape: IScrollbarShape,
    shapeParameters: Map<string, string[][]>,
): IScrollbarObject {
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left
    const absCornerCoord = {
        x1: scrollbarShape.rect[0],
        y1: scrollbarShape.rect[1],
        x2: scrollbarShape.rect[2],
        y2: scrollbarShape.rect[3],
    };
    // relCoord are the width and the height in relation the div
    const relCoord = {
        width: scrollbarShape.rect[2] - scrollbarShape.rect[0],
        height: scrollbarShape.rect[3] - scrollbarShape.rect[1],
    };
    const relCornerCoord = {
        x1: 0,
        y1: 0,
        x2: scrollbarShape.rect[2] - scrollbarShape.rect[0],
        y2: scrollbarShape.rect[3] - scrollbarShape.rect[1],
    };
    // the relCenterCoord are the coordinates of the midpoint of the div
    const relMidpointCoord = {
        x: (scrollbarShape.rect[2] - scrollbarShape.rect[0]) / 2,
        y: (scrollbarShape.rect[3] - scrollbarShape.rect[1]) / 2,
    };
    // Swap variables for horizontal and vertical attachement
    let swap1: number;
    let swap2: number;

    // Define the swap values in depending on the orientation
    if (scrollbarShape.horzPosition) {
        swap1 = relCoord.height;
        swap2 = relCoord.width;
    } else {
        swap1 = relCoord.width;
        swap2 = relCoord.height;
    }

    // Calculate the a, b1 and b2 parameters
    const a = swap1;
    // button width is a quater of overall length, but maximum as long as height
    let interim = 0.25 * swap2;
    const b1 = interim < a ? interim : a;
    // Scrollelement width is a sixth of overall length, but maximum as long as 2/3 height
    interim = 0.167 * swap2;
    const b2 = interim < 0.667 * a ? interim : 0.667 * a;
    // Tooltip
    const tooltip = scrollbarShape.tooltip;

    // Create an object with the initial parameters
    const initial: IScrollbarObject = {
        // Positional parameters
        absCornerCoord: absCornerCoord,
        relCoord: relCoord,
        relCornerCoord: relCornerCoord,
        relMidpointCoord: relMidpointCoord,
        // Dimesions of the outer buttons and the slider
        a: a,
        b1: b1,
        b2: b2,
        // Variable
        lowerBound: 0,
        upperBound: 0,
        value: 0,
        scrollvalue: 0,
        display: 'visible',
        tooltip: tooltip,
    };

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

    if (shapeParameters.has('expr-lower-bound')) {
        const element = shapeParameters!.get('expr-lower-bound');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        const wrapperFunc = () => {
            const value = returnFunc();
            return Number(value);
        };
        Object.defineProperty(initial, 'lowerBound', {
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
        Object.defineProperty(initial, 'upperBound', {
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

    if (shapeParameters.has('expr-tap-var')) {
        const element = shapeParameters!.get('expr-tap-var');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'value', {
            get: () => returnFunc(),
        });
    }

    if (scrollbarShape.horzPosition) {
        Object.defineProperty(initial, 'scrollvalue', {
            get: function () {
                const interval = Math.abs(
                    initial.upperBound - initial.lowerBound,
                );
                if (interval !== 0) {
                    if (initial.lowerBound < initial.upperBound) {
                        const interim =
                            ((initial.relCoord.width -
                                2 * initial.b1 -
                                initial.b2) *
                                Math.abs(
                                    initial.value -
                                        initial.lowerBound,
                                )) /
                            interval;
                        return interim;
                    } else {
                        const interim =
                            (initial.relCoord.width -
                                2 * initial.b1 -
                                initial.b2) *
                            (1 -
                                Math.abs(
                                    initial.value -
                                        initial.upperBound,
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
        Object.defineProperty(initial, 'scrollvalue', {
            get: function () {
                const interval = Math.abs(
                    initial.upperBound - initial.lowerBound,
                );
                if (interval !== 0) {
                    if (initial.lowerBound < initial.upperBound) {
                        const interim =
                            ((initial.relCoord.height -
                                2 * initial.b1 -
                                initial.b2) *
                                Math.abs(
                                    initial.value -
                                        initial.lowerBound,
                                )) /
                            interval;
                        return interim;
                    } else {
                        const interim =
                            (initial.relCoord.height -
                                2 * initial.b1 -
                                initial.b2) *
                            (1 -
                                Math.abs(
                                    initial.value -
                                        initial.upperBound,
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

    return initial;
}
