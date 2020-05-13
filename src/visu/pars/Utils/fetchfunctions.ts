import * as JsZip from 'jszip';

export function getVisuxml(url : string) :Promise<XMLDocument> {
    return new Promise(resolve =>{
        fetch(url, {headers:{'Content-Type': 'text/plain; charset=UTF8'}})
        .then((response)=>{
            // Try to fetch the xml as unzipped file
            if (response.ok){
                response.arrayBuffer()
                .then((buffer)=>{
                    let decoder = new TextDecoder("iso-8859-1");
                    let text = decoder.decode(buffer);
                    let data = new window.DOMParser().parseFromString(text, "text/xml")
                    resolve(data)
                })
                
            }
            // Try to fetch the visu as zipped file
            else {
                let zip = new JsZip();
                let filename = url.split('/').pop()
                let zipName = filename.split(".")[0]+"_xml.zip"
                fetch(zipName, {headers:{'Content-Type': 'binary;'}})
                .then((response)=>{
                    // Try to fetch the xml as unzipped file
                    if (response.ok){
                        response.arrayBuffer()
                        .then((buffer)=>zip.loadAsync(buffer))
                        .then((unzipped) => unzipped.file(filename).async("arraybuffer"))
                        .then((buffer => {
                            let decoder = new TextDecoder("iso-8859-1");
                            let text = decoder.decode(buffer);
                            let data = new window.DOMParser().parseFromString(text, "text/xml")
                            resolve(data)
                        }))
                    } else {
                        resolve(null)
                    }
                })
            }
        })
    })
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