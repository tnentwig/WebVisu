import * as $ from 'jquery';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import ComSocket from './visu/datamanger/comsocket';
import StateManager from './visu/datamanger/statemanager'
import { Visualisation } from './visu/visuparser';
import { observer } from 'mobx-react';

export default class HTML5Visu {
    rootDir: string;
    
    constructor(){
        let path = location.protocol + '//' + window.location.host;
        this.rootDir= path;
    }
    async showMainVisu () {
         // Get the webvisu.htm file. There are the startvisu and updatetime listed
        try{
           // Get the webvisu.htm file. There are the startvisu and updatetime listed
           await this.getWebvisuhtm('/webvisu.htm');
           console.log("Get the webvisu.htm");
        } catch {
           throw new Error("The URI is malformed!");
        }
       
        // Get the visu-ini file. There are informations like the current user level, the current visu or the user passwords
        let visuIni = await this.getVisuini('/visu_ini.xml');
        // The Comsocket has to be initilized
        await this.initCommunication(visuIni, 200);
        // Get a reference to the global state manager
        let stateManager = StateManager.singleton().oState;
        
        // The coverted sections are inserted in the virtual react DOM
        
        const App = observer(()=> {

            return (
                <React.Fragment>
                    {
                        <Visualisation visuname={stateManager.get("CURRENTVISU")}></Visualisation>
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
            com.setServerURL(this.rootDir + '');
            com.startCyclicUpdate(cycletime);
            this.appendVariables(XML);
            resolve(true);
        })
    }

    appendVariables(XML : XMLDocument) : Promise<boolean>{
        return new Promise(resolve => {
            let visuXML=$(XML);
            // Rip all of <variable> in <variablelist> section
            visuXML.children("visu-ini-file").children("variablelist").children("variable").each(function(){
                let variable = $(this);
                ComSocket.singleton().addObservableVar(variable.attr("name"), variable.text());
            });
        })
    }

    getWebvisuhtm(relPath : string) : Promise<boolean>{
    return new Promise((resolve)=>{
    // Get the webvisu.htm file. There are the startvisu and updatetime listed
        let webvisuhtm =$.ajax({
            url: this.rootDir+relPath,
            type: 'GET',
            dataType: 'html', 
            crossDomain: true
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