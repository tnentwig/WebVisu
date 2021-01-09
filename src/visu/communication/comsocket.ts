import { IComSocket } from '../Interfaces/jsinterfaces';
import { observable, action } from 'mobx';
import StateManager from '../statemanagement/statemanager';
import { evalRPN } from '../pars/Utils/utilfunctions';

export default class ComSocket implements IComSocket {
    private static instance: IComSocket = new ComSocket();

    // objList contains all variables as objects with the name as key and addr & value of the variable
    oVisuVariables: Map<
        string,
        { addr: string; value: string | undefined }
    >;

    // The objList has no clear sequence. To get the possibily of correct access with numbers as indices use the look up table
    private globalVariables: Map<
        string,
        { addr: string; key: string }
    >;

    // the actual list and map
    private lutKeyVariable: Array<string>;

    private requestFrame: { frame: string; listings: number };

    private serverURL: string;

    // The ID of cyclic request
    private intervalID: number;

    // Indicator if a request is running
    private runningFetch: boolean;

    // this class shall be a singleton
    private constructor() {
        this.serverURL = '';
        this.oVisuVariables = observable(new Map());
        this.globalVariables = new Map();
        this.requestFrame = { frame: '', listings: 0 };
        this.lutKeyVariable = [];
        this.runningFetch = false;
    }

    public static singleton() {
        return this.instance;
    }

    getServerURL() {
        return this.serverURL;
    }

    setServerURL(serverURL: string) {
        this.serverURL = serverURL;
    }

    addGlobalVar(varName: string, varAddr: string) {
        this.globalVariables.set(varName.toLowerCase(), {
            addr: varAddr,
            key: varName,
        });
    }

    addObservableVar(varName: string, varAddr: string) {
        // Add new variable as object to objList
        // Use lower case for variables names on the hole project to prevent faulty accesses to variables
        if (typeof varName === 'string') {
            this.oVisuVariables.set(varName.toLowerCase(), {
                addr: varAddr,
                value: '', // value is empty at first
            });
            // Add new variable to the request frame
            this.requestFrame.frame +=
                this.requestFrame.listings +
                '|' +
                varAddr.replace(/,/g, '|') +
                '|';
            this.requestFrame.listings += 1;
            // Create reference of the key in the LUT
            this.lutKeyVariable.push(varName.toLowerCase());
        }
    }

    evalFunction(stack: string[][]): Function {
        const returnFunc = function () {
            const interim: Array<string> = [];
            for (
                let position = 0;
                position < stack.length;
                position++
            ) {
                const value = stack[position][1];
                switch (stack[position][0]) {
                    case 'var': {
                        if (
                            ComSocket.singleton().oVisuVariables.has(
                                value,
                            )
                        ) {
                            let varContent = ComSocket.singleton().oVisuVariables.get(
                                value,
                            )!.value;
                            if (
                                varContent === null ||
                                typeof varContent === 'undefined' ||
                                varContent === ''
                            ) {
                                varContent = '0';
                            }
                            interim.push(varContent);
                        } else {
                            interim.push('0');
                        }
                        break;
                    }
                    case 'const': {
                        interim.push(value);
                        break;
                    }
                    case 'op': {
                        interim.push(value);
                        break;
                    }
                }
            }
            return evalRPN(interim);
        };
        return returnFunc;
    }

    getFunction(stack: string[][]): Function {
        const returnFunc = function () {
            let interim = '';
            for (
                let position = 0;
                position < stack.length;
                position++
            ) {
                const value = stack[position][1];
                switch (stack[position][0]) {
                    case 'var': {
                        if (
                            ComSocket.singleton().oVisuVariables.has(
                                value,
                            )
                        ) {
                            const varContent = ComSocket.singleton().oVisuVariables.get(
                                value,
                            )!.value;
                            if (
                                varContent === null ||
                                typeof varContent !== 'undefined'
                            ) {
                                interim = interim + varContent;
                            }
                        }
                        break;
                    }
                    case 'const': {
                        interim = interim + value;
                        break;
                    }
                    case 'op': {
                        interim = interim + value;
                        break;
                    }
                }
            }
            return interim;
        };
        return returnFunc;
    }

