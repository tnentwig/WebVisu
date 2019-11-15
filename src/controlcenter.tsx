import * as $ from 'jquery';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import ComSocket from './visu/com/comsocket';
import {Visualisation} from './visu/visuparser'

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
        // The coverted sections are inserted in the virtual react DOM
        function App() {
            return (
                <React.Fragment>
                    {
                        <Visualisation visualisation={XML}></Visualisation>
                    }
                </React.Fragment>
            )
        }
        
        // The virtual DOM will be inserted in the DOM. React will update the DOM automatically.
        ReactDOM.render(
            <React.StrictMode><App /></React.StrictMode>, document.getElementById("visualisation"));
    }

}