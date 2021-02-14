export function stringToBoolean(booleanExp: string): boolean {
    let interim = false;
    try {
        interim = JSON.parse(booleanExp);
    } catch {
        console.warn(
            '[' + booleanExp + '] is not a boolean expression',
        );
    }
    return interim;
}

export function rgbToHexString(rgb: string): string {
    const rgbClr = rgb.split(',');
    const r = Number(rgbClr[0]);
    const g = Number(rgbClr[1]);
    const b = Number(rgbClr[2]);
    let interim = ((r << 16) | (g << 8) | b)
        .toString(16)
        .toUpperCase();
    // Extends the string with zeros ahead to get a length of 6 characters (#xxxxxx)
    while (interim.length !== 6) {
        interim = '0' + interim;
    }
    return '#' + interim;
}

export function numberToHexColor(number: string): string {
    const interim = Number(number);
    const r = interim & 255;
    const g = (interim >> 8) & 255;
    const b = (interim >> 16) & 255;
    let rgb = '' + ((((r << 8) + g) << 8) + b).toString(16);
    while (rgb.length !== 6) {
        rgb = '0' + rgb;
    }
    return '#' + rgb;
}

export function parseAccessLevels(
    accessLevels: string,
): Array<string> {
    return accessLevels.split(',');
}

export function stringToArray(stringExp: string): Array<number> {
    return stringExp.split(',').map(Number);
}

export function computeMinMaxCoord(pointArray: number[][]): number[] {
    const rect = [
        pointArray[0][0],
        pointArray[0][1],
        pointArray[0][0],
        pointArray[0][1],
    ];
    pointArray.forEach(function (element) {
        // Find minimum and maximum of x
        if (element[0] < rect[0]) {
            rect[0] = element[0];
        }
        if (element[0] > rect[2]) {
            rect[2] = element[0];
        }
        // Find minimum and maximum of y
        if (element[1] < rect[1]) {
            rect[1] = element[1];
        }
        if (element[1] > rect[3]) {
            rect[3] = element[1];
        }
    });
    return rect;
}

export function computePiechartRectCoord(
    pointArray: number[][],
): number[] {
    const deltax = Math.abs(pointArray[1][0] - pointArray[0][0]);
    const deltay = Math.abs(pointArray[1][1] - pointArray[0][1]);
    const x1 = pointArray[0][0] - deltax;
    const x2 = pointArray[0][0] + deltax;
    const y1 = pointArray[0][1] - deltay;
    const y2 = pointArray[0][1] + deltay;
    const rect = [x1, y1, x2, y2];
    return rect;
}

// Calculate the radius of a specifc point
function radius(a: number, b: number, angle: number) {
    const r =
        (a * b) /
        Math.sqrt(
            Math.pow(b * Math.cos(angle), 2) +
                Math.pow(a * Math.sin(angle), 2),
        );
    return r;
}

export function pointArrayToPiechartString(
    pointArray: number[][],
    startAngleDegree: number,
    endAngleDegree: number,
    strokeWidth: number,
): string {
    // Calculate the angle in radiant
    const startAngleRad = -startAngleDegree * 0.0174532925; // (2 * Math.PI) / 360 = 0.0174532925
    const endAngleRad = -endAngleDegree * 0.0174532925;
    // Calculate the radii of the ellipse
    const radiusx = Math.abs(pointArray[1][0] - pointArray[0][0]);
    const radiusy = Math.abs(pointArray[1][1] - pointArray[0][1]);
    // Calculate the radius of start and endpoint
    const rStart = radius(radiusx, radiusy, startAngleRad);
    const rEnd = radius(radiusx, radiusy, endAngleRad);
    const start = [
        Math.cos(startAngleRad) * rStart + radiusx,
        Math.sin(startAngleRad) * rStart + radiusy,
    ];
    const end = [
        Math.cos(endAngleRad) * rEnd + radiusx,
        Math.sin(endAngleRad) * rEnd + radiusy,
    ];
    const interimArray = pointArray;
    interimArray[2] = start;
    interimArray[3] = end;

    let d: string;
    const angleDiff = (endAngleDegree - startAngleDegree) % 360;
    // Angle with 0 degree difference is shown als full arc in codesys
    if (angleDiff === 0) {
        d = [
            'M',
            interimArray[0][0],
            interimArray[0][1],
            'L',
            interimArray[2][0] + strokeWidth,
            interimArray[2][1] + strokeWidth,
            'M',
            2 * radiusx + strokeWidth,
            radiusy + strokeWidth,
            'A',
            radiusx - strokeWidth,
            radiusy,
            0,
            1,
            1,
            strokeWidth,
            radiusy + strokeWidth,
            'A',
            radiusx,
            radiusy,
            0,
            1,
            1,
            2 * radiusx + strokeWidth,
            radiusy + strokeWidth,
        ].join(' ');
    } else {
        let largeArcFlag = 1;
        if (angleDiff > 0) {
            largeArcFlag = angleDiff <= 180 ? 1 : 0;
        } else {
            largeArcFlag = angleDiff <= -180 ? 1 : 0;
        }
        d = [
            'M',
            interimArray[0][0],
            interimArray[0][1],
            'L',
            interimArray[2][0] + strokeWidth,
            interimArray[2][1] + strokeWidth,
            'A',
            radiusx,
            radiusy,
            0,
            largeArcFlag,
            1,
            interimArray[3][0] + strokeWidth,
            interimArray[3][1] + strokeWidth,
            'Z',
        ].join(' ');
    }
    return d;
}

