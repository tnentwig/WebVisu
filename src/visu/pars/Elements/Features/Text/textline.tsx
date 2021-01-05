import * as React from 'react';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import ComSocket from '../../../../communication/comsocket';

type Props = {
    textLine: string;
    section: Element;
    textParameters: Map<string, string[][]>;
    numberOfLines: number;
    firstItem: boolean;
};

export const Textline: React.FunctionComponent<Props> = ({
    section,
    textParameters,
    textLine,
    numberOfLines,
    firstItem,
}) => {
    const textAlignHorz = section.getElementsByTagName(
        'text-align-horz',
    )[0].innerHTML;
    const textAlignVert = section.getElementsByTagName(
        'text-align-vert',
    )[0].innerHTML;
    const initial = {
        // local variables
        textVariable: '',
        textAlignHorz: textAlignHorz,
        textAlignVert: textAlignVert,
        // tspan variables
        xPos: '50%',
        deltaY: '0',
        visibility: '0',
        textOutput: '',
    };

    if (textParameters.has('expr-text-flags')) {
        const element = textParameters!.get('expr-text-flags');
        Object.defineProperty(initial, 'textAlignHorz', {
            get: function () {
                const value = Number(
                    ComSocket.singleton().evalFunction(element)(),
                );
                // we only need the bit 0 to 2 = 0x0000_0111 (7)
                switch (value & 7) {
                    case 1: {
                        return 'left';
                        // break;
                    }
                    case 2: {
                        return 'right';
                        // break;
                    }
                    case 4: {
                        return 'center';
                        // break;
                    }
                    default: {
                        return 'left'; // This is the standard if passed textflag isn't correct
                    }
                }
            },
        });
        Object.defineProperty(initial, 'textAlignVert', {
            get: function () {
                const value = Number(
                    ComSocket.singleton().evalFunction(element)(),
                );
                // we only need the bit 3 to 5 = 0x0011_1000 (56)
                switch (value & 56) {
                    case 8: {
                        return 'top';
                        // break;
                    }
                    case 16: {
                        return 'bottom';
                        // break;
                    }
                    case 32: {
                        return 'center';
                        // break;
                    }
                    default: {
                        return 'top'; // This is the standard if passed textflag isn't correct
                    }
                }
            },
        });
    }

    Object.defineProperty(initial, 'xPos', {
        get: function () {
            const position =
                initial.textAlignHorz === 'center'
                    ? '50%'
                    : initial.textAlignHorz === 'right'
                    ? '100%'
                    : '0%';
            return position;
        },
    });

    Object.defineProperty(initial, 'deltaY', {
        get: function () {
            if (firstItem) {
                const position =
                    initial.textAlignVert === 'center'
                        ? 0.3 - 1.2 * ((numberOfLines - 1) / 2) + 'em'
                        : initial.textAlignVert === 'bottom'
                        ? numberOfLines > 1
                            ? '-' + 1.2 * (numberOfLines - 1) + 'em'
                            : '0em'
                        : '0em';
                return position;
            } else {
                return '1.2em';
            }
        },
    });

    Object.defineProperty(initial, 'visibility', {
        get: function () {
            const value = textLine === '' ? 'hidden' : 'visible';
            return value;
        },
    });

    // The text variable:
    Object.defineProperty(initial, 'textOutput', {
        get: function () {
            return textLine === '' ? '.' : textLine;
        },
    });

    const state = useLocalStore(() => initial);

    return useObserver(() => (
        <tspan
            x={state.xPos}
            dy={state.deltaY}
            visibility={state.visibility}
        >
            {state.textOutput}
        </tspan>
    ));
};
