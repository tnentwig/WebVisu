import { unzipSync } from 'fflate';
import StateManager from '../../statemanagement/statemanager';

function replacePlaceholders(
    data: XMLDocument,
    mainVariables: Array<string>,
    replacements: Map<string, string>,
) {
    if (replacements === null) {
        return;
    }
    // Find all placeholder variables
    const placeholders = data.getElementsByTagName('placeholder');
    // Replace all Placeholders
    Array.from(placeholders).forEach(function (placeholder) {
        const regEx = new RegExp(/\$(.*?)\$/gm);
        let content = placeholder.textContent;
        let match = regEx.exec(content);
        let replaced = false;
        // Replacement
        while (match !== null) {
            if (typeof match !== 'undefined') {
                const replace = match[1].toLowerCase();
                if (replacements.has(replace)) {
                    replaced = true;
                    content = content
                        .replace(match[0], replacements.get(replace))
                        .toLowerCase();
                }
                match = regEx.exec(placeholder.textContent);
            }
        }
        if (replaced) {
            if (mainVariables.includes('.' + content)) {
                content = '.' + content;
            }
            // Bad implementation of Codesys, colons possible by inserting references
            const textContent = content.replace(/\.\./, '.');
            const variable = data.createElement('var');
            variable.textContent = textContent;
            placeholder.parentNode.replaceChild(
                variable,
                placeholder,
            );
        }
    });
}

function getPlaceholders(section: Element) {
    const placeholders: Map<string, string> = new Map();
    const placeholderentry = section.getElementsByTagName(
        'placeholderentry',
    );
    for (let i = 0; i < placeholderentry.length; i++) {
        const variable = placeholderentry[i];
        const placeholder = variable.getAttribute('placeholder');
        const replacement = variable.getAttribute('replacement');
        placeholders.set(
            placeholder.toLowerCase(),
            replacement.toLowerCase(),
        );
    }
    return placeholders;
}

function checkCompression() {
    // Check if the compressed flag on statemanager is set
    let compressedFiles = false;
    if (StateManager.singleton().oState.get('COMPRESSION') !== null) {
        if (
            StateManager.singleton().oState.get('COMPRESSION') ===
            'TRUE'
        ) {
            compressedFiles = true;
        }
    }
    return compressedFiles;
}

export function stringifyVisuXML(toStringify: XMLDocument): string {
    const serializer = new XMLSerializer();
    const stringCopy = serializer.serializeToString(toStringify);
    return stringCopy;
}

export function parseVisuXML(stringXML: string): XMLDocument {
    const parser = new DOMParser();
    const returnXML = parser.parseFromString(
        stringXML,
        'application/xml',
    );
    return returnXML;
}

export function getImage_(url: string): Promise<string> {
    // Calculate the mimeType
    let mimeType = '';
    const fileFormat = url.split('.').pop();
    switch (fileFormat) {
        case 'bmp': {
            mimeType = 'image/bmp';
            break;
        }
        case 'jpeg': {
            mimeType = 'image/jpeg';
            break;
        }
        case 'jpg': {
            mimeType = 'image/jpeg';
            break;
        }
        case 'png': {
            mimeType = 'image/png';
            break;
        }
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        const base64Flag = 'data:' + mimeType + ';base64,';
        const zipped = checkCompression();
        // Fetch the image as unzipped file
        if (!zipped) {
            fetch(url).then((response) => {
                if (response.ok) {
                    response.arrayBuffer().then((buffer) => {
                        let binary = '';
                        const bytes = new Uint8Array(buffer);
                        bytes.forEach(
                            (b) => (binary += String.fromCharCode(b)),
                        );
                        const base64 = window.btoa(binary);
                        resolve(base64Flag + base64);
                    });
                } else {
                    resolve(null);
                }
            });
        }
        // Fetch the image as zipped file
        else if (zipped) {
            const urlStack = url.split('/');
            const filename = urlStack.pop();
            const zipName =
                filename.split('.')[0] + '_' + fileFormat + '.zip';
            // Push the zip filename to stack
            urlStack.push(zipName);
            fetch(urlStack.join('/')).then((response) => {
                if (response.ok) {
                    response.arrayBuffer().then((buffer) => {
                        const dataArray = unzipSync(
                            new Uint8Array(buffer),
                        );
                        let binary = '';
                        dataArray[filename].forEach(
                            (b) => (binary += String.fromCharCode(b)),
                        );
                        const base64 = window.btoa(binary);
                        resolve(base64Flag + base64);
                    });
                } else {
                    resolve(null);
                }
            });
        }
    });
}

export function getImage(url: string): Promise<string> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        const urlStack = url.split('/');
        const fileName = urlStack.pop();
        let base64Img: string;
        if (sessionStorage.getItem(fileName)) {
            base64Img = sessionStorage.getItem(fileName);
            console.log(base64Img);
            resolve(base64Img);
        } else {
            base64Img = await getImage_(url);
            sessionStorage.setItem(fileName, base64Img);
            resolve(base64Img);
        }
    });
}

