import * as $ from 'jquery';
import * as React from 'react';
import {uid} from 'react-uid';
import { VisuElements } from '../visu/pars/elementparser'
import { stringToArray } from './pars/Utils/utilfunctions'
import ComSocket from './communication/comsocket'
import StateManager from '../visu/statemanagement/statemanager'
import { Spinner } from '../supplements/Spinner/spinner'
import * as JsZip from 'jszip';

type Props = {
    visuname : string,
    mainVisu : boolean,
    replacementSet : Map<string, string>,
    width : number
}

function initVariables(XML : XMLDocument, reset : boolean) : void{
        let com = ComSocket.singleton();
        let visuXML=$(XML);
        // We have to reset the varibales on comsocket, if necessary
        if (reset){
            com.initObservables()
        }
        // Rip all of <variable> in <variablelist> section
        visuXML.children("visualisation").children("variablelist").children("variable").each(function(){
            let variable = $(this);
            let varAddress = variable.text().split(",").slice(0,4).join(",");
            // Add the variable to the observables if not already existent
            if (!com.oVisuVariables.has(variable.attr("name"))){
                com.addObservableVar(variable.attr("name"), varAddress);
            }
        });
}

function stringifyVisuXML(toStringify : XMLDocument) : string{
    let serializer = new XMLSerializer();
    let stringCopy = serializer.serializeToString(toStringify);
    return stringCopy;
}

function parseVisuXML(stringXML : string) : XMLDocument{
    let parser = new DOMParser();
    let returnXML = parser.parseFromString(stringXML, "application/xml");
    return returnXML;
}

function getVisuxml(url : string) :Promise<XMLDocument> {
    return new Promise(resolve =>{
        fetch(url, {headers:{'Content-Type': 'text/plain; charset=UTF8'}})
        .then((response)=>{
            if (response.status != 400){
                response.arrayBuffer()
                .then((buffer)=>{
                    let decoder = new TextDecoder("iso-8859-1");
                    let text = decoder.decode(buffer);
                    let data = new window.DOMParser().parseFromString(text, "text/xml")
                    resolve(data)
                })
                
            } else {
                let zip = new JsZip();
                let filename = url.split('/').pop()
                let zipName = filename.split(".")[0]+"_xml.zip"
                fetch(zipName, {headers:{'Content-Type': 'binary;'}})
                .then(response => response.arrayBuffer())
                .then((buffer)=>zip.loadAsync(buffer))
                .then((unzipped) => unzipped.file(filename).async("arraybuffer"))
                .then((buffer => {
                    let decoder = new TextDecoder("iso-8859-1");
                    let text = decoder.decode(buffer);
                    let data = new window.DOMParser().parseFromString(text, "text/xml")
                    resolve(data)
                }))
            }
        })    
    })
}

function replacePlaceholders(data : XMLDocument, replacements : Map<string, string>){
    // Find all placeholder variables 
    let placeholders = data.getElementsByTagName("placeholder");
    // Replace all Placeholders
    Array.from(placeholders).forEach(function (placeholder){
        let regEx = new RegExp(/\$(.*)\$/gm);
        let match = regEx.exec(placeholder.textContent);
        // Replacement
        if (match != null){
            let replace = match[1];
            if (replacements.has(replace)){
                let variable = data.createElement('var');
                let content = placeholder.textContent.replace(/\$(.*)\$/, replacements.get(replace));
                if(ComSocket.singleton().oVisuVariables.has("."+content)){
                    content = "."+content;
                }
                
                // Schlechte Implementierung von Codesys, Doppelpunkte durch einfügen von referenzen möglich
                let textContent = content.replace(/\.\./, '.');
                variable.textContent = textContent.toLowerCase();
                placeholder.parentNode.replaceChild(variable, placeholder);
            } 
        } 
    })
}

export const Visualisation :React.FunctionComponent<Props> = ({visuname, mainVisu, replacementSet, width})=> {
    const [loading, setLoading] = React.useState<Boolean>(true);
    const [thisVisuname, setVisuname] = React.useState<string>(visuname);
    const [XML, setXML] = React.useState<string>(null);
    const [adaptedXML, setAdaptedXML] = React.useState<XMLDocument>();
    const [originSize, setOriginSize] = React.useState<Array<number>>([0,0]);
    const [scale, setScale] = React.useState("scale(1)");

    // dd
    React.useEffect(()=>{
        console.log("Aufruf mount")
        return (()=>{setLoading(true);
        console.log("unmount")})
    },[])
    React.useEffect(()=>{
        if(visuname !== thisVisuname){
            setVisuname(visuname);
        }
    },[visuname, thisVisuname])

    // Get new xml on change of visuname
    React.useEffect(()=>{
        console.log("fetch "+thisVisuname)
        let fetchXML = async function(){
            // Set the loading flag. This will unmount all elements from calling visu
            setLoading(true);
            let url = StateManager.singleton().oState.get("ROOTDIR") + "/"+ thisVisuname +".xml";
            // Files that are needed several times will be saved internally for loading speed up
            let plainxml : string;
            let xmlDict = StateManager.singleton().xmlDict;
            if (xmlDict.has(thisVisuname)){
                plainxml = xmlDict.get(thisVisuname);
            } else {
                let xml = await getVisuxml(url);
                plainxml = stringifyVisuXML(xml);
                xmlDict.set(thisVisuname, plainxml);
            }
            setXML(plainxml);
            
        };
        fetchXML();
        }, [thisVisuname]);

    // Adapt the original xml through replacing of placeholders
    React.useEffect(()=>{
        if(XML !== null){
            let xmlDoc = parseVisuXML(XML);
            initVariables(xmlDoc, mainVisu);
            replacePlaceholders(xmlDoc, replacementSet);
            setAdaptedXML(xmlDoc);
            setLoading(false);
            // Get the original size of the visualisation
            let jQxml=$(xmlDoc);
            setOriginSize(stringToArray(jQxml.children("visualisation").children("size").text()));
        }
    },[XML, mainVisu, replacementSet])

    // Scaling on main window resize for responsive behavior
    React.useEffect(()=>{
        let scaleFactor = width/(originSize[0]+2);
        setScale("scale("+scaleFactor.toString()+")");
    }, [width, originSize, mainVisu])

    return (
        <div key={uid(16)} style={{position:"absolute", overflow:"hidden", left:0, top:0, width:originSize[0]+1, height:originSize[1]+1, transformOrigin:"0 0", transform:scale}}>
            {loading ? <Spinner></Spinner> :
                <VisuElements visualisation={adaptedXML}></VisuElements>
            }
        </div>
    )
}
