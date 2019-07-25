import $ from 'jquery';
import {ParseSimpleShape} from './elementparser';

export default class VisuParser {
    rootDir: string;
    constructor(rootDir: string){
        this.rootDir= rootDir;
    }
    ParseVisu (relPath: string) {
        return $.ajax({
            url: this.rootDir+relPath,
            type: 'GET',
            dataType: 'XML', // if text => no pre-processing, if xml => parseXML preprocessing
            crossDomain: true,
            timeout: 1000,
        })
        .then((data) => {
            // Searching for elements
            return this.GetVisuElements(data);
            }
        )
        .fail((error) => {
            return console.error(error);
        })
    }

    GetVisuElements (XML : XMLDocument) : number {
        console.log("Start parsing...");
        let visuXML=$(XML);
        // Rip all <element> sections
        visuXML.children("visualisation").children("element").each(function(){
            let section = $(this);
            // Determine the type of the element
            switch(section.attr("type")) {
                // Is a simple shape like rectangle, round-rectangle, circle or line
                case "simple":
                    ParseSimpleShape(section);
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
        return 0;
    }
}