export function getVisuXML_(url: string): Promise<XMLDocument> {
    return new Promise((resolve) => {
        let encoding =
            StateManager.singleton().oState.get('ENCODINGSTRING');
        if (typeof encoding === 'undefined') {
            encoding = 'iso-8859-1';
        }
        const zipped = checkCompression();
        // Fetch the xml as unzipped file
        if (!zipped) {
            fetch(url + Date.now(), {
                headers: {
                    'Content-Type': 'text/plain; charset=UTF-8',
                },
            }).then((response) => {
                if (response.ok) {
                    response.arrayBuffer().then((buffer) => {
                        const decoder = new TextDecoder(encoding);
                        const text = decoder.decode(buffer);
                        const data =
                            new window.DOMParser().parseFromString(
                                text,
                                'text/xml',
                            );
                        resolve(data);
                    });
                } else {
                    resolve(null);
                }
            });
        }
        // Fetch the visu as zipped file
        else if (zipped) {
            const urlStack = url.split('/');
            const filename = urlStack.pop();
            const zipName = filename.split('.')[0] + '_xml.zip';
            // Push the zip filename to stack
            urlStack.push(zipName);
            fetch(urlStack.join('/') + '?v=' + Date.now(), {
                headers: { 'Content-Type': 'binary;' },
            }).then((response) => {
                if (response.ok) {
                    response.arrayBuffer().then((buffer) => {
                        const dataArray = unzipSync(
                            new Uint8Array(buffer),
                        );
                        const decoder = new TextDecoder(encoding);
                        const text = decoder.decode(
                            dataArray[filename],
                        );
                        const data =
                            new window.DOMParser().parseFromString(
                                text,
                                'text/xml',
                            );
                        resolve(data);
                    });
                } else {
                    resolve(null);
                }
            });
        }
    });
}

export function getVisuXML(url: string): Promise<XMLDocument> {
    // prettier-ignore
    return new Promise(async (resolve) => { // eslint-disable-line no-async-promise-executor
        // Get the root path
        const rootPathArray = url.split('/');
        rootPathArray.pop();
        const rootPath = rootPathArray.join('/') + '/';
        // Get the main visualisation
        const protoXml = await getVisuXML_(url);
        // const subvisus : Map<string, XMLDocument> = new Map();
        const elements = protoXml.getElementsByTagName('element');
        // Get all possible variables of main visu
        const variableArray = [];
        const mainVariables = protoXml.getElementsByTagName(
            'variablelist',
        )[0].children;
        for (let g = 0; g < mainVariables.length; g++) {
            variableArray.push(
                mainVariables[g].getAttribute('name').toLowerCase(),
            );
        }
        for (let i = 0; i < elements.length; i++) {
            // Search for subvisualisations which have to be requested subsequently
            if (elements[i].hasAttribute('type')) {
                // A subvisu is found if type is a reference
                if (
                    elements[i].getAttribute('type') === 'reference'
                ) {
                    // Iterate over the child nodes to find the name of the subvisu
                    const childs = elements[i].children;
                    const length = childs.length;
                    // Get the placeholders of the reference
                    const placeholders = getPlaceholders(elements[i]);
                    // Iterate over the childs to find the subvisu name
                    for (let j = 0; j < length; j++) {
                        if (childs[j].nodeName === 'name') {
                            const visuName = childs[j].textContent;
                            let subvisuXml : XMLDocument;
                            if (sessionStorage.getItem(visuName)) {
                                subvisuXml = parseVisuXML(sessionStorage.getItem(visuName));
                            } else {
                                subvisuXml = await getVisuXML(
                                    rootPath +
                                        visuName.toLowerCase() +
                                        '.xml',
                                );
                                sessionStorage.setItem(visuName, stringifyVisuXML(subvisuXml));
                            }
                            // Replace the found placeholders
                            replacePlaceholders(
                                subvisuXml,
                                variableArray,
                                placeholders,
                            );
                            // Copy all child nodes of subvisu to reference node of main visu
                            for (
                                let k = 0;
                                k <
                                subvisuXml.children[0].children
                                    .length;
                                k++
                            ) {
                                if (
                                    subvisuXml.children[0].children[k]
                                        .nodeName !== 'variablelist'
                                ) {
                                    childs[j].parentNode.appendChild(
                                        subvisuXml.children[0]
                                            .children[k],
                                    );
                                    // Appending the child will remove this child from subvisuXml. So we have to dekrement the access variable
                                    k--;
                                } else {
                                    const subvisuVars =
                                        subvisuXml.children[0]
                                            .children[k].children;
                                    for (
                                        let v = 0;
                                        v < subvisuVars.length;
                                        v++
                                    ) {
                                        protoXml
                                            .getElementsByTagName(
                                                'variablelist',
                                            )[0]
                                            .appendChild(
                                                subvisuVars[v],
                                            );
                                        // Appending the child will remove this child from subvisuXml. So we have to dekrement the access variable
                                        v--;
                                    }
                                }
                            }
                        }
                    }
                } else if (
                    elements[i].getAttribute('type') === 'bitmap'
                ) {
                    null;
                }
            }
        }
        resolve(protoXml);
    });
}
