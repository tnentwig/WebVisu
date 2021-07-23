import * as React from 'react';
import { VisuElements } from './pars/elementparser';
import { stringToArray } from './pars/Utils/utilfunctions';
import {
    getVisuXML,
    stringifyVisuXML,
    parseVisuXML,
} from './pars/Utils/fetchfunctions';
import ComSocket from './communication/comsocket';
import StateManager from './statemanagement/statemanager';

type Props = {
    visuName: string;
    width: number;
    height: number;
    showFrame: boolean;
    clipFrame: boolean;
    isoFrame: boolean;
    originalFrame: boolean;
    originalScrollableFrame: boolean;
    noFrameOffset: boolean;
};

async function initVariables(XML: XMLDocument) {
    const com = ComSocket.singleton();
    // We have to reset the varibales on comsocket, if necessary
    com.stopCyclicUpdate();
    com.initObservables();
    // Rip all of <variable> in <variablelist> section
    let variables = XML.getElementsByTagName('visualisation')[0]
        .getElementsByTagName('variablelist')[0]
        .getElementsByTagName('variable');
    for (let i = 0; i < variables.length; i++) {
        const varName = variables[i].getAttribute('name');
        const rawAddress = variables[i].innerHTML;
        const varAddress = rawAddress
            .split(',')
            .slice(0, 4)
            .join(',');
        // Add the variable to the observables if not already existent
        if (!com.oVisuVariables.has(varName.toLowerCase())) {
            com.addObservableVar(varName, varAddress);
        }
    }

    // Rip all of <complexvariable> in <variablelist> section
    variables = XML.getElementsByTagName('visualisation')[0]
        .getElementsByTagName('variablelist')[0]
        .getElementsByTagName('complexvariable');
    for (let i = 0; i < variables.length; i++) {
        const varName = variables[i].getAttribute('name');
        const rawAddress = variables[i].innerHTML;
        const varAddress = 'complex,'.concat(
            rawAddress.split(',').slice(0, 3).join(','),
        );
        // Add the variable to the observables if not already existent
        if (!com.oVisuVariables.has(varName.toLowerCase())) {
            com.addObservableVar(varName, varAddress);
        }
    }
    await com.updateVarList(1000).catch((error) => {
        console.warn(error);
    });
    com.startCyclicUpdate();
}

export const Visualisation: React.FunctionComponent<Props> =
    React.memo(
        ({
            visuName,
            width,
            height,
            // showFrame,
            clipFrame,
            isoFrame,
            originalFrame,
            // originalScrollableFrame,
            // noFrameOffset,
        }) => {
            const [loading, setLoading] =
                React.useState<boolean>(true);
            const [adaptedXML, setAdaptedXML] =
                React.useState<Element>(null);
            const [originSize, setOriginSize] = React.useState<
                Array<number>
            >([0, 0]);
            const [scale, setScale] = React.useState('scale(1)');

            // Get new xml on change of visuName
            React.useEffect(() => {
                const fetchXML = async function () {
                    // Set the loading flag. This will unmount all elements from calling visu
                    setLoading(true);
                    const url =
                        StateManager.singleton().oState.get(
                            'ROOTDIR',
                        ) +
                        '/' +
                        visuName +
                        '.xml';
                    /* 
                        Files that are needed several times will be saved internally for loading speed up
                        A suitable parameter to check if a Visualisation has changed would be the Last-Modified Parameter. Unfortunately older controller send the momentary timestamp.
                        So the best solution is to save it inside the session.
                    */
                    let plainxml: string;

                    if (sessionStorage.getItem(visuName)) {
                        plainxml = sessionStorage.getItem(visuName);
                    } else {
                        const xml = await getVisuXML(url);
                        if (
                            typeof xml === 'undefined' ||
                            xml === null
                        ) {
                            console.warn(
                                'The requested visualisation ' +
                                    visuName +
                                    ' is not available!',
                            );
                        } else {
                            plainxml = stringifyVisuXML(xml);
                            sessionStorage.setItem(
                                visuName,
                                plainxml,
                            );
                        }
                    }

                    if (plainxml !== null) {
                        const xmlDoc = parseVisuXML(plainxml);
                        await initVariables(xmlDoc);
                        setAdaptedXML(xmlDoc.children[0]);
                        setOriginSize(
                            stringToArray(
                                xmlDoc
                                    .getElementsByTagName(
                                        'visualisation',
                                    )[0]
                                    .getElementsByTagName('size')[0]
                                    .innerHTML,
                            ),
                        );
                        setLoading(false);
                    }
                };
                fetchXML();
            }, [visuName]);

            // Scaling on main window resize for responsive behavior
            React.useEffect(() => {
                const xscaleFactor = width / (originSize[0] + 2);
                const yscaleFactor = height / (originSize[1] + 2);
                if (originalFrame) {
                    setScale(
                        'scale(' +
                            (
                                (originSize[0] / (originSize[0] + 2) +
                                    originSize[1] /
                                        (originSize[1] + 2)) /
                                2
                            ).toString() +
                            ')',
                    );
                } else if (isoFrame) {
                    setScale(
                        'scale(' +
                            Math.min(
                                xscaleFactor,
                                yscaleFactor,
                            ).toString() +
                            ')',
                    );
                } else {
                    setScale(
                        'scale(' +
                            xscaleFactor.toString() +
                            ',' +
                            yscaleFactor.toString() +
                            ')',
                    );
                }
            }, [width, height, originSize, originalFrame, isoFrame]);

            return (
                <div
                    style={{
                        display: 'block',
                        position: 'absolute',
                        overflow: clipFrame ? 'hidden' : 'visible',
                        left: 0,
                        top: 0,
                        width: originSize[0] + 1,
                        height: originSize[1] + 1,
                        transformOrigin: '0 0',
                        transform: scale,
                    }}
                >
                    {loading ? null : (
                        <VisuElements
                            visualisation={adaptedXML}
                        ></VisuElements>
                    )}
                </div>
            );
        },
    );
