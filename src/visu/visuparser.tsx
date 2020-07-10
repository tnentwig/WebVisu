import * as React from 'react';
import { get, set } from 'idb-keyval';
import { VisuElements } from '../visu/pars/elementparser';
import { stringToArray } from './pars/Utils/utilfunctions';
import { getVisuxml, stringifyVisuXML, parseVisuXML } from './pars/Utils/fetchfunctions';
import ComSocket from './communication/comsocket';
import StateManager from '../visu/statemanagement/statemanager';

type Props = {
    visuname : string,
    width : number,
    height : number,
    show_frame : boolean,
    clip_frame : boolean,
    iso_frame : boolean,
    original_frame : boolean,
    original_scrollable_frame : boolean,
    no_frame_offset : boolean
}

export const Visualisation :React.FunctionComponent<Props> = React.memo(({ visuname, width, height,  show_frame, clip_frame, iso_frame, original_frame, original_scrollable_frame, no_frame_offset})=> {
    const [loading, setLoading] = React.useState<Boolean>(true);
    const [adaptedXML, setAdaptedXML] = React.useState<Element>(null);
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
                await initVariables(xmlDoc);
                setAdaptedXML(xmlDoc.children[0]);
                setOriginSize(stringToArray(xmlDoc.getElementsByTagName("visualisation")[0].getElementsByTagName("size")[0].innerHTML));
                setLoading(false);
            }
        };
        fetchXML();
    }, [visuname]);
    
    // Scaling on main window resize for responsive behavior
    React.useEffect(()=>{
        let xscaleFactor = width / (originSize[0] + 2);
        let yscaleFactor = height / (originSize[1] + 2);
        if (original_frame) {
            setScale("scale(" + (((originSize[0] / (originSize[0] + 2)) + (originSize[1] / (originSize[1] + 2))) / 2).toString() + ")");
        } else if (iso_frame) {
            setScale("scale(" + Math.min(xscaleFactor, yscaleFactor).toString() + ")");
        } else {
            setScale("scale(" + xscaleFactor.toString() + "," + yscaleFactor.toString() + ")");
        }
    }, [width, height, originSize, original_frame, iso_frame])
    
    
    return (
        <div style={{display:"block", position:"absolute", overflow:(clip_frame ? "hidden" : "visible"), left:0, top:0, width:originSize[0]+1, height:originSize[1]+1, transformOrigin:"0 0", transform:scale}}>
            {loading ? null :
                <VisuElements visualisation={adaptedXML}></VisuElements>
            }
        </div>
    )
})

async function initVariables(XML : XMLDocument) {
    let com = ComSocket.singleton();
    // We have to reset the varibales on comsocket, if necessary
    com.stopCyclicUpdate();
    com.initObservables();
    // Rip all of <variable> in <variablelist> section
    let variables = XML.getElementsByTagName("visualisation")[0].getElementsByTagName("variablelist")[0].getElementsByTagName("variable");
    for (let i=0; i<variables.length; i++){
        let varName = variables[i].getAttribute("name");
        let rawAddress = variables[i].innerHTML;
        let varAddress = rawAddress.split(",").slice(0,4).join(",");
        // Add the variable to the observables if not already existent
        if (!com.oVisuVariables.has(varName.toLowerCase())){
            com.addObservableVar(varName, varAddress);
        }
    }
    await com.updateVarList();
    com.startCyclicUpdate();
}