    initObservables() {
        // Reset the requestFrame
        this.requestFrame.frame = '';
        this.requestFrame.listings = 0;
        this.lutKeyVariable = [];
        // Reset the observables Map
        this.oVisuVariables = observable(new Map());
        this.globalVariables.forEach((keyValue) => {
            this.addObservableVar(keyValue.key, keyValue.addr);
        });
    }

    updateVarList(timeoutTime: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const signal = controller.signal;
            const timer = setTimeout(() => {
                controller.abort();
            }, timeoutTime);
            // Check if a primer fetch is running yet
            if (!this.runningFetch) {
                this.runningFetch = true;
                fetch(this.serverURL, {
                    method: 'POST',
                    signal: signal,
                    headers: { 'Content-Type': 'text/plain' },
                    body:
                        '|0|' +
                        this.requestFrame.listings +
                        '|' +
                        this.requestFrame.frame,
                })
                    .then(
                        (response) => {
                            response
                                .arrayBuffer()
                                .then((buffer: ArrayBuffer) => {
                                    const decoder = new TextDecoder(
                                        'iso-8859-1',
                                    );
                                    const text = decoder.decode(
                                        buffer,
                                    );
                                    const transferarray: Array<string> = text
                                        .slice(1, text.length - 1)
                                        .split('|');
                                    if (
                                        transferarray.length ===
                                        this.requestFrame.listings
                                    ) {
                                        for (
                                            let i = 0;
                                            i < transferarray.length;
                                            i++
                                        ) {
                                            const varName = this
                                                .lutKeyVariable[i];
                                            if (
                                                this.oVisuVariables.get(
                                                    varName,
                                                ).value !==
                                                transferarray[i]
                                            ) {
                                                action(
                                                    (this.oVisuVariables.get(
                                                        varName,
                                                    )!.value =
                                                        transferarray[
                                                            i
                                                        ]),
                                                );
                                            }
                                        }
                                        StateManager.singleton().oState.set(
                                            'ISONLINE',
                                            'TRUE',
                                        );
                                    }
                                    resolve(true);
                                });
                        },
                        (err) => {
                            reject(err);
                        },
                    )
                    .catch(() => {
                        console.warn('Connection lost');
                        StateManager.singleton().oState.set(
                            'ISONLINE',
                            'FALSE',
                        );
                        resolve(false);
                    })
                    .finally(() => {
                        clearTimeout(timer);
                        this.runningFetch = false;
                    });
            } else {
                /*
                console.warn(
                    'The duration of the variable fetch request is greater then the specified cyclus time in the webvisu.htm!',
                );
                */
                resolve(false);
            }
        });
    }

    startCyclicUpdate() {
        // Call the the updateVarList function cyclicly
        let updateTime = Number(
            StateManager.singleton().oState.get('UPDATETIME'),
        );
        if (typeof updateTime === 'undefined') {
            updateTime = 500;
        }
        const timeout = 5 * updateTime;
        this.intervalID = window.setInterval(
            () =>
                this.updateVarList(timeout).catch((error) => {
                    console.warn(error, timeout + 'ms');
                }),
            updateTime,
        );
    }

    stopCyclicUpdate() {
        window.clearInterval(this.intervalID);
        this.intervalID = undefined;
    }

    setValue(varName: string, varValue: number | string | boolean) {
        fetch(this.serverURL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body:
                '|1|1|0|' +
                this.oVisuVariables
                    .get(varName.toLowerCase())!
                    .addr.replace(/,/g, '|') +
                '|' +
                varValue +
                '|',
        });
    }

    // toggleValue : Wechselt den Wert einer boolschen Variablen
    toggleValue(varName: string) {
        const variableName = varName.toLowerCase();
        if (this.oVisuVariables.has(variableName)) {
            let value = Number(
                this.oVisuVariables.get(variableName)!.value,
            );
            if (value === 0 || value === 1) {
                value === 0 ? (value = 1) : (value = 0);
                this.setValue(varName, value);
            } else {
                throw new Error(
                    'The variable to be toggled is not a boolean!',
                );
            }
        } else {
            throw new Error('The variable is not defined!');
        }
    }
}
