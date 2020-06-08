import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import Popup from 'reactjs-popup';
import ComSocket from './visu/communication/comsocket';
import StateManager from './visu/statemanagement/statemanager'
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
        this.spinningText = "Loading visualisations..."
        window.addEventListener('resize', this.updateWindowDimensions);
    }
    // For responsive behavior 
    @action.bound
    updateWindowDimensions() {
        this.windowWidth = window.innerWidth;
        this.windowsHeight = window.innerHeight;
    }
    
    async showMainVisu () {
        ReactDOM.render(
            <React.StrictMode><Spinner text={this.spinningText}></Spinner></React.StrictMode>, document.getElementById("visualisation"));
        // Get a reference to the global state manager
        let stateManager = StateManager.singleton().oState;
        // Get the path to the files
        await this.getPath();
        stateManager.set("ROOTDIR", this.rootDir);
        // Get the webvisu.htm file. There are the startvisu and updatetime listed
        await this.getWebvisuhtm('/webvisu.htm');
        // Get the visu-ini file. There are informations like the current user level, the current visu or the user passwords
        let visuIni = await this.getVisuini('/visu_ini.xml');
        // The Comsocket has to be initilized
        await this.initCommunication(visuIni, Number(stateManager.get("UPDATETIME")));
        StateManager.singleton().init();
        // Preload all xml files of visualisation
        //let visuList =await this.preloadVisus();
        this.loading = false;

        const App = observer(()=> {
            return (
                <div style={{width: this.windowWidth, height:this.windowsHeight}}>    
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
            <React.StrictMode><App /></React.StrictMode>, document.getElementById("visualisation"));
    
    }

    async initCommunication(XML : XMLDocument, cycletime : number) : Promise<boolean> {
        return new Promise(resolve =>{
            let com = ComSocket.singleton();
            com.setServerURL(this.rootDir + '/webvisu.htm');
            com.startCyclicUpdate(cycletime);
            this.appendGlobalVariables(XML);
            com.initObservables();
            resolve(true);
        })
    }

    appendGlobalVariables(visuIniXML : XMLDocument) : Promise<boolean>{
        return new Promise(resolve => {
            // Rip all of <variable> in <variablelist> section
            let variables = visuIniXML.getElementsByTagName("visu-ini-file")[0].getElementsByTagName("variablelist")[0].getElementsByTagName("variable");
            for (let i=0; i<variables.length; i++){
                let name = variables[i].getAttribute("name");
                let address = variables[i].textContent;
                ComSocket.singleton().addGlobalVar(name, address);
            }
            resolve(true)
        })
    }

    getPath() : Promise<boolean>{
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

    getWebvisuhtm(relPath : string) : Promise<boolean>{
        return new Promise((resolve)=>{
            // Get a reference to the global state manager
            let stateManager = StateManager.singleton().oState;
            // Get the webvisu.htm file. There are the startvisu and updatetime listed
            fetch(
                this.rootDir+relPath, {
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

    getVisuini(relPath : string) : Promise<XMLDocument>{
        let url = this.rootDir+relPath;
        return new Promise(resolve =>{
            fetch(url, {headers:{'Content-Type': 'text/plain; charset=UTF8'}})
            .then((response)=>{
                if (response.ok){
                    response.arrayBuffer()
                    .then((buffer)=>{
                        let decoder = new TextDecoder("iso-8859-1");
                        let text = decoder.decode(buffer);
                        let data = new window.DOMParser().parseFromString(text, "text/xml")
                        resolve(data)
                    })
                }
            })
        })
    }

    checkCaches(){

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