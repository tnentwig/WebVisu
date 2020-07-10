import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import Popup from 'reactjs-popup';
import ComSocket from './visu/communication/comsocket';
import StateManager from './visu/statemanagement/statemanager';
import { clear } from 'idb-keyval';
import { Visualisation } from './visu/visuparser';
import { ConnectionFault } from './supplements/InfoBox/infobox';
import { ExecutionPopup } from './supplements/PopUps/popup'
import { getVisuxml, stringifyVisuXML } from './visu/pars/Utils/fetchfunctions'
import { Spinner } from './supplements/Spinner/spinner';

export default class HTML5Visu {
    rootDir: string;
    @observable windowWidth : number;
    @observable windowsHeight : number;
    loading : boolean;
    spinningText : string;
    
    constructor(){
        let path = location.protocol + '//' + window.location.host;
        this.rootDir= path;
        this.windowWidth = window.innerWidth;
        this.windowsHeight = window.innerHeight;
        this.loading = true;
        window.addEventListener('resize', this.updateWindowDimensions);
    }
    // For responsive behavior 
    @action.bound
    updateWindowDimensions() {
        this.windowWidth = window.innerWidth;
        this.windowsHeight = window.innerHeight;
    }
    
    async showMainVisu () {
        // Show a spinner while loading
        ReactDOM.render(
            <React.StrictMode><Spinner text={"Preload visualisations on first pageview ..."}></Spinner></React.StrictMode>, document.getElementById("visualisation")
        );
        // Get a reference to the global state manager
        let stateManager = StateManager.singleton().oState;
        // Get the path to the files
        await this.pathConfiguration();
        stateManager.set("ROOTDIR", this.rootDir);
        // Process the webvisu.htm file. There are the startvisu and updatetime listed
        await this.processingWebvisuHtm();
        // Process the visu-ini file. There are informations like the current user level, the current visu or the user passwords
        await this.processingVisuIni();
        // The Comsocket has to be initilized
        this.initCommunication();
        StateManager.singleton().init();
        // initialization finished
        this.loading = false;
        
        const App = observer(()=> {
            return (
                <div style={{width: stateManager!.get("VISUWIDTH")!.toLowerCase(), height:stateManager!.get("VISUHEIGHT")!.toLowerCase(), userSelect:"none"}}>
                    {stateManager.get("ISONLINE") === "TRUE"
                        ? <Visualisation visuname={stateManager!.get("CURRENTVISU")!.toLowerCase()} width={this.windowWidth} height={this.windowsHeight} show_frame={false} clip_frame={true} iso_frame={true} original_frame={false} original_scrollable_frame={false} no_frame_offset={true}></Visualisation>
                        : <ConnectionFault></ConnectionFault>
                    }
                    <Popup 
                        open={StateManager.singleton().openPopup.get()}
                        modal
                        onClose={()=>StateManager.singleton().openPopup.set(false)}>
                        <ExecutionPopup></ExecutionPopup>
                    </Popup>
                </div>
                
            )
        })
        
        // The virtual DOM will be inserted in the DOM. React will update the DOM automatically.
        ReactDOM.render(
            <React.StrictMode><App/></React.StrictMode>, document.getElementById("visualisation"));
    
    }

    initCommunication(){
        let com = ComSocket.singleton();
        com.setServerURL(this.rootDir + '/webvisu.htm');
        com.startCyclicUpdate();
        com.initObservables();
    }

    appendGlobalVariables(visuIniXML : XMLDocument) {
        // Rip all of <variable> in <variablelist> section
        let variables = visuIniXML.getElementsByTagName("visu-ini-file")[0].getElementsByTagName("variablelist")[0].getElementsByTagName("variable");
        for (let i=0; i<variables.length; i++){
            let name = variables[i].getAttribute("name");
            let address = variables[i].textContent;
            ComSocket.singleton().addGlobalVar(name, address);
        }
    }

