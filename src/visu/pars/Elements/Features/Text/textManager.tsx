import * as util from '../../../Utils/utilfunctions';
import * as React from 'react';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import ComSocket from '../../../../communication/comsocket';
import { sprintf } from 'sprintf-js';
import { Textline } from './textline';
import { uid } from 'react-uid';

type Props = {
    section: Element;
    textParameters: Map<string, string[][]>;
    shapeParameters: Map<string, string[][]>;
};

export const Textfield: React.FunctionComponent<Props> = ({
    section,
    textParameters,
    shapeParameters,
}) => {
    // The static tags for the font
    const fontName = section.getElementsByTagName('font-name').length
        ? section.getElementsByTagName('font-name')[0].textContent
        : 'Arial';
    const fontHeight = Number(
        section.getElementsByTagName('font-height')[0].textContent,
    );
    const fontWeight = Number(
        section.getElementsByTagName('font-weight')[0].textContent,
    );
    const isItalic = util.stringToBoolean(
        section.getElementsByTagName('font-italic')[0].textContent,
    );
    const hasStrikeOut = util.stringToBoolean(
        section.getElementsByTagName('font-strike-out')[0]
            .textContent,
    );
    const hasUnderline = util.stringToBoolean(
        section.getElementsByTagName('font-underline')[0].textContent,
    );
    /*
    const charSet = Number(
        section.getElementsByTagName('font-char-set')[0].textContent,
    );
    */
    const fontColor = util.rgbToHexString(
        section.getElementsByTagName('font-color')[0].textContent,
    );
    // The static text flags
    const textAlignHorz = section.getElementsByTagName(
        'text-align-horz',
    )[0].textContent;
    const textAlignVert = section.getElementsByTagName(
        'text-align-vert',
    )[0].textContent;
    const text = section.getElementsByTagName('text-format')[0]
        .textContent;
    // The id is used for static language change with a .vis file
    /*
    const textId = Number(
        section.getElementsByTagName('text-id')[0].textContent,
    );
    */
    const language = localStorage.getItem('language').toLowerCase();
    // relCoord are the width and the height in relation the div
    const relCoord = {
        width: 0,
        height: 0,
    };
    // the relCenterCoord are the coordinates of the midpoint of the div
    const relMidpointCoord = {
        x: relCoord.width / 2,
        y: relCoord.height / 2,
    };

    const initial = {
        // Font variables
        fontHeight: fontHeight,
        fontWeight: fontWeight,
        fontColor: fontColor,
        fontName: fontName,
        hasUnderline: hasUnderline,
        isItalic: isItalic,
        hasStrikeOut: hasStrikeOut,
        // Text variables
        textAlignHorz: textAlignHorz,
        textAlignVert: textAlignVert,
        textVariable: '',
        textLines: '',
        // Computed Elements
        // Horizontal orientation has three arguments textAnchor and the relative x- and y-position
        textAnchor: 'middle',
        yPos: '50%',
        // Text manipulation
        dominantBaseline: '',
        fontStyle: 'normal',
        textDecoration: 'initial',
        // local variables
        relCoord: relCoord,
        relMidpointCoord: relMidpointCoord,
        scale: 10, // a scale of 10 means a representation of 1:1
        angle: 0,
        transform: 'scale(1) rotate(0)',
        language: language,
    };

    // relCoord are the width and the height in relation the div
    Object.defineProperty(initial, 'relCoord', {
        get: function () {
            const coord = { x1: 0, y1: 0, x2: 0, y2: 0 };
            if (section.getElementsByTagName('rect').length) {
                const rect = util.stringToArray(
                    section.getElementsByTagName('rect')[0].innerHTML,
                );
                coord.x1 = rect[0];
                coord.y1 = rect[1];
                coord.x2 = rect[2];
                coord.y2 = rect[3];
            }
            if (section.getElementsByTagName('point').length) {
                // Parsing the point coordinates
                const xmlPoints = section.getElementsByTagName(
                    'point',
                );
                let points: number[][];
                for (let i = 0; i < xmlPoints.length; i++) {
                    const point = util.stringToArray(
                        xmlPoints[i].innerHTML,
                    );
                    points.push(point);
                }
                // Auxiliary values
                const rect = util.computeMinMaxCoord(points);
                coord.x1 = rect[0];
                coord.y1 = rect[1];
                coord.x2 = rect[2];
                coord.y2 = rect[3];
            }
            const width = Math.abs(coord.x2 - coord.x1);
            const height = Math.abs(coord.y2 - coord.y1);
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

    // x) Scaling
    if (shapeParameters.has('expr-scale')) {
        const element = shapeParameters!.get('expr-scale');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'scale', {
            get: () => returnFunc(),
        });
    }
    // y) Rotating
    if (shapeParameters.has('expr-angle')) {
        const element = shapeParameters!.get('expr-angle');
        const returnFunc = ComSocket.singleton().evalFunction(
            element,
        );
        Object.defineProperty(initial, 'angle', {
            get: () => returnFunc(),
        });
    }
    // z) Transforming
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

    // Create the variable parameters
    // 1) The text flags bit(dec): 0(1): left justified, 1(2): right justified, 2(4): horizontally centered, 3(8): top, 4(16): bottom, 5(32): centered
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
        /**
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
    */
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
    // 2) The font flags bit(dec): 0(1): Italic, 1(2): Bold, 2(4): Underline, 3(8): StrikeOut
    if (textParameters.has('expr-font-flags')) {
        const element = textParameters!.get('expr-font-flags');
        Object.defineProperty(initial, 'isItalic', {
            get: function () {
                const value = Number(
                    ComSocket.singleton().evalFunction(element)(),
                );
                return (value & 1) !== 0;
            },
        });
        Object.defineProperty(initial, 'fontWeight', {
            get: function () {
                const value = Number(
                    ComSocket.singleton().evalFunction(element)(),
                );
                return (value & 2) !== 0 ? 700 : 400; // 400 = normal, 700 = bold
            },
        });
        Object.defineProperty(initial, 'hasUnderline', {
            get: function () {
                const value = Number(
                    ComSocket.singleton().evalFunction(element)(),
                );
                return (value & 4) !== 0;
            },
        });
        Object.defineProperty(initial, 'hasStrikeOut', {
            get: function () {
                const value = Number(
                    ComSocket.singleton().evalFunction(element)(),
                );
                return (value & 8) !== 0;
            },
        });
    }
    // 3) The font name:
    Object.defineProperty(initial, 'fontName', {
        get: function () {
            let value = '';

            if (textParameters.has('expr-font-name')) {
                const element = textParameters!.get('expr-font-name');
                const elementFont = ComSocket.singleton().getFunction(
                    element,
                )();
                if (
                    elementFont !== null &&
                    typeof elementFont !== 'undefined' &&
                    elementFont !== '' &&
                    elementFont !== ' ' &&
                    elementFont.toLowerCase() !== 'arial'
                ) {
                    if (value !== '') {
                        value = value + ', ' + elementFont;
                    } else {
                        value = elementFont;
                    }
                }
            }

            console.log('text', text);

            if (value !== '') {
                value = value + ', Arial';
            } else {
                value = 'Arial';
            }

            console.log('font-family', value);

            return value;
        },
    });

    // 5) The font color:
    if (textParameters.has('expr-text-color')) {
        const element = textParameters!.get('expr-text-color');
        Object.defineProperty(initial, 'fontColor', {
            get: function () {
                const value = ComSocket.singleton().evalFunction(
                    element,
                )();
                const hex = util.numberToHexColor(value);
                return hex;
            },
        });
    }
    // 6) The font height:
    if (textParameters.has('expr-font-height')) {
        const element = textParameters!.get('expr-font-height');
        Object.defineProperty(initial, 'fontHeight', {
            get: function () {
                const value = Number(
                    ComSocket.singleton().evalFunction(element)(),
                );
                return value;
            },
        });
    }

    Object.defineProperty(initial, 'textAnchor', {
        get: function () {
            const position =
                initial.textAlignHorz === 'center'
                    ? 'middle'
                    : initial.textAlignHorz === 'right'
                    ? 'end'
                    : 'start';
            return position;
        },
    });

    Object.defineProperty(initial, 'language', {
        get: function () {
            const language = localStorage.getItem('language').toLowerCase();
            console.log(language);
            return language;
        },
    });

    Object.defineProperty(initial, 'yPos', {
        get: function () {
            const position =
                initial.textAlignVert === 'center'
                    ? '50%'
                    : initial.textAlignVert === 'bottom'
                    ? '100%'
                    : '0%';
            return position;
        },
    });

    Object.defineProperty(initial, 'dominantBaseline', {
        get: function () {
            const position =
                initial.textAlignVert === 'center'
                    ? ''
                    : initial.textAlignVert === 'bottom'
                    ? 'text-after-edge'
                    : 'text-before-edge';
            return position;
        },
    });

    Object.defineProperty(initial, 'fontStyle', {
        get: function () {
            const value =
                initial.isItalic === true ? 'italic' : 'normal';
            return value;
        },
    });

    Object.defineProperty(initial, 'textDecoration', {
        get: function () {
            let string = '';
            if (initial.hasStrikeOut) {
                string = 'line-through ';
            }
            if (initial.hasUnderline) {
                string = string + 'underline ';
            }
            if (string.length) {
                return string;
            } else {
                return 'initial';
            }
        },
    });

    // Parse the text
    function calcDayOfYear(now: Date) {
        /*
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = (now.valueOf() - start.valueOf()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        temp = Math.floor(diff / oneDay).toString();
        */
        const firstJan = new Date(now.getFullYear(), 0, 1);
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.ceil(
            (now.valueOf() - firstJan.valueOf()) / oneDay,
        );
    }

    function calcWeekNumber8601(now: Date) {
        // The first one seem to work but I found the second one to be better suited for ISO week.
        /*
        let workDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        let dayNum = workDate.getUTCDay() || 7;
        workDate.setUTCDate(workDate.getUTCDate() + 4 - dayNum);
        let firstJanUTC = new Date(Date.UTC(workDate.getUTCFullYear(), 0, 1));
        let oneDay = 1000 * 60 * 60 * 24;
        return Math.ceil((((workDate.valueOf() - firstJanUTC.valueOf()) / oneDay) + 1) / 7);
        */
        const target = new Date(now.valueOf());
        const dayNr = (now.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
        }
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return (
            1 +
            Math.ceil((firstThursday - target.valueOf()) / oneWeek)
        );
    }

    function calcWeekNumberUS(now: Date) {
        // I am not sure about this one ... May need more research.
        const workDate = new Date(
            Date.UTC(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
            ),
        );
        const dayNum = workDate.getUTCDay();
        workDate.setUTCDate(workDate.getUTCDate() - dayNum);
        const firstJanUTC = new Date(
            Date.UTC(workDate.getUTCFullYear(), 0, 1),
        );
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.ceil(
            ((workDate.valueOf() - firstJanUTC.valueOf()) / oneDay +
                1) /
                7,
        );
    }

    // The text variable:
    if (textParameters.has('text-display')) {
        const element = textParameters!.get('text-display');
        Object.defineProperty(initial, 'textVariable', {
            get: function () {
                const value = ComSocket.singleton().getFunction(
                    element,
                )();
                return value;
            },
        });
    }

    Object.defineProperty(initial, 'textLines', {
        get: function () {
            // CoDeSys has implemented a %t symbol to show date and time. The text is not computed with sprintf then
            // TODO: mode the transform system to it's own function ?
            let output = '';
            let parsedText = text;
            if (parsedText.includes('%t')) {
                let temp;
                // let array;
                const now = new Date();
                parsedText = parsedText.replace(/%t/g, '');
                // %a      Abbreviated weekday name
                if (parsedText.includes('%a')) {
                    temp = now.toLocaleString('default', {
                        weekday: 'short',
                    });
                    parsedText = parsedText.replace(/%a/g, temp);
                }
                // %A      Full weekday name
                if (parsedText.includes('%A')) {
                    temp = now.toLocaleString('default', {
                        weekday: 'long',
                    });
                    parsedText = parsedText.replace(/%A/g, temp);
                }
                // %b      Abbreviated month name
                if (parsedText.includes('%b')) {
                    temp = now.toLocaleString('default', {
                        month: 'short',
                    });
                    parsedText = parsedText.replace(/%b/g, temp);
                }
                // %B      Full month name
                if (parsedText.includes('%B')) {
                    temp = now.toLocaleString('default', {
                        month: 'long',
                    });
                    parsedText = parsedText.replace(/%B/g, temp);
                }
                // %c      Date and time representation appropriate for locale
                if (parsedText.includes('%c')) {
                    temp = now.toLocaleString().toString();
                    parsedText = parsedText.replace(/%c/g, temp);
                }
                // %d      Day of month as decimal number (01 – 31)
                if (parsedText.includes('%d')) {
                    temp = now.getDate();
                    temp = (temp < 10 ? '0' : '') + temp.toString();
                    parsedText = parsedText.replace(/%d/g, temp);
                }
                // %H      Hour in 24-hour format (00 – 23)
                if (parsedText.includes('%H')) {
                    temp = now.getHours();
                    temp = (temp < 10 ? '0' : '') + temp.toString();
                    parsedText = parsedText.replace(/%H/g, temp);
                }
                // %I      Hour in 12-hour format (01 – 12)
                if (parsedText.includes('%I')) {
                    temp = now.getHours();
                    temp = temp > 12 ? temp - 12 : temp;
                    temp = (temp < 10 ? '0' : '') + temp.toString();
                    parsedText = parsedText.replace(/%I/g, temp);
                }
                // %j      Day of year as decimal number (001 – 366)
                if (parsedText.includes('%j')) {
                    temp = calcDayOfYear(now).toString();
                    parsedText = parsedText.replace(/%j/g, temp);
                }
                // %m      Month as decimal number (01 – 12)
                if (parsedText.includes('%m')) {
                    temp = now.getMonth() + 1;
                    temp = (temp < 10 ? '0' : '') + temp.toString();
                    parsedText = parsedText.replace(/%m/g, temp);
                }
                // %M      Minute as decimal number (00 – 59)
                if (parsedText.includes('%M')) {
                    temp = now.getMinutes();
                    temp = (temp < 10 ? '0' : '') + temp.toString();
                    parsedText = parsedText.replace(/%M/g, temp);
                }
                // %p      Current locale’s A.M./P.M. indicator for 12-hour clock
                if (parsedText.includes('%p')) {
                    temp = now.getHours();
                    temp = temp >= 12 ? 'P.M.' : 'A.M.';
                    parsedText = parsedText.replace(/%p/g, temp);
                }
                // %S      Second as decimal number (00 – 59)
                if (parsedText.includes('%S')) {
                    temp = now.getSeconds();
                    temp = (temp < 10 ? '0' : '') + temp.toString();
                    parsedText = parsedText.replace(/%S/g, temp);
                }
                // %U      Week of year as decimal number, with Sunday as first day of week (00 – 53)
                if (parsedText.includes('%U')) {
                    temp = calcWeekNumberUS(now).toString();
                    parsedText = parsedText.replace(/%U/g, temp);
                }
                // %w      Weekday as decimal number (0 – 6; Sunday is 0)
                if (parsedText.includes('%w')) {
                    temp = now.getDay().toString();
                    parsedText = parsedText.replace(/%w/g, temp);
                }
                // %W      Week of year as decimal number, with Monday as first day of week (00 – 53)
                if (parsedText.includes('%W')) {
                    temp = calcWeekNumber8601(now).toString();
                    parsedText = parsedText.replace(/%W/g, temp);
                }
                // %x      Date representation for current locale
                if (parsedText.includes('%x')) {
                    temp = now.toLocaleDateString().toString();
                    parsedText = parsedText.replace(/%x/g, temp);
                }
                // %X      Time representation for current locale
                if (parsedText.includes('%X')) {
                    temp = now.toLocaleTimeString().toString();
                    parsedText = parsedText.replace(/%X/g, temp);
                }
                // %y      Year without century, as decimal number (00 – 99)
                if (parsedText.includes('%y')) {
                    temp = now.getFullYear();
                    temp = (temp % 100).toString();
                    parsedText = parsedText.replace(/%y/g, temp);
                }
                // %Y      Year with century, as decimal number
                if (parsedText.includes('%Y')) {
                    temp = now.getFullYear().toString();
                    parsedText = parsedText.replace(/%Y/g, temp);
                }
                // %z, %Z  Time-zone name or abbreviation; no characters if time zone is unknown
                if (parsedText.includes('%z')) {
                    const dtf = Intl.DateTimeFormat('default', {
                        timeZoneName: 'short',
                    });
                    temp = dtf
                        .formatToParts(now)
                        .find((part) => part.type === 'timeZoneName')
                        .value;
                    parsedText = parsedText.replace(/%z/g, temp);
                }
                if (parsedText.includes('%Z')) {
                    const dtf = Intl.DateTimeFormat('default', {
                        timeZoneName: 'long',
                    });
                    temp = dtf
                        .formatToParts(now)
                        .find((part) => part.type === 'timeZoneName')
                        .value;
                    parsedText = parsedText.replace(/%Z/g, temp);
                }
                /*
                // Just in case replace all %z and %Z to the short version
                if (parsedText.includes("%z") || parsedText.includes("%Z")) {
                    let dtf = Intl.DateTimeFormat('default', {timeZoneName: 'short'});
                    temp = dtf.formatToParts(now).find((part) => part.type == 'timeZoneName').value;
                    parsedText = parsedText.replace(/%z/gi, temp);
                }
                */
                // %%      Percent sign
                if (parsedText.includes('%%')) {
                    parsedText = parsedText.replace(/%%/g, '%');
                }

                output = parsedText;
            } else {
                try {
                    if (
                        parsedText.includes('|<|') ||
                        parsedText.includes('|>|')
                    ) {
                        parsedText = parsedText.replace(
                            /\|<\|/g,
                            '<',
                        );
                        parsedText = parsedText.replace(
                            /\|>\|/g,
                            '>',
                        );
                        output = parsedText;
                    } else {
                        output = sprintf(
                            parsedText,
                            initial.textVariable,
                        );
                    }
                } catch {
                    if (!(!parsedText || /^\s*$/.test(parsedText))) {
                        output = parsedText;
                    }
                }
            }
            return util.getTextLines(output);
        },
    });

    // Create a map of lines
    const svgTextLines: Array<JSX.Element | undefined | null> = [];
    for (let i = 0; i < initial.textLines.length; i++) {
        svgTextLines.push(
            <Textline
                firstItem={i === 0}
                textLine={initial.textLines[i]}
                numberOfLines={initial.textLines.length}
                section={section}
                textParameters={textParameters}
            ></Textline>,
        );
    }
    const state = useLocalStore(() => initial);

    return useObserver(() => (
        <text
            textDecoration={state.textDecoration}
            fontStyle={state.fontStyle}
            fill={state.fontColor}
            fontWeight={state.fontWeight}
            fontSize={Math.abs(state.fontHeight)}
            fontFamily={
                state.fontName === null ||
                typeof state.fontName === 'undefined' ||
                state.fontName === ''
                    ? 'Arial'
                    : state.fontName
            }
            textAnchor={state.textAnchor}
            dominantBaseline={
                state.textLines === null ||
                state.dominantBaseline === null ||
                typeof state.dominantBaseline === 'undefined' ||
                state.dominantBaseline === ''
                    ? null
                    : state.dominantBaseline
            }
            pointerEvents={'none'}
            y={state.yPos}
            transform={state.transform}
        >
            <React.Fragment>
                {
                    // svgTextLines.map((element, index) => (
                    svgTextLines.map((element) => (
                        <React.Fragment key={uid(element)}>
                            {element}
                        </React.Fragment>
                    ))
                }
            </React.Fragment>
        </text>
    ));
};