export function polarToCartesian(
    center: number[],
    radius: number,
    angleInDegrees: number,
) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: center[0] + radius * Math.cos(angleInRadians),
        y: center[1] + radius * Math.sin(angleInRadians),
    };
}

export function coordArrayToString(pointArray: number[][]): string {
    const interim: string[] = [];
    pointArray.forEach((element) => interim.push(element.join(',')));
    return interim.join(' ');
}

export function coordArrayToBezierString(
    pointArray: number[][],
): string {
    let bezier = '';
    pointArray.forEach((element, index) => {
        if (index === 0) {
            bezier += 'M' + element.join(' ');
        } else if (index === 1) {
            bezier += ' C' + element.join(' ');
        } else {
            bezier += ', ' + element.join(' ');
        }
    });
    return bezier;
}

export function evalRPN(
    postfixStack: Array<string>,
): boolean | number | string | null {
    // Return null if string is empty
    if (postfixStack.length === 0) {
        return null;
    }
    if (postfixStack.length === 1) {
        let token = postfixStack[0];
        if (token.toLowerCase() === 'true') {
            token = '1';
        }
        if (token.toLowerCase() === 'false') {
            token = '0';
        }
        // If the token is a number:
        if (!isNaN(parseFloat(token))) {
            return parseFloat(token);
        }
        // Else the token is a string
        else {
            return token;
        }
    }
    // We initilize the operating stack, this is necessary for mutliple operands
    const operatingStack: Array<number> = [];
    // Now we pop the tokens successively form the resting stack
    for (let i = 0; i < postfixStack.length; i++) {
        let token = postfixStack[i];
        // The token could be "TRUE" or "FALSE". The we have to translate it to 1 and 0.
        if (token.toLowerCase() === 'true') {
            token = '1';
        }
        if (token.toLowerCase() === 'false') {
            token = '0';
        }

        // If the token is a number: push them to the operating stack
        if (!isNaN(Number(token))) {
            operatingStack.push(parseFloat(token));
        }
        // Else the token is a operator
        else {
            // The <op>-text has the format: <operation>(<number of involved operands>) if number > 1
            let numberOfOperands = 2;
            const regex = token.match(/\(([^)]+)\)/);
            if (regex !== null) {
                numberOfOperands = Number(regex[1]);
            }
            // Get the operator
            const operator = token.split('(')[0];
            // Choose the opration
            let result: number;
            let interim: number;
            switch (operator) {
                case '*': {
                    result = operatingStack.pop();
                    for (let i = 1; i < numberOfOperands; i++) {
                        result = result * operatingStack.pop();
                    }
                    break;
                }
                case '/': {
                    result = operatingStack.pop();
                    for (let i = 1; i < numberOfOperands; i++) {
                        result = result / operatingStack.pop();
                    }
                    break;
                }
                case '-': {
                    result = operatingStack.pop();
                    for (let i = 1; i < numberOfOperands; i++) {
                        result = -result + operatingStack.pop();
                    }
                    break;
                }
                case '+': {
                    result = operatingStack.pop();
                    for (let i = 1; i < numberOfOperands; i++) {
                        result = result + operatingStack.pop();
                    }
                    break;
                }
                case 'MAX': {
                    result = operatingStack.pop();
                    for (let i = 1; i < numberOfOperands; i++) {
                        const y = result;
                        const x = operatingStack.pop();
                        result = x > y ? x : y;
                    }
                    break;
                }
                case 'MIN': {
                    result = operatingStack.pop();
                    for (let i = 1; i < numberOfOperands; i++) {
                        const y = result;
                        const x = operatingStack.pop();
                        result = x < y ? x : y;
                    }
                    break;
                }
                case '=': {
                    interim = operatingStack.pop();
                    for (let i = 1; i < 2; i++) {
                        const y = interim;
                        const x = operatingStack.pop();
                        result =
                            typeof x !== 'undefined' &&
                            x !== null &&
                            x === y
                                ? 1
                                : 0;
                    }
                    break;
                }
                case '<': {
                    interim = operatingStack.pop();
                    for (let i = 1; i < 2; i++) {
                        const y = interim;
                        const x = operatingStack.pop();
                        result = x < y ? 1 : 0;
                    }
                    break;
                }
                case '>': {
                    interim = operatingStack.pop();
                    for (let i = 1; i < 2; i++) {
                        const y = interim;
                        const x = operatingStack.pop();
                        result = x > y ? 1 : 0;
                    }
                    break;
                }
                case '<=': {
                    interim = operatingStack.pop();
                    for (let i = 1; i < 2; i++) {
                        const y = interim;
                        const x = operatingStack.pop();
                        result = x <= y ? 1 : 0;
                    }
                    break;
                }
                case '>=': {
                    interim = operatingStack.pop();
                    for (let i = 1; i < 2; i++) {
                        const y = interim;
                        const x = operatingStack.pop();
                        result = x >= y ? 1 : 0;
                    }
                    break;
                }
                case '<>': {
                    interim = operatingStack.pop();
                    for (let i = 1; i < 2; i++) {
                        const y = interim;
                        const x = operatingStack.pop();
                        result = x !== y ? 1 : 0;
                    }
                    break;
                }
                case 'AND': {
                    interim = operatingStack.pop();
                    for (let i = 1; i < numberOfOperands; i++) {
                        const swap = operatingStack.pop();
                        interim = interim & swap;
                    }
                    result = interim;
                    break;
                }
                case 'OR': {
                    interim = operatingStack.pop();
                    for (let i = 1; i < numberOfOperands; i++) {
                        const swap = operatingStack.pop();
                        interim = interim | swap;
                    }
                    result = interim;
                    break;
                }
                case 'NOT': {
                    // Has only on operand
                    result = Number(!operatingStack.pop());
                    break;
                }
                default: {
                    console.warn(
                        'The RPN-combi: ' +
                            token +
                            ' ' +
                            operator +
                            ' is not a valid one!',
                    );
                }
            }
            operatingStack.push(result);
        }
    }
    const output = operatingStack.pop();
    return output;
}