    pathConfiguration() : Promise<boolean>{
        return new Promise((resolve)=>{
            // Get the current path
            let path = window.location.pathname.replace("/webvisu.html", "");
            fetch(this.rootDir + path + '/visu_ini.xml')
            .then((response) => {
                // Path is correct 
                if (response.ok){
                    // Path must be adapted
                    this.rootDir = this.rootDir + path;
                    resolve(true);
                } else {
                    // roll back to manual "try ? success : fail" style
                    // The request will automatically forwarded to the CoDeSys folder on a PFC. On older controllers we have to forward to /PLC manually
                    // A first try for get a manually forwarding
                    fetch(this.rootDir+'/visu_ini.xml')
                    .then((response) => {
                        // Path is correct 
                        if (response.ok){
                            resolve(true);
                        } else {
                            fetch(this.rootDir + '/plc/visu_ini.xml')
                            .then((response) => {
                                // Path is correct 
                                if (response.ok){
                                    // Path must be adapted for an older Linux Controller without Linux
                                    this.rootDir = this.rootDir + '/plc';
                                    resolve(true);
                                } else {
                                    fetch(this.rootDir + '/webvisu/visu_ini.xml')
                                    .then((response) => {
                                        // Path is correct 
                                        if (response.ok){
                                            // Path must be adapted for a Linux-PFC
                                            this.rootDir = this.rootDir + '/webvisu';
                                            resolve(true);
                                        } else {
                                            resolve(false);
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })
    }

    processingWebvisuHtm() : Promise<boolean>{
        return new Promise((resolve)=>{
            // Get a reference to the global state manager
            let stateManager = StateManager.singleton().oState;
            // Get the webvisu.htm file. There are the startvisu and updatetime listed
            fetch(
                this.rootDir+'/webvisu.htm', {
                    headers:{'Content-Type': 'text/plain; charset=UTF8'},
                    method: 'get'
                }
            ).then((response)=>{
                if (response.ok){
                    response.text()
                    .then((data)=>{
                        let parser = new DOMParser();
                        let htmlDoc = parser.parseFromString(data, 'text/html');
                        
                        // Width, height - Definition of the size of the screen. Regard the possibility to make visible this size
                        // already during creating a visualization in CoDeSys (Target Settings: Display width/height in pixel).
                        let appletElement = htmlDoc.getElementsByTagName("APPLET");
                        let visuWidth = appletElement[0].getAttribute("width");
                        stateManager.set("VISUWIDTH", visuWidth);
                        let visuHeight = appletElement[0].getAttribute("height");
                        stateManager.set("VISUHEIGHT", visuHeight);
                        
                        let htmlElement = htmlDoc.getElementsByTagName("param");
                        for (let i=0; i<htmlElement.length; i++){
                            let name = htmlElement[i].getAttribute("name").toString();
                            switch(name){
                                // Standard parameters
                                case "STARTVISU": 
                                    // Definition of the start POU 
                                    // Default: PLC_VISU
                                    let visuName = htmlElement[i].getAttribute("value").toLowerCase();
                                    stateManager.set(name, visuName);
                                    break;
                                    
                                case "UPDATETIME": 
                                    // Definition of the monitoring interval (msec)
                                    // Default: 100
                                    let updateTime = htmlElement[i].getAttribute("value");
                                    stateManager.set(name, updateTime);
                                    break;
                                    
                                case "USECURRENTVISU": 
                                    // Definition whether an automatic change to another visualization will be done,
                                    // as soon as the system variable 'CurrentVisu' is changed by the PLC program. 
                                    // Default: FALSE
                                    let useCurrentVisu= htmlElement[i].getAttribute("value");
                                    stateManager.set(name, useCurrentVisu);
                                    break;
                                // Optionnal Parameters
                                /*
                                case "USEFIXSOCKETCONNECTION":
                                    // If this parameter is TRUE, a fix socket connection will be used for monitoring; 
                                    // if it is FALSE or if the entry is missing at all, 
                                    // for each monitoring request a new socket will be used. 
                                    // Example: FALSE
                                    // Example: TRUE
                                    break;
                                    
                                case "FORCEDLOAD":
                                    // The visualizations specified here will be loaded already when the Web-Visualization is loaded,
                                    // not just when they are opened for the first time. Thus time is saved at later changes of
                                    // visualizations, because then the data not have to be transferred first by the WebServer.
                                    // Example: VISU_1, VISU_2, VISU_3
                                    // Example: TREND
                                    break;
                                */
                                case "COMPRESSEDFILES": 
                                    // The files to be transferred for the Web-Visualization to the Web-Server can be provided by
                                    // CoDeSys in a packed format ("<filename>_<extension original format>.zip"). 
                                    // Example: FALSE
                                    // Example: TRUE
                                    let compressedFiles= htmlElement[i].getAttribute("value");
                                    stateManager.set(name, compressedFiles);
                                    break;
                                /*
                                case "USEURLCONNECTION":
                                    // If this parameter is configured, the communication will be done via the specified URLconnection.
                                    // Per default a simple socket connection is used.
                                    // Attention: If parameter USEFIXSOCKETCONNECTION (see above) is set TRUE,
                                    // USEFIXSOCKETCONNECTION may not be used additionally.
                                    // Exemple: http://192.168.100.19:8080/webvisu.htm
                                    break;
                                    
                                case "SELECTION":
                                    // Here the line width and color for the display of the current selection can be defined. 
                                    // Syntax:LINEWIDTH|RED|GREEN|BLUE; 
                                    // Example: 4|0|0|255
                                    break;
                                    
                                case "ERROR_SENSITIVITY":
                                    // This parameter defines how many trials will be done to get a visualization file transferred from
                                    // the Web-Server, before an applet error will appear.
                                    // Example: 3
                                    break;
                                    
                                case "KEYPADINDIALOGS":
                                    // If a touch panel is used for working with the Web-Visualization, this parameter should be set
                                    // TRUE in order to get an input possibility in any case for each dialog; 
                                    // if applicable via numpad/keypad.
                                    // Example: FALSE
                                    // Example: TRUE
                                    break;
                                    
                                case "KEYBOARDUSAGEFROMDIALOGS":
                                    // If this parameter is set TRUE, the keyboard usage is always active, 
                                    // even if a modal dialog - like e.g. the numpad - is currently opened.
                                    // Example: FALSE
                                    // Example: TRUE
                                    break;
                                    
                                case "WRITEACCESSLOCK":
                                    // This parameter only should be set TRUE, if the Web-Server supports multi-client processing
                                    // and if an access lock for various clients is desired. Concerning access control in multi-client
                                    // operation please see HERE.
                                    // Example: FALSE
                                    // Example: TRUE
                                    break;
                                    
                                case "DEFAULTENCODING":
                                    // If this parameter is set TRUE and the language switching is done via ASCII language files, the
                                    // default encoding - currently set in the system - will be used for the interpretation of the language
                                    // file.
                                    // Example: FALSE
                                    // Example: TRUE
                                    break;
                                */
                                case "ENCODINGSTRING":
                                    // If the default encoding of the system is not set as desired, 
                                    // you can define here the desired encoding by entering the appropriate string. 
                                    // Example (German): ISO-8859-1
                                    // Example (Russian): ISO-8859-5
                                    // Example (Japanese): MS932
                                    let encodingString= htmlElement[i].getAttribute("value");
                                    stateManager.set(name, encodingString);
                                    break;
                                    /*
                                case "PLCSTATEINTERVAL":
                                    // Cycle time in milliseconds according to which the Web-Client will check the PLC status. 
                                    // It will be checked whether the PLC is in Start or Stop status and whether a download has been done.
                                    // Example: 5000
                                    break;
                                    
                                case "ALARMUPDATEBLOCKSIZE":
                                    // This parameter can be set in order to change the update of the alarm states. 
                                    // Due to the fact that not all alarm states can be updated within one cycle, 
                                    // it might be useful to exactly defined the number of alarms which should be updated per cycle. 
                                    // This number can be specified as a numeric value.
                                    // Example: 50
                                    break;
                                    
                                case "SUPPORTTOOLTIPSINALARMTABLE":
                                    // If this parameter is set TRUE, the tooltip functionality in the alarm table will be activated. 
                                    // This means: If any text entry in the alarm table cannot be displayed completely, a tooltip will be
                                    // available showing the full text string as soon as the mouse pointer is moved on the respective
                                    // table cell.
                                    // Example: FALSE
                                    // Example: TRUE
                                    break;
                                    
                                case "TOOLTIPFONT":
                                    // This parameter serves to define the font for all tooltips. 
                                    // Example: Dialog
                                    // Example: Arial|11
                                    break;
                                    
                                case "FILEOPENSAVEDIALOGFONT":
                                    // This parameter serves to define the font for the File-Open-dialog.
                                    // Example: Dialog
                                    // Example: Arial|11
                                    break;
                                    
                                case "ALARMTABLEFONT":
                                    // This parameter serves to define the font for the alarm table.
                                    // Example: Dialog
                                    // Example: Arial|11|0|0|false|left|center
                                    break;
                                    
                                case "USECURRENTLANGUAGE":
                                    // If this parameter is set TRUE, the current language setting always will be synchronized
                                    // between Web- and Target-Visualization (via implicit variable CurrentLanguage);
                                    // i.e. at a language switch caused by an input in one of the both visualization
                                    // types each in the other type the language will be switched too. 
                                    // (The CoDeSys Visualization currently is not included in this match).
                                    // Example: FALSE
                                    // Example: TRUE
                                    break;
                                */
                            }
                        }
                        resolve(true);
                    })
                }
            })
        })
    }
    
    processingVisuIni() : Promise<XMLDocument>{
        let url = this.rootDir+'/visu_ini.xml';
        return new Promise(resolve =>{
            fetch(url, {headers:{'Content-Type': 'text/plain; charset=UTF8'}})
            .then((response)=>{
                if (response.ok){
                    response.arrayBuffer()
                    .then(async (buffer)=>{
                        // Get a reference to the global state manager
                        let stateManager = StateManager.singleton().oState;
                        let decoder = new TextDecoder("iso-8859-1");
                        let text = decoder.decode(buffer);
                        let data = new window.DOMParser().parseFromString(text, "text/xml");
                        // Append the global variables
                        this.appendGlobalVariables(data);
                        // Get the download ID
                        let xmlDownloadID = data.getElementsByTagName("download-id")[0].textContent;
                        // Check, if saved id and received id are not equal
                        if (localStorage.getItem("download-id") !== xmlDownloadID){
                            // Clear old indexedDB
                            clear();
                            // Save the downlaod id
                            localStorage.setItem("download-id", xmlDownloadID);
                            // Preload the visualisations
                            //await this.preloadVisus();
                        }
                        // Get the compression value
                        let xmlCompression = data.getElementsByTagName("compression")[0].textContent;
                        if (xmlCompression === "true") {
                          stateManager.set("COMPRESSION", "TRUE");
                        } else {
                          stateManager.set("COMPRESSION", "FALSE");
                        }
                        // Get the best-fit value
                        let xmlBestFit = data.getElementsByTagName("best-fit")[0].textContent;
                        if (xmlBestFit === "true") {
                          stateManager.set("BESTFIT", "TRUE");
                        } else {
                          stateManager.set("BESTFIT", "FALSE");
                        }
                        resolve(data)
                    })
                }
            })
        })
    }
    
    async preloadVisus(){
        let mainVisus : Array<string> = []; 
        let loadedVisus : Array<string> = [];
        let visusToBeLoaded = [StateManager.singleton().oState.get("STARTVISU").toLowerCase()]
        let notExistingVisus : Array<string> = [];
        while(visusToBeLoaded.length){
            let visuname = visusToBeLoaded.pop();
            // Check if its a placeholder variable
            let regEx = new RegExp(/\$(.*)\$/gm);
            let match = regEx.exec(visuname);
            if (match == null){
                let thisVisuXML = await getVisuxml(this.rootDir + "/" + visuname + ".xml");
                // The visu does not exist on server if thisVisuXML is null
                if (thisVisuXML !== null){
                    let xmlDict = StateManager.singleton().xmlDict;
                    if (!xmlDict.has(visuname)){
                        let plainxml = stringifyVisuXML(thisVisuXML);
                        xmlDict.set(visuname, plainxml);
                    }
                    loadedVisus.push(visuname);
                    // Get the visualisations which are used as main visush
                    let mainVisunames = thisVisuXML.getElementsByTagName("expr-zoom");
                    Array.from(mainVisunames).forEach(function (nameNode){
                        /// können auch vars sein
                        let nextVisuname = nameNode.getElementsByTagName("placeholder")[0].textContent.toLowerCase();
                        if (!loadedVisus.includes(nextVisuname) && !visusToBeLoaded.includes(nextVisuname) && !notExistingVisus.includes(nextVisuname)){
                            visusToBeLoaded.push(nextVisuname);
                        }
                        if (!mainVisus.includes(visuname)){
                            mainVisus.push(visuname);
                        }
                    })
                    // Get the visualisations that are used as subvisus
                    let subVisunames = thisVisuXML.querySelectorAll('element[type="reference"]');
                    Array.from(subVisunames).forEach(function (nameNode){
                        let nextVisuname = nameNode.getElementsByTagName("name")[0].textContent.toLowerCase();
                        if (!loadedVisus.includes(nextVisuname) && !visusToBeLoaded.includes(nextVisuname) && !notExistingVisus.includes(nextVisuname)){
                            visusToBeLoaded.push(nextVisuname);
                        }
                    })
                } else {
                    notExistingVisus.push(visuname);
                    console.log("There is a internal problem in your CoDeSys Project. The visualisation named "+visuname+ " is referenced but not available on the server!")
                }
            }
        }
        return mainVisus
    }
}
