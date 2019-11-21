import * as $ from 'jquery';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import ComSocket from './visu/com/comsocket';
import {Visualisation} from './visu/visuparser'
import { useObserver } from 'mobx-react-lite'

export default class HTML5Visu {
    rootDir: string;
    constructor(){
        let path = location.protocol + '//' + window.location.host;
        this.rootDir= path;
    }
    async showMainVisu () {
         // Get the webvisu.htm file. There are the startvisu and updatetime listed
        let visuProp : Map<string,string>;
        try{
           // Get the webvisu.htm file. There are the startvisu and updatetime listed
           visuProp = await this.getWebvisuhtm('/webvisu.htm');
        } catch {
           throw new Error("The URI is malformed!");
        }
       
        // Get the visu-ini file. There are informations like the current user level, the current visu or the user passwords
        let visuIni = await this.getVisuini('/visu_ini.xml');
        // The Comsocket has to be initilized
        await this.initCommunication(visuIni, 200);
        // Get the current visu
        let currentVisu = visuProp.get("STARTVISU");
        let useCurrentVisuVariable = visuProp.get("USECURRENTVISU");
        
        this.displayVisu(currentVisu);
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

    getWebvisuhtm(relPath : string) : Promise<Map<string,string>>{
    return new Promise((resolve)=>{
        let map :Map<string,string> = new Map();    
    // Get the webvisu.htm file. There are the startvisu and updatetime listed
        let webvisuhtm =$.ajax({
            url: this.rootDir+relPath,
            type: 'GET',
            dataType: 'html', 
            crossDomain: true
        })

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
                        console.log(visuName);
                        map.set(name, visuName)
                        break;
                    case "UPDATETIME":
                        let updateTime = htmlElement[i].getAttribute("value");
                        map.set(name, updateTime)
                        break;
                    case "UPDATETIME":
                        let useCurrentVisu= htmlElement[i].getAttribute("value");
                        map.set(name, useCurrentVisu)
                }
            }
            resolve(map);
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

    displayVisu (name : string)  {
        // The coverted sections are inserted in the virtual react DOM
        function App() {
            return useObserver(()=>
                <React.Fragment>
                    {
                        <Visualisation visuname={name}></Visualisation>
                    }
                </React.Fragment>
            )
        }
        
        // The virtual DOM will be inserted in the DOM. React will update the DOM automatically.
        ReactDOM.render(
            <React.StrictMode><App /></React.StrictMode>, document.getElementById("visualisation"));
    }

}