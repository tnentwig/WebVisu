import * as React from 'react';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import ComSocket from '../../../../communication/comsocket';
import { stringToArray } from '../../../Utils/utilfunctions';
import {
    getLastModified,
    getImage,
} from '../../../Utils/fetchfunctions';
import { stringToBoolean } from '../../../Utils/utilfunctions';
import { get, set } from 'idb-keyval';

type Props = {
    section: Element;
    inlineElement: boolean;
};

export const ImageField: React.FunctionComponent<Props> = ({
    section,
    inlineElement,
}) => {
    // Auxiliary variables
    const rect = stringToArray(
        section.getElementsByTagName('rect')[0].innerHTML,
    );

    const initial = {
        // frameType defines the type of scaling. Possible are isotrophic, anisotrophic or static
        frameType: section.getElementsByTagName('frame-type')[0]
            .innerHTML,
        inlineDimensions: '100%',
        // Dimensions of the surrounding div
        rectHeight: rect[3] - rect[1],
        rectWidth: rect[2] - rect[0],
        // Dimensions of the original
        naturalHeight: rect[3] - rect[1],
        naturalWidth: rect[2] - rect[0],
        // Percent dimensions
        percHeight: '',
        percWidth: '',
        // Name of the file
        fixedFileName: '',
        dynamicFileName: '',
        clipFrame: true,
    };

    if (section.getElementsByTagName('expr-fill-color').length) {
        const expression = section
            .getElementsByTagName('expr-fill-color')[0]
            .getElementsByTagName('expr');
        const varName = expression[0]
            .getElementsByTagName('var')[0]
            .innerHTML.toLocaleLowerCase();

        Object.defineProperty(initial, 'dynamicFileName', {
            get: function () {
                const rawFilename = ComSocket.singleton()
                    .oVisuVariables.get(varName)!
                    .value.toLocaleLowerCase();
                return rawFilename;
            },
        });
    }

    /*
    // With surrounding frame?
    if (inlineElement){
        if(section.getElementsByTagName("no-frame-around-bitmap")[0].innerHTML.length){
            initial.inlineDimensions = "100%";
        } else {
            initial.inlineDimensions = "92%";
        }
    }
    */

    switch (initial.frameType) {
        case 'static': {
            break;
        }
        case 'isotropic': {
            // initial.maxWidth = initial.inlineDimensions;
            // initial.maxHeight = initial.inlineDimensions;
            initial.percWidth = initial.inlineDimensions;
            initial.percHeight = initial.inlineDimensions;
            /*
            if (!inlineElement) {
                initial.margin = 'top';
            }
            */
            break;
        }
        case 'anisotropic': {
            initial.percWidth = initial.inlineDimensions;
            initial.percHeight = initial.inlineDimensions;
            // initial.viewBox = '0 0 ' + initial.rectWidth + ' ' + initial.rectHeight;
            break;
        }
    }

    // Set the fileName, it could be a variable or static
    if (section.getElementsByTagName('file-name').length) {
        if (
            section.getElementsByTagName('file-name')[0].innerHTML
                .length
        ) {
            Object.defineProperty(initial, 'fixedFileName', {
                get: function () {
                    const rawFileName = section
                        .getElementsByTagName('file-name')[0]
                        .innerHTML.replace(/.*\\/, '')
                        .replace(/].*/, '');
                    return rawFileName;
                },
            });
        }
    }
    
    // Set the fileName, it could be a variable or static
    if (section.getElementsByTagName('clip-frame').length) {
        if (
            section.getElementsByTagName('clip-frame')[0].innerHTML
                .length
        ) {
            Object.defineProperty(initial, 'clipFrame', {
                get: function () {
                    const clipFrame = stringToBoolean(
                        section.getElementsByTagName('clip-frame')[0].innerHTML,
                    );
                    return clipFrame;
                },
            });
        }
    }

    const [fileName, setFileName] = React.useState<string>(null);

    React.useEffect(() => {
        const fetchImage = async function () {
            let rawFileName: string = null;
            if (
                initial.dynamicFileName !== null &&
                typeof initial.dynamicFileName !== 'undefined' &&
                initial.dynamicFileName !== ''
            ) {
                rawFileName = initial.dynamicFileName;
            } else if (
                initial.fixedFileName !== null &&
                typeof initial.fixedFileName !== 'undefined' &&
                initial.fixedFileName !== ''
            ) {
                rawFileName = initial.fixedFileName;
            }
            if (
                rawFileName !== null &&
                typeof rawFileName !== 'undefined' &&
                rawFileName !== ''
            ) {
                // Try to get the image from cache
                let plainImg: string = null;
                const path =
                    ComSocket.singleton()
                        .getServerURL()
                        .replace('webvisu.htm', '') + rawFileName;
                const lastModified = await getLastModified(
                    path,
                    true,
                );
                if (
                    typeof (await get(rawFileName)) === 'undefined' ||
                    localStorage.getItem(rawFileName) !== lastModified
                ) {
                    console.log(
                        rawFileName + ' Last-Modified: ',
                        lastModified,
                    );
                    // Save the last modified
                    localStorage.setItem(rawFileName, lastModified);
                    plainImg = await getImage(path);
                    if (
                        typeof plainImg === 'undefined' ||
                        plainImg === null
                    ) {
                        console.warn(
                            'The requested image ' +
                                rawFileName +
                                ' is not available!',
                        );
                    } else {
                        await set(rawFileName, plainImg);
                    }
                } else {
                    plainImg = await get(rawFileName);
                }

                if (plainImg !== null) {
                    setFileName(plainImg);
                }
            }
        };
        fetchImage();
    }, [initial.fixedFileName, initial.dynamicFileName]);

    const state = useLocalStore(() => initial);
    return useObserver(() => (
        <React.Fragment>
            <svg
                width={inlineElement ? initial.rectWidth - 4 : '100%'}
                height={
                    inlineElement ? initial.rectHeight - 4 : '100%'
                }
                overflow={state.clipFrame ? 'hidden' : 'visible'}
            >
                <image
                    style={{
                        width: state.percWidth,
                        height: state.percHeight,
                        position: 'absolute',
                        pointerEvents: 'none',
                        textAlign: 'center',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                    }}
                    preserveAspectRatio={
                        state.frameType === 'anisotropic'
                            ? 'none'
                            : state.frameType === 'isotropic'
                            ? 'xMinYMin meet'
                            : null
                    }
                    href={
                        (state.dynamicFileName !== null &&
                            typeof state.dynamicFileName !==
                                'undefined' &&
                            state.dynamicFileName !== '') ||
                        (state.fixedFileName !== null &&
                            typeof state.fixedFileName !==
                                'undefined' &&
                            state.fixedFileName !== '')
                            ? fileName
                            : null
                    }
                ></image>
            </svg>
        </React.Fragment>
    ));
};
