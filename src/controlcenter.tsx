import * as $ from 'jquery';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import ComSocket from './visu/communication/comsocket';
import StateManager from './visu/statemanagement/statemanager'
import { Visualisation } from './visu/visuparser';
import { observer } from 'mobx-react';

export default class HTML5Visu {
    rootDir: string;
    
    constructor(){
        let path = location.protocol + '//' + window.location.host;
        this.rootDir= path;
    }
    async showMainVisu () {
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
        await this.initCommunication(visuIni, 100);
        // The coverted sections are inserted in the virtual react DOM
        
        const App = observer(()=> {
            return (
                <React.Fragment>    
                    {stateManager.get("ISONLINE") === "TRUE"
                        ? <Visualisation visuname={stateManager!.get("CURRENTVISU")!.toLowerCase()} mainVisu={true} replacementSet={null}></Visualisation>
                        : <div>The PLC webserver is not reachable!</div>
                    }
                </React.Fragment>
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
            com.startCyclicUpdate(Number(StateManager.singleton().oState.get("UPDATETIME")));
            this.appendGlobalVariables(XML);
            com.initObservables();
            resolve(true);
        })
    }

    appendGlobalVariables(XML : XMLDocument) : Promise<boolean>{
        return new Promise(resolve => {
            let visuXML=$(XML);
            // Rip all of <variable> in <variablelist> section
            visuXML.children("visu-ini-file").children("variablelist").children("variable").each(function(){
                let variable = $(this);
                ComSocket.singleton().addGlobalVar(variable.attr("name"), variable.text());
            });
            resolve(true)
        })
    }

    getPath() : Promise<boolean>{
        return new Promise((resolve)=>{
        // The request will automatically forwarded to the CoDeSys folder on a PFC. On older controllers we have to forward to /PLC manually
        // A first try for get a manually forwarding
            let getPath =$.ajax({
                url: this.rootDir+'/visu_ini.xml',
                type: 'GET',
                dataType: 'xml', 
            })
            getPath.then((data) => {
                // Path is correct 
                resolve(true);
            })
            getPath.fail(()=>{
                let getPath2 =$.ajax({
                    url: this.rootDir+'/PLC/visu_ini.xml',
                    type: 'GET',
                    dataType: 'xml'
                })
                getPath2.then((data) => {
                    // Path must be adapted for an older Linux Controller without Linux
                    this.rootDir = this.rootDir + '/PLC';
                    resolve(true);
                })
                getPath2.fail(()=>{
                    let getPath3 =$.ajax({
                        url: this.rootDir+'/webvisu/visu_ini.xml',
                        type: 'GET',
                        dataType: 'xml'
                    })
                    getPath3.then((data) => {
                        // Path must be adapted for a Linux-PFC
                        this.rootDir = this.rootDir + '/webvisu';
                        resolve(true);
                    })
                    getPath3.fail(()=>{
                        resolve(false);
                    })
                })
            })
        })
    }

    getWebvisuhtm(relPath : string) : Promise<boolean>{
    return new Promise((resolve)=>{
    // Get the webvisu.htm file. There are the startvisu and updatetime listed
        let webvisuhtm =$.ajax({
            url: this.rootDir+relPath,
            type: 'GET',
            dataType: 'html', 
        })
        // Get a reference to the global state manager
        let stateManager = StateManager.singleton().oState;
        webvisuhtm.then((data) => {
            // Searching for cycletime and startvisuname
            let parser = new DOMParser();
            let htmlDoc = parser.parseFromString(data, 'text/html');
            let htmlElement = htmlDoc.getElementsByTagName("param");
            for (let i=0; i<htmlElement.length; i++){
                let name = htmlElement[i].getAttribute("name").toString();
                switch(name){
                    case "STARTVISU":
                        let visuName = htmlElement[i].getAttribute("value");
                        stateManager.set(name, visuName)
                        break;
                    case "UPDATETIME":
                        let updateTime = htmlElement[i].getAttribute("value");
                        stateManager.set(name, updateTime)
                        break;
                    case "USECURRENTVISU":
                        let useCurrentVisu= htmlElement[i].getAttribute("value");
                        stateManager.set(name, useCurrentVisu)
                }
            }
            resolve(true);
        })       
        .fail((error) => {
            console.error(error);
        })
    })
    }

    getVisuini(relPath : string) : Promise<XMLDocument>{
        return new Promise(resolve=>{
            $.ajax({
                url: this.rootDir+relPath,
                type: 'GET',
                dataType: 'xml', // if text => no pre-processing, if xml => parseXML preprocessing
                crossDomain: true
            })
            .then((data)=>resolve(data))
            .fail((error) => {
                console.error(error);
            })
        })
    }
}