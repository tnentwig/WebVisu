import * as JsZip from 'jszip';
import StateManager from '../../statemanagement/statemanager';

export function getVisuxml2(url : string) : Promise<XMLDocument> {
    return new Promise(resolve =>{
        let encoding = StateManager.singleton().oState.get("ENCODINGSTRING");
        if(encoding === undefined){
            encoding = "iso-8859-1";
        }
        // Check if the compressed flag on statemanager is set
        let compressed = false;
        if (StateManager.singleton().oState.get("COMPRESSION") !== null){
            if(StateManager.singleton().oState.get("COMPRESSION") === "TRUE"){
                compressed = true;
            } else {
                compressed = false;
            }
        }
        // Fetch the xml as unzipped file
        if(!compressed){
            fetch(url, {headers:{'Content-Type': 'text/plain; charset=UTF8'}})
            .then((response)=>{
                
                if (response.ok){
                    response.arrayBuffer()
                    .then((buffer)=>{
                        let decoder = new TextDecoder(encoding);
                        let text = decoder.decode(buffer);
                        let data = new window.DOMParser().parseFromString(text, "text/xml");
                        resolve(data)
                    })
                } else {
                    resolve(null)
                }
            })
        } 
        // Fetch the visu as zipped file
        else if (compressed){
            let zip = new JsZip();
            let urlStack = url.split('/');
            let filename = urlStack.pop();
            let zipName = filename.split(".")[0]+"_xml.zip"
            // Push the zip filename to stack
            urlStack.push(zipName);
            fetch(urlStack.join('/'), {headers:{'Content-Type': 'binary;'}})
            .then((response)=>{
                // Try to fetch the xml as unzipped file
                if (response.ok){
                    response.arrayBuffer()
                    .then((buffer)=>zip.loadAsync(buffer))
                    .then((unzipped) => unzipped.file(filename).async("arraybuffer"))
                    .then((buffer => {
                        let decoder = new TextDecoder(encoding);
                        let text = decoder.decode(buffer);
                        let data = new window.DOMParser().parseFromString(text, "text/xml");
                        resolve(data)
                    }))
                } else {
                    resolve(null)
                }
            })
        }
    })
}

