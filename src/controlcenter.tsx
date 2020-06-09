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
        this.initCommunication(Number(stateManager.get("UPDATETIME")));
        StateManager.singleton().init();
        // initialization finished
        this.loading = false;

        const App = observer(()=> {
            return (
                <div style={{width: this.windowWidth, height:this.windowsHeight, userSelect:"none"}}>    
                    {stateManager.get("ISONLINE") === "TRUE"
                        ? <Visualisation visuname={stateManager!.get("CURRENTVISU")!.toLowerCase()} mainVisu={true} replacementSet={null} width={this.windowWidth}></Visualisation>
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

    initCommunication(cycletime : number){
        let com = ComSocket.singleton();
        com.setServerURL(this.rootDir + '/webvisu.htm');
        com.startCyclicUpdate(cycletime);
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
                // Try to fetch the xml as unzipped file
                if (response.ok){
                    response.text()
                    .then((data)=>{
                        let parser = new DOMParser();
                        let htmlDoc = parser.parseFromString(data, 'text/html');
                        let htmlElement = htmlDoc.getElementsByTagName("param");
                        for (let i=0; i<htmlElement.length; i++){
                            let name = htmlElement[i].getAttribute("name").toString();
                            switch(name){
                                case "STARTVISU":
                                    let visuName = htmlElement[i].getAttribute("value").toLowerCase();
                                    stateManager.set(name, visuName)
                                    break;
                                case "UPDATETIME":
                                    let updateTime = htmlElement[i].getAttribute("value");
                                    stateManager.set(name, updateTime)
                                    break;
                                case "USECURRENTVISU":
                                    let useCurrentVisu= htmlElement[i].getAttribute("value");
                                    stateManager.set(name, useCurrentVisu)
                                    break;
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
                        let decoder = new TextDecoder("iso-8859-1");
                        let text = decoder.decode(buffer);
                        let data = new window.DOMParser().parseFromString(text, "text/xml");
                        // Append the global variables
                        this.appendGlobalVariables(data);
                        // Check the download ID
                        let xmlDownloadID= data.getElementsByTagName("download-id")[0].textContent;
                        // Check, if saved id and received id are not equal
                        if (localStorage.getItem("download-id") !== xmlDownloadID){
                            // Clear old indexedDB
                            clear();
                            // Save the downlaod id
                            localStorage.setItem("download-id", xmlDownloadID);
                            // Preload the visualisations
                            await this.preloadVisus();
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