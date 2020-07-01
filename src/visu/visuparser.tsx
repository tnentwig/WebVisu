import * as React from 'react';
import { get, set } from 'idb-keyval';
import { VisuElements } from '../visu/pars/elementparser';
import { stringToArray } from './pars/Utils/utilfunctions';
import { getVisuxml, stringifyVisuXML, parseVisuXML } from './pars/Utils/fetchfunctions';
import ComSocket from './communication/comsocket';
import StateManager from '../visu/statemanagement/statemanager';

type Props = {
    visuname : string,
    mainVisu : boolean,
    replacementSet : Map<string, string>,
    width : number
}

export const Visualisation :React.FunctionComponent<Props> = React.memo(({ visuname, mainVisu, replacementSet, width})=> {
    const [loading, setLoading] = React.useState<Boolean>(true);
    const [adaptedXML, setAdaptedXML] = React.useState<XMLDocument>(null);
    const [originSize, setOriginSize] = React.useState<Array<number>>([0,0]);
    const [scale, setScale] = React.useState("scale(1)");

    // Get new xml on change of visuname
    React.useEffect(()=>{
        let fetchXML = async function(){
            // Set the loading flag. This will unmount all elements from calling visu
            setLoading(true);
            let url = StateManager.singleton().oState.get("ROOTDIR") + "/"+ visuname +".xml";
            // Files that are needed several times will be saved internally for loading speed up
            let plainxml : string;
            if (await get(visuname) === undefined){
                let xml = await getVisuxml(url);
                if (xml == null){
                    console.log("The requested visualisation "+ visuname + " is not available!")
                } else {
                    plainxml = stringifyVisuXML(xml);
                    await set(visuname, plainxml);
                }
            } else {
                plainxml = await get(visuname);
            }
            
            if(plainxml !== null){
                let xmlDoc = parseVisuXML(plainxml);
                initVariables(xmlDoc, mainVisu);
                replacePlaceholders(xmlDoc, replacementSet);
                setAdaptedXML(xmlDoc);
                setOriginSize(stringToArray(xmlDoc.getElementsByTagName("visualisation")[0].getElementsByTagName("size")[0].innerHTML));
                setLoading(false);
            }
        };
        fetchXML();
        }, [visuname, mainVisu, replacementSet]);

    // Scaling on main window resize for responsive behavior
    React.useEffect(()=>{
        let xscaleFactor = width/(originSize[0]+2);
        let yscaleFactor = width/(originSize[0]+2);
        setScale("scale("+xscaleFactor.toString()+")");
    }, [width, originSize])

    
    return (
        <div style={{display:"block", position:"absolute", overflow:"hidden", left:0, top:0, width:originSize[0]+1, height:originSize[1]+1, transformOrigin:"0 0", transform:scale}}>
            {loading ? null :
                <VisuElements visualisation={adaptedXML}></VisuElements>
            }
        </div>
    )

})

function initVariables(XML : XMLDocument, reset : boolean) : void{
    let com = ComSocket.singleton();
    // We have to reset the varibales on comsocket, if necessary
    if (reset){
        com.initObservables()
    }
    // Rip all of <variable> in <variablelist> section
    let variables = XML.getElementsByTagName("visualisation")[0].getElementsByTagName("variablelist")[0].getElementsByTagName("variable");
    for (let i=0; i<variables.length; i++){
        let varName = variables[i].getAttribute("name")
        let rawAddress = variables[i].innerHTML;
        let varAddress = rawAddress.split(",").slice(0,4).join(",");
        // Add the variable to the observables if not already existent
        if (!com.oVisuVariables.has(varName)){
            com.addObservableVar(varName, varAddress);
        }
    }
}

function replacePlaceholders(data : XMLDocument, replacements : Map<string, string>){
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
                if(ComSocket.singleton().oVisuVariables.has("."+content)){
                    content = "." + content;
                }
                // Schlechte Implementierung von Codesys, Doppelpunkte durch einfügen von referenzen möglich
                let textContent = content.replace(/\.\./, '.');
                variable.textContent = textContent;
                placeholder.parentNode.replaceChild(variable, placeholder);
            }
        }
    })
}