export function getVisuxml(url : string) : Promise<XMLDocument> {
    return new Promise(async resolve =>{
        // Get the root path
        let rootPathArray = url.split("/");
        rootPathArray.pop();
        let rootPath = rootPathArray.join("/")+"/";
        // Get the main visualisation
        let protoXml = await getVisuxml2(url);

        let elements =protoXml.getElementsByTagName("element");
        // Get all possible variables of main visu
        let variableArray = [];
        let mainVariables = protoXml.getElementsByTagName("variablelist")[0].children;
        for (let g=0; g<mainVariables.length; g++){
            variableArray.push(mainVariables[g].getAttribute("name").toLowerCase())
        }

        for (let i=0; i<elements.length; i++){
            // Search for subvisualisations which have to be requested subsequently
            if (elements[i].hasAttribute("type")){
                // A subvisu is found if type is a reference
                if(elements[i].getAttribute("type") === "reference"){
                    // Iterate over the child nodes to find the name of the subvisu
                    let childs = elements[i].children;
                    let length = childs.length;
                    // Get the placeholders of the reference
                    let placeholders = getPlaceholders(elements[i]);

                    // Iterate over the childs to find the subvisu name
                    for (let j=0; j<length; j++){
                        if(childs[j].nodeName === "name"){
                            let visuname = childs[j].textContent;
                            let subvisuXml = await getVisuxml2(rootPath + visuname.toLowerCase()+ ".xml");                    
                            // Replace the found placeholders
                            replacePlaceholders(subvisuXml, variableArray, placeholders);
                            // Copy all child nodes of subvisu to reference node of main visu
                            for (let k=0; k<subvisuXml.children[0].children.length; k++){
                                if (subvisuXml.children[0].children[k].nodeName !== "variablelist"){
                                    childs[j].parentNode.appendChild(subvisuXml.children[0].children[k]);
                                    // Appending the child will remove this child from subvisuXml. So we have to dekrement the access variable
                                    k--;
                                }else{
                                    let subvisuVars = subvisuXml.children[0].children[k].children;
                                    for (let v= 0; v < subvisuVars.length; v++){
                                        protoXml.getElementsByTagName("variablelist")[0].appendChild(subvisuVars[v]);
                                        // Appending the child will remove this child from subvisuXml. So we have to dekrement the access variable
                                        v--;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        resolve(protoXml)
    })
}



function replacePlaceholders(data : XMLDocument, mainVariables : Array<string>, replacements : Map<string, string>){
    if (replacements === null){
        return
    }
    // Find all placeholder variables 
    let placeholders = data.getElementsByTagName("placeholder");
    // Replace all Placeholders
    Array.from(placeholders).forEach(function (placeholder){
        let regEx = new RegExp(/\$(.*)\$/gm);
        let match = regEx.exec(placeholder.textContent);
        // Replacement
        if (match != null){
            let replace = match[1].toLowerCase();
            if (replacements.has(replace)){
                let variable = data.createElement('var');
                let content = placeholder.textContent.replace(/\$(.*)\$/, replacements.get(replace)).toLowerCase();

                if(mainVariables.includes("."+content)){
                    content = "." + content;
                }
                // Schlechte Implementierung von Codesys, Doppelpunkte durch einfügen von referenzen möglich
                let textContent = content.replace(/\.\./, ".");
                variable.textContent = textContent;
                placeholder.parentNode.replaceChild(variable, placeholder);
            }
        }
    })
}

function getPlaceholders(section : Element){
    let placeholders : Map<string,string> = new Map();
    let placeholderentry = section.getElementsByTagName("placeholderentry");
    for (let i=0; i<placeholderentry.length; i++){
        let variable = placeholderentry[i];
        let placeholder = variable.getAttribute("placeholder");
        let replacement = variable.getAttribute("replacement");
        placeholders.set(placeholder.toLowerCase(), replacement.toLowerCase())
    }
    return placeholders;
}

export function stringifyVisuXML(toStringify : XMLDocument) : string{
    let serializer = new XMLSerializer();
    let stringCopy = serializer.serializeToString(toStringify);
    return stringCopy;
}

export function parseVisuXML(stringXML : string) : XMLDocument{
    let parser = new DOMParser();
    let returnXML = parser.parseFromString(stringXML, "application/xml");
    return returnXML;
}

export function getImage(url : string) :Promise<string> {
    // Calculate the mimeType
    let mimeType = "";
    let fileFormat = url.split(".").pop();
    switch(fileFormat){
        case "bmp":
            mimeType = "image/bmp";
            break;
        case "jpeg":
            mimeType = "image/jpeg";
            break;
        case "jpg":
            mimeType = "image/jpeg";
            break;
    }
    
    return new Promise(resolve =>{
        let base64Flag = 'data:'+mimeType+';base64,'
        fetch(url)
        .then((response)=>{
            // Try to fetch the xml as unzipped file
            if (response.ok){
                response.arrayBuffer()
                .then((buffer)=>{
                    let binary = '';
                    let bytes = new Uint8Array(buffer);
                    bytes.forEach((b) => binary += String.fromCharCode(b));
                    let base64 = window.btoa(binary);
                    resolve(base64Flag +base64)
                })
            }
            // Try to fetch the visu as zipped file
            else {
                let zip = new JsZip();
                let urlStack = url.split('/');
                let filename = urlStack.pop();
                let zipName = filename.split(".")[0]+"_"+fileFormat+".zip"
                // Push the zip filename to stack
                urlStack.push(zipName);
                fetch(urlStack.join('/'))
                .then((response)=>{
                    // Try to fetch the xml as unzipped file
                    if (response.ok){
                        response.arrayBuffer()
                        .then((buffer)=>zip.loadAsync(buffer))
                        .then((unzipped) => unzipped.file(filename).async("arraybuffer"))
                        .then((buffer)=>{
                            let binary = '';
                            let bytes = new Uint8Array(buffer);
                            bytes.forEach((b) => binary += String.fromCharCode(b));
                            let base64 = window.btoa(binary);
                            resolve(base64Flag +base64)
                        })
                    } else {
                        resolve(null)
                    }
                })
            }
        })
    })
}
