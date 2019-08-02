import * as $ from 'jquery';
import * as ReactDOM from "react-dom";
import {ParseSimpleShape} from './Elements/elementparser';
import * as React from 'react';

export default class HTML5Visu {
    rootDir: string;
    constructor(rootDir: string){
        this.rootDir= rootDir;
    }
    CreateVisu (relPath: string) {
        return $.ajax({
            url: this.rootDir+relPath,
            type: 'GET',
            dataType: 'XML', // if text => no pre-processing, if xml => parseXML preprocessing
            crossDomain: true
        })
        .then((data) => {
            // Searching for elements
            return this.ConvertVisuElements(data);
            }
        )
        .fail((error) => {
            return console.error(error);
        })
    }

    ConvertVisuElements (XML : XMLDocument) : Array<(JSX.Element | undefined)> {
        console.log("Start parsing...");
        let visuXML=$(XML);
        let VisuObjects: Array<(JSX.Element | undefined)> =[];
        // Rip all <element> sections
        visuXML.children("visualisation").children("element").each(function(){
            let section = $(this);
            // Determine the type of the element
            switch(section.attr("type")) {
                // Is a simple shape like rectangle, round-rectangle, circle or line
                case "simple":
                    VisuObjects.push(ParseSimpleShape(section));
                    break;
                // Is a bitmap
                case "bitmap":
                    break;
                // Is a button
                case "button":
                    break;
                // Is a polygon - As polygon, polyline or bezier
                case "polygon":
                    break;
                // Is a piechart
                case "piechart":
                    break;
                // Is a group (Dynamic elements like a graph)
                case "group":
                    break;
                // Is a Scrollbar
                case "scrollbar":
                    break;
                // Not a supported type, is logged
                default:
                    console.log("Type <"+section.attr("type")+"> is not supported yet!");
            }
        });
        console.log("XMl-File parsed successfully!");
        console.dir(VisuObjects);

        function App() {
            let array = [1,2,3,4];
            return (
                array.map((element, index) => (<React.Fragment key={index}> {element} </React.Fragment>))
            )
        }

        ReactDOM.render(<App />, document.getElementById("visualisation"));

        return VisuObjects;
    }

}