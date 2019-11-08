import * as $ from 'jquery';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import ComSocket from '../com/comsocket';
import { parseSimpleShape } from './Elements/Basicshapes/simpleshape';
import { Placeholder } from './Elements/placeholder';
import { parsePolyshape } from './Elements/Basicshapes/polyshape';
import { parseButton } from './Elements/Button/button';
import { Scrollbar } from './Elements/Scrollbar/scrollbar';
import { parseArrayTable } from './Elements/arraytable';
import { parseBitmap } from './Elements/bitmap';

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
            setTimeout(()=>this.convertVisuElements(data), 800);
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

    convertVisuElements (XML : XMLDocument) : Array<(JSX.Element | undefined | null)> {
        
        console.log("Start parsing...");
        let visuXML=$(XML);
        let visuObjects: Array<(JSX.Element | undefined | null)> =[];
        // Rip all <element> sections
        visuXML.children("visualisation").children("element").each(function(){
            let section = $(this);
            // Determine the type of the element
            switch(section.attr("type")) {
                // Is a simple shape like rectangle, round-rectangle, circle or line
                case "simple":
                    visuObjects.push(parseSimpleShape(section));
                    break;
                // Is a bitmap
                case "bitmap":
                    visuObjects.push(parseBitmap(section));
                    break;
                // Is a button
                case "button":
                    visuObjects.push(parseButton(section));
                    break;
                // Is a polygon - As polygon, polyline or bezier
                case "polygon":
                    visuObjects.push(parsePolyshape(section))
                    break;
                // Is a piechart
                case "piechart":
                    break;
                // Is a group (Dynamic elements like a graph)
                case "group":
                    visuObjects.push(Placeholder(section));
                    break;
                // Is a Scrollbar
                case "scrollbar":
                    visuObjects.push(<Scrollbar section={section}></Scrollbar>);
                    break;
                // Not a supported type, is logged
                case "array-table":
                    visuObjects.push(parseArrayTable(section));
                    break;
                default:
                    console.log("Type <"+section.attr("type")+"> is not supported yet!");
            }
        });
        console.log("XMl-File parsed successfully!");
        // The coverted sections are inserted in the virtual react DOM
        function App() {
            return (
                <React.Fragment>
                    {
                        visuObjects.map((element, index)=><div key={index}>{element}</div>)
                    }
                </React.Fragment>
            )
        }
        // The virtual DOM will be inserted in the DOM. React will update the DOM automatically.
        ReactDOM.render(<App />, document.getElementById("visualisation"));

        return visuObjects;
    }

}