import * as $ from 'jquery';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import ComSocket from './com/comsocket';
import { VisuElements } from './pars/elementparser'
import { stringToArray } from './pars/Utils/utilfunctions'

export default class HTML5Visu {
    rootDir: string;
    constructor(rootDir: string){
        this.rootDir= rootDir;
    }
    createVisu (relPath: string) {
        $.ajax({
            url: this.rootDir+relPath,
            type: 'GET',
            dataType: 'XML', // if text => no pre-processing, if xml => parseXML preprocessing
            crossDomain: true
        })

        .then((data) => {
            // Searching for variables and initialize the communication
            this.initCommunication(data);
            // Searching for elements
            setTimeout(()=>this.displayVisu(data), 800);
            }
        )
        .fail((error) => {
            console.error(error);
        })
    }

    initCommunication(XML : XMLDocument) {
        let com = ComSocket.singleton();
        com.setServerURL(this.rootDir + '');
        let visuXML=$(XML);
        // Rip all of <variable> in <variablelist> section
        visuXML.children("visualisation").children("variablelist").children("variable").each(function(){
            let variable = $(this);
            com.addObservableVar(variable.attr("name"), variable.text());
        });
        com.updateVarList();
        com.startCyclicUpdate(200);
    }

    displayVisu (XML : XMLDocument)  {
        let thisXML=$(XML);
        let rect = stringToArray(thisXML.children("visualisation").children("size").text());
        // The coverted sections are inserted in the virtual react DOM
        function App() {
            return (
                <div id="current" style={{position:"absolute", overflow:"hidden", left:0, top:0, width:rect[0]*1.1, height:rect[1]*1.1}}>
                    {
                        <VisuElements visualisation={thisXML}></VisuElements>
                    }
                </div>
            )
        }
        // The virtual DOM will be inserted in the DOM. React will update the DOM automatically.
        ReactDOM.render(
            <React.StrictMode><App /></React.StrictMode>, document.getElementById("visualisation"));
    }

}