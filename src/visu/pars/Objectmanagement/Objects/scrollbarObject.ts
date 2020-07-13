import ComSocket from '../../../communication/comsocket';
import { IScrollbarObject } from '../../../Interfaces/jsinterfaces';
import { IScrollbarShape } from '../../../Interfaces/javainterfaces';

export function createScrollbarObject(
    scrollbarShape: IScrollbarShape,
    dynamicElements: Map<string, string[][]>,
): IScrollbarObject {
    // absCornerCoord are the absolute coordinates of the <div> element in relation to the origin in the top left
    let absCornerCoord = {
        x1: scrollbarShape.rect[0],
        y1: scrollbarShape.rect[1],
        x2: scrollbarShape.rect[2],
        y2: scrollbarShape.rect[3],
    };
    // relCoord are the width and the height in relation the div
    let relCoord = {
        width: scrollbarShape.rect[2] - scrollbarShape.rect[0],
        height: scrollbarShape.rect[3] - scrollbarShape.rect[1],
    };
    let relCornerCoord = {
        x1: 0,
        y1: 0,
        x2: scrollbarShape.rect[2] - scrollbarShape.rect[0],
        y2: scrollbarShape.rect[3] - scrollbarShape.rect[1],
    };
    // the relCenterCoord are the coordinates of the midpoint of the div
    let relMidpointCoord = {
        x: (scrollbarShape.rect[2] - scrollbarShape.rect[0]) / 2,
        y: (scrollbarShape.rect[3] - scrollbarShape.rect[1]) / 2,
    };
    // Swap variables for horizontal and vertical attachement
    let swap1: number;
    let swap2: number;
    // Calc of the button and slidersize
    let a: number;
    let b1: number;
    let b2: number;

    // Define the swap values in depending on the orientation
    if (scrollbarShape.horz_position) {
        swap1 = relCoord.height;
        swap2 = relCoord.width;
    } else {
        swap1 = relCoord.width;
        swap2 = relCoord.height;
    }

    // Calculate the a, b1 and b2 parameters
    a = swap1;
    // button width is a quater of overall length, but maximum as long as height
    let interim = 0.25 * swap2;
    b1 = interim < a ? interim : a;
    // Scrollelement width is a sixth of overall length, but maximum as long as 2/3 height
    interim = 0.167 * swap2;
    b2 = interim < 0.667 * a ? interim : 0.667 * a;

    // Create an object with the initial parameters
    let initial: IScrollbarObject = {
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
    };

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
    }

    if (dynamicElements.has('expr-lower-bound')) {
        let element = dynamicElements!.get('expr-lower-bound');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            return Number(value);
        };
        Object.defineProperty(initial, 'lowerBound', {
            get: () => wrapperFunc(),
        });
    }

    if (dynamicElements.has('expr-upper-bound')) {
        let element = dynamicElements!.get('expr-upper-bound');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        let wrapperFunc = () => {
            let value = returnFunc();
            return Number(value);
        };
        Object.defineProperty(initial, 'upperBound', {
            get: () => wrapperFunc(),
        });
    }

    if (dynamicElements.has('expr-tooltip-display')) {
        let element = dynamicElements!.get('expr-tooltip-display');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'tooltip', {
            get: () => returnFunc(),
        });
    }

    if (dynamicElements.has('expr-tap-var')) {
        let element = dynamicElements!.get('expr-tap-var');
        let returnFunc = ComSocket.singleton().evalFunction(element);
        Object.defineProperty(initial, 'value', {
            get: () => returnFunc(),
        });
    }

    if (scrollbarShape.horz_position) {
        Object.defineProperty(initial, 'scrollvalue', {
            get: function () {
                let interval = Math.abs(
                    initial.upperBound - initial.lowerBound,
                );
                if (interval !== 0) {
                    if (initial.lowerBound < initial.upperBound) {
                        let interim =
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
                        let interim =
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
                let interval = Math.abs(
                    initial.upperBound - initial.lowerBound,
                );
                if (interval !== 0) {
                    if (initial.lowerBound < initial.upperBound) {
                        let interim =
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
                        let interim =
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