export function parseText(text: string) {
    // Replace the \r\n by single \n
    text = text.replace(/\r\n/g, '\n');
    // Replace the \n\r by single \n
    text = text.replace(/\n\r/g, '\n');
    // Replace the \r by single \n
    text = text.replace(/\r/g, '\n');
    // We should only have \n as new line

    // Replace the tabs
    text = text.replace(/\n\t/g, '');
    text = text.replace(/\t/g, '');

    // Replace <![CDATA[
    // text = text.replace(/\<\!\[CDATA\[/, '');
    // Replace ]]>
    // text = text.replace(/(\]\]\>)(?!.*\1)/, '');

    return text;
}

export function getTextLines(text: string) {
    let match;
    let lastMatch = 0;
    const regEx = new RegExp(/(\n)/, 'g');
    const stringStack = [];

    text = parseText(text);

    do {
        match = regEx.exec(text);
        if (match !== null) {
            stringStack.push(
                text
                    .substring(lastMatch, match.index)
                    .replace(/\| \|/g, ' '),
            );
            lastMatch = match.index + 1;
        } else {
            stringStack.push(
                text
                    .substring(lastMatch, text.length)
                    .replace(/\| \|/g, ' '),
            );
        }
    } while (match);
    return stringStack.filter(
        (el) => typeof el !== 'undefined' && el !== null,
    );
}
