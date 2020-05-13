import * as $ from 'jquery';
import * as React from 'react';
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

export const Visualisation :React.FunctionComponent<Props> = React.memo(({ visuname, mainVisu, replacementSet, width})=> {
    const [loading, setLoading] = React.useState<Boolean>(true);
    const [display, setDisplay] = React.useState("block");
    const [XML, setXML] = React.useState<string>(null);
    const [adaptedXML, setAdaptedXML] = React.useState<XMLDocument>(null);
    const [originSize, setOriginSize] = React.useState<Array<number>>([0,0]);
    const [scale, setScale] = React.useState("scale(1)");

    // Get new xml on change of visuname
    React.useEffect(()=>{
        //console.log("fetch "+thisVisuname)
        let fetchXML = async function(){
            // Set the loading flag. This will unmount all elements from calling visu
            setLoading(true);
            let url = StateManager.singleton().oState.get("ROOTDIR") + "/"+ visuname +".xml";
            // Files that are needed several times will be saved internally for loading speed up
            let plainxml : string;
            let xmlDict = StateManager.singleton().xmlDict;
            if (xmlDict.has(visuname)){
                plainxml = xmlDict.get(visuname);
            } else {
                let xml = await getVisuxml(url);
                plainxml = stringifyVisuXML(xml);
                xmlDict.set(visuname, plainxml);
            }
            setXML(plainxml);  
        };
        fetchXML();
        }, [visuname]);

    // Adapt the original xml through replacing of placeholders
    React.useEffect(()=>{
        if(XML !== null){
            let xmlDoc = parseVisuXML(XML);
            initVariables(xmlDoc, mainVisu);
            replacePlaceholders(xmlDoc, replacementSet);
            setAdaptedXML(xmlDoc);
            // Get the original size of the visualisation
            let jQxml=$(xmlDoc);
            setOriginSize(stringToArray(jQxml.children("visualisation").children("size").text()));
            setLoading(false);
        }
    },[XML, mainVisu, replacementSet])

    // Scaling on main window resize for responsive behavior
    React.useEffect(()=>{
        let scaleFactor = width/(originSize[0]+2);
        setScale("scale("+scaleFactor.toString()+")");
    }, [width, originSize, mainVisu])

    return (
        <div style={{display:display, position:"absolute", overflow:"hidden", left:0, top:0, width:originSize[0]+1, height:originSize[1]+1, transformOrigin:"0 0", transform:scale}}>
            {loading ? null :
                <VisuElements visualisation={adaptedXML}></VisuElements>
            }
        </div>
    )
})
