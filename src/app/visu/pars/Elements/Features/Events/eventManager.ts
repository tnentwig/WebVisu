import ComSocket from '../../../../communication/comsocket';
import StateManager from '../../../../statemanagement/statemanager';
// This function is parsing all <expr-...> tags like toggle color and returns a map with the expression as key and the variable as value

export function parseShapeParameters(
    section: Element,
): Map<string, string[][]> {
    const exprMap: Map<string, string[][]> = new Map();
    let tags: Array<string> = [];
    // Styling tags
    tags = [
        'expr-toggle-color', // 1) Set alarm
        'expr-fill-color', // 2) Variable for the fill color
        'expr-fill-color-alarm',
        'expr-frame-color', // 4) Variable for the frame color
        'expr-frame-color-alarm',
        'expr-invisible', // 6) Flag to make the object invisible
        'expr-fill-flags', // 7) Toggles the "has-inside-color"
        'expr-frame-flags', // 8) Toggles the "has-frame-color"
        'expr-line-width', // 9) line-width

        // Transition tags
        'expr-left', // Relative left
        'expr-right', // Relative right
        'expr-top', // Relative top
        'expr-bottom', // Relative bottom
        'expr-xpos', // Absolute x-position
        'expr-ypos', // Absolute y-position
        'expr-scale', // Scale with middle reference point
        'expr-angle', // Turn around the reference point with angle

        // Tooltip
        'expr-tooltip-display', // tooltip variable
        // Deactivate Input
        'expr-input-disabled',

        // Piechart specific
        'expr-angle1',
        'expr-angle2',

        // Scrollbar specific
        'expr-lower-bound',
        'expr-upper-bound',
        'expr-tap-var',
        'expr-toggle-var',
    ];

    const children = section.children;
    for (let i = 0; i < children.length; i++) {
        const exprName = children[i].nodeName;
        if (tags.includes(exprName)) {
            // Now parse the expression stack
            // The stack is included in a <expr></expr>
            const expressions =
                children[i].getElementsByTagName('expr')[0].children;
            // Init a helper stack
            const stack: string[][] = [];
            // Iterate over all expressions
            for (let j = 0; j < expressions.length; j++) {
                const ident = expressions[j].tagName;
                const value = expressions[j].textContent;
                switch (ident) {
                    case 'var': {
                        stack.push(['var', value.toLowerCase()]);
                        break;
                    }
                    case 'const': {
                        stack.push(['const', value]);
                        break;
                    }
                    case 'op': {
                        stack.push(['op', value]);
                        break;
                    }
                    default: {
                        console.warn(
                            'The expression ' +
                                exprName +
                                ' with ident ' +
                                ident +
                                ' which has for value ' +
                                value +
                                ' is not attached!',
                        );
                    }
                }
            }
            exprMap.set(exprName, stack);
        }
    }
    return exprMap;
}

export function parseTextParameters(
    section: Element,
    // shape: string,
): Map<string, string[][]> {
    const exprMap: Map<string, string[][]> = new Map();
    let tags: Array<string> = [];
    // Styling tags
    tags = [
        'expr-text-flags', // 1) The textflags sets the alignment of the text
        'expr-font-flags', // 2) The font flags sets the external appearance
        'expr-font-name', // 3) Sets the font name
        'text-display', // 4) Sets the variable that has to be displayed
        'expr-text-color', // 5) Sets the text color
        'expr-font-height', // 6) Sets the font height
    ];

    const children = section.children;
    for (let i = 0; i < children.length; i++) {
        const exprName = children[i].nodeName;
        if (tags.includes(exprName)) {
            // Now parse the expression stack
            // The stack is included in a <expr></expr>
            const expressions =
                children[i].getElementsByTagName('expr')[0].children;
            // Init a helper stack
            const stack: string[][] = [];
            // Iterate over all expressions
            for (let j = 0; j < expressions.length; j++) {
                const ident = expressions[j].tagName;
                const value = expressions[j].textContent;
                switch (ident) {
                    case 'var': {
                        stack.push(['var', value.toLowerCase()]);
                        break;
                    }
                    case 'const': {
                        stack.push(['const', value]);
                        break;
                    }
                    case 'op': {
                        stack.push(['op', value]);
                        break;
                    }
                    default: {
                        console.warn(
                            'The expression ' +
                                exprName +
                                ' with ident ' +
                                ident +
                                ' which has for value ' +
                                value +
                                ' is not attached!',
                        );
                    }
                }
            }
            exprMap.set(exprName, stack);
        }
    }
    return exprMap;
}

export function parseClickEvent(section: Element): Function {
    let clickFunction: Function = null;
    const stack: Array<Function> = [];
    let clickEventDetected = false;

    const children = section.children;

    for (let i = 0; i < children.length; i++) {
        const exprName = children[i].nodeName;
        // Parse the <expr-toggle-var><expr><var> ... elements => toggle color
        if (exprName === 'expr-toggle-var') {
            // Parse all detected expressions
            const expressions =
                children[i].getElementsByTagName('expr');
            for (let i = 0; i < expressions.length; i++) {
                // Check if variable exists
                const variable =
                    expressions[i].getElementsByTagName('var');
                if (variable.length) {
                    const varName =
                        variable[0].textContent.toLowerCase();
                    const com = ComSocket.singleton();
                    if (com.oVisuVariables.has(varName)) {
                        clickFunction = function (): void {
                            com.toggleValue(varName);
                        };
                        stack.push(clickFunction);
                        clickEventDetected = true;
                    }
                }
            }
        }

        if (exprName === 'expr-zoom') {
            // Parse all detected expressions
            const expressions =
                children[i].getElementsByTagName('expr');
            for (let i = 0; i < expressions.length; i++) {
                // The zoom expression can be a parameter (placeholder) or a variable (var)
                const expr = expressions[i].children;
                if (expr.length) {
                    const tagName = expr[0].tagName;
                    if (tagName === 'placeholder') {
                        const visuName = expr[0].textContent;
                        if (
                            StateManager.singleton().oState.get(
                                'USECURRENTVISU',
                            ) === 'TRUE'
                        ) {
                            clickFunction = function (): void {
                                ComSocket.singleton().setValue(
                                    '.currentvisu',
                                    visuName,
                                );
                            };
                        } else {
                            clickFunction = function (): void {
                                StateManager.singleton().oState.set(
                                    'ZOOMVISU',
                                    visuName,
                                );
                            };
                        }
                    } else if (tagName === 'var') {
                        const visuVariable =
                            expr[0].textContent.toLowerCase();
                        if (
                            StateManager.singleton().oState.get(
                                'USECURRENTVISU',
                            ) === 'TRUE'
                        ) {
                            clickFunction = function (): void {
                                const visuName =
                                    ComSocket.singleton().oVisuVariables.get(
                                        visuVariable,
                                    )!.value;
                                ComSocket.singleton().setValue(
                                    '.currentvisu',
                                    visuName,
                                );
                            };
                        } else {
                            clickFunction = function (): void {
                                const visuName =
                                    ComSocket.singleton().oVisuVariables.get(
                                        visuVariable,
                                    )!.value;
                                StateManager.singleton().oState.set(
                                    'ZOOMVISU',
                                    visuName,
                                );
                            };
                        }
                    }

                    stack.push(clickFunction);
                    clickEventDetected = true;
                }
            }
        }
        // The object has properties on "Execute program" if input-action-list is detected
        if (exprName === 'input-action-list') {
            const actionList = children[i];
            // Assign expression
            if (
                actionList.getElementsByTagName('expr-assign').length
            ) {
                const assigns =
                    actionList.getElementsByTagName('expr-assign');
                for (let i = 0; i < assigns.length; i++) {
                    const action = assigns[i];
                    // Left side value. Must be a variable.
                    const lvalue = action
                        .getElementsByTagName('lvalue')[0]
                        .getElementsByTagName('expr')[0]
                        .getElementsByTagName('var')[0].textContent;
                    // Right sided expression
                    const rpnStack: string[][] = [];
                    const rvalue = action
                        .getElementsByTagName('rvalue')[0]
                        .getElementsByTagName('expr')[0].children;
                    for (let j = 0; j < rvalue.length; j++) {
                        const ident = rvalue[j].tagName;
                        const value = rvalue[j].textContent;
                        switch (ident) {
                            case 'var': {
                                rpnStack.push([
                                    'var',
                                    value.toLowerCase(),
                                ]);
                                break;
                            }
                            case 'const': {
                                rpnStack.push(['const', value]);
                                break;
                            }
                            case 'op': {
                                rpnStack.push(['op', value]);
                                break;
                            }
                        }
                    }
                    clickFunction = function (): void {
                        const rvalue =
                            ComSocket.singleton().evalFunction(
                                rpnStack,
                            )();
                        const com = ComSocket.singleton();
                        com.setValue(lvalue, rvalue);
                    };
                    stack.push(clickFunction);
                    clickEventDetected = true;
                }
            }
            // Execute expression
            if (actionList.getElementsByTagName('execute').length) {
                // There are many available executable actions
                const executes =
                    actionList.getElementsByTagName('execute');
                for (let i = 0; i < executes.length; i++) {
                    const execName = executes[i].textContent;
                    const execList = execName.split(' ');
                    if (
                        typeof execList[0] !== 'undefined' &&
                        execList[0] !== null
                    ) {
                        switch (execList[0]) {
                            case 'INTERN': {
                                if (
                                    typeof execList[1] !==
                                        'undefined' &&
                                    execList[1] !== null
                                ) {
                                    switch (execList[1]) {
                                        case 'CHANGEUSERLEVEL': {
                                            clickFunction =
                                                function (): void {
                                                    StateManager.singleton().openPopup.set(
                                                        true,
                                                    );
                                                };
                                            stack.push(clickFunction);
                                            clickEventDetected = true;
                                            break;
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
            // Hyperlink
            if (actionList.getElementsByTagName('expr-link').length) {
                const links =
                    actionList.getElementsByTagName('expr-link');
                for (let i = 0; i < links.length; i++) {
                    // prettier-ignore
                    const link = actionList
                        .getElementsByTagName('expr-link')[i]
                        .getElementsByTagName('expr')[0]
                        .children[0];
                    const type = link.tagName;
                    const content = link.textContent;
                    if (type === 'var') {
                        clickFunction = function (): void {
                            if (
                                ComSocket.singleton().oVisuVariables.has(
                                    content.toLowerCase(),
                                )
                            ) {
                                const varContent =
                                    ComSocket.singleton().oVisuVariables.get(
                                        content.toLowerCase(),
                                    )!.value;
                                window.open(varContent.split(' ')[0]);
                            }
                        };
                    } else {
                        clickFunction = function (): void {
                            // TODO: shouldn't we open the value instead ???
                            /*
                            const value = ComSocket.singleton().evalFunction(
                                [[type, content.toLowerCase()]],
                            )();
                            window.open(content);
                            */
                            // TODO: check if this is right ???
                            const value =
                                ComSocket.singleton().evalFunction([
                                    [type, content.toLowerCase()],
                                ])();
                            window.open(value);
                        };
                    }
                    stack.push(clickFunction);
                    clickEventDetected = true;
                }
            }
        }
    }

    // Use empty callback if no click event is detected
    if (clickEventDetected) {
        clickFunction = function (): void {
            stack.forEach(function (callback) {
                callback();
            });
        };
    } else {
        clickFunction = null;
    }
    return clickFunction;
}

export function parseTapEvent(
    section: Element,
    direction: string,
): Function {
    let tapFunction: Function = null;
    const children = section.children;

    let tapElement: Element = null;
    let tapDown: number;
    let tapUp: number;

    for (let i = 0; i < children.length; i++) {
        const exprName = children[i].nodeName;
        if (exprName === 'expr-tap-var') {
            tapElement = children[i];
        } else if (exprName === 'tap-false') {
            // If tap-false exists a tap variable is existent
            tapDown = children[i].textContent === 'false' ? 1 : 0;
            tapUp = children[i].textContent === 'false' ? 0 : 1;
        }

        if (tapElement !== null) {
            const expressions =
                tapElement.getElementsByTagName('expr');
            // Parse the <expr-toggle-var><expr><var> ... elements => toggle color
            for (let i = 0; i < expressions.length; i++) {
                // Check if variable exists
                const variable =
                    expressions[i].getElementsByTagName('var');
                if (variable.length) {
                    const varName =
                        variable[0].textContent.toLowerCase();
                    const com = ComSocket.singleton();
                    if (com.oVisuVariables.has(varName)) {
                        // On mouse down or mouse up?
                        if (direction === 'down') {
                            tapFunction = function (): void {
                                com.setValue(varName, tapDown);
                            };
                        } else if (direction === 'up') {
                            tapFunction = function (): void {
                                com.setValue(varName, tapUp);
                            };
                        }
                    }
                }
            }
        }
    }
    return tapFunction;
}

export function parseScrollUpdate(section: Element): Function {
    let update: Function;
    const updateExpr = section.getElementsByTagName('expr-tap-var');
    if (updateExpr.length) {
        const content =
            updateExpr[0].getElementsByTagName('expr')[0].children[0];
        const varName = content.textContent.toLowerCase();
        const com = ComSocket.singleton();
        if (com.oVisuVariables.has(varName)) {
            update = function (setValue: string): void {
                com.setValue(varName, setValue);
            };
        }
    }
    return update;
}